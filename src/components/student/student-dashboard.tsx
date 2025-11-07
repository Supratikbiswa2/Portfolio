
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { validateAttendanceConstraints } from '@/ai/flows/attendance-constraint-validation';
import { verifyFace, VerifyFaceOutput } from '@/ai/flows/face-verification';
import { useToast } from '@/hooks/use-toast';
import { Camera, MapPin, Clock, Loader2, CheckCircle, XCircle, AlertTriangle, Bell, ShieldCheck, Users } from 'lucide-react';
import { students } from '@/lib/data';
import { RecentLogins } from './recent-logins';
import type { LoginEntry } from '@/lib/types';


export default function StudentDashboard() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [validationResult, setValidationResult] = useState<VerifyFaceOutput | null>(null);
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const [registeredFaceUri, setRegisteredFaceUri] = useState<string | null>(null);
  const { toast } = useToast();
  const [recentLogins, setRecentLogins] = useState<LoginEntry[]>([]);

  
  const student = students[0]; // Mock current student
  const attendancePercentage = Math.round((student.attendance.attended / student.attendance.total) * 100);
  const missedClasses = student.attendance.total - student.attendance.attended;

  useEffect(() => {
    // Retrieve the registered face URI from localStorage when the component mounts
    const storedFaceUri = localStorage.getItem('registeredFaceDataUri');
    if (storedFaceUri) {
      setRegisteredFaceUri(storedFaceUri);
    } else {
       toast({
        variant: "destructive",
        title: "No Face Registered",
        description: "Please sign up and register your face first.",
      });
    }

    // Load recent logins from localStorage
    const storedLogins = localStorage.getItem('recentLogins');
    if (storedLogins) {
      setRecentLogins(JSON.parse(storedLogins));
    }


    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startCamera = async () => {
    try {
      setPermissionError(null);
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error("Camera access denied:", err);
      setPermissionError("Camera access is required to mark attendance. Please enable it in your browser settings.");
      toast({
        variant: "destructive",
        title: "Camera Access Denied",
        description: "Please allow camera access to continue.",
      });
    }
  };
  
  const captureAndVerify = (): Promise<string | null> => {
    return new Promise((resolve) => {
        if (videoRef.current) {
            const canvas = document.createElement('canvas');
            canvas.width = videoRef.current.videoWidth;
            canvas.height = videoRef.current.videoHeight;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
                resolve(canvas.toDataURL('image/jpeg'));
            } else {
                resolve(null);
            }
        } else {
            resolve(null);
        }
    });
  }

  const handleMarkAttendance = async () => {
    setIsLoading(true);
    setValidationResult(null);

    // This would come from your auth context in a real app
    const currentUserName = localStorage.getItem('studentName') || 'Current Student';


    if (!registeredFaceUri) {
      toast({ variant: 'destructive', title: 'Registration Error', description: 'No registered face found. Please sign up first.' });
      setIsLoading(false);
      return;
    }

    if (!stream) {
      await startCamera();
      // A small delay to ensure camera initializes
      await new Promise(resolve => setTimeout(resolve, 500));
      if (!videoRef.current?.srcObject) {
         setIsLoading(false);
         return;
      }
    }

    const currentFaceDataUri = await captureAndVerify();
    if (!currentFaceDataUri) {
        toast({ variant: 'destructive', title: 'Capture Error', description: 'Could not capture face from camera.' });
        setIsLoading(false);
        return;
    }

    try {
      const faceResult = await verifyFace({
          registeredFaceDataUri: registeredFaceUri,
          currentFaceDataUri: currentFaceDataUri,
      });

      setValidationResult(faceResult);

      if (!faceResult.isMatch) {
        toast({
          title: 'Face Verification Failed',
          description: faceResult.reason || 'Your face did not match the registered profile.',
          variant: 'destructive',
        });
        setIsLoading(false);
        return;
      }

      toast({
        title: 'Face Verified!',
        description: 'Now checking location and time constraints.',
        className: 'bg-accent text-accent-foreground'
      });
      
      const newLogin: LoginEntry = {
          id: new Date().getTime().toString(),
          name: currentUserName,
          timestamp: new Date(),
      };
      setRecentLogins(prevLogins => {
          const updatedLogins = [newLogin, ...prevLogins].slice(0, 5); // Keep last 5
          localStorage.setItem('recentLogins', JSON.stringify(updatedLogins));
          return updatedLogins;
      });

      // If face verification is successful, proceed with location/time validation
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            const locationData = { latitude, longitude };
            const locationDataUri = 'data:application/json;charset=utf-8;base64,' + btoa(JSON.stringify(locationData));
            
            const attendanceInput = {
              studentId: student.id,
              classId: 'C01', // Mock class
              timestamp: new Date().toISOString(),
              locationDataUri,
              scheduledStartTime: '2024-01-01T09:00:00Z', // Mock time
              scheduledEndTime: '2024-01-01T10:00:00Z',
            };
            
            const attendanceResult = await validateAttendanceConstraints(attendanceInput);
            
            toast({
              title: attendanceResult.isValid ? 'Attendance Marked' : 'Attendance Not Marked',
              description: attendanceResult.isValid ? 'Your attendance has been recorded successfully.' : (attendanceResult.reason || 'Could not validate attendance.'),
              variant: attendanceResult.isValid ? 'default' : 'destructive',
              className: attendanceResult.isValid ? 'bg-accent text-accent-foreground' : ''
            });

          } catch (error) {
            console.error('AI validation error:', error);
            toast({ variant: 'destructive', title: 'Error', description: 'An unexpected error occurred during attendance validation.' });
          } finally {
            setIsLoading(false);
          }
        },
        (error) => {
          console.error("Geolocation error:", error);
          toast({ variant: 'destructive', title: 'Location Error', description: 'Could not get your location. Please enable location services.' });
          setIsLoading(false);
        }
      );

    } catch (error) {
      console.error('AI face verification error:', error);
      toast({ variant: 'destructive', title: 'Error', description: 'An unexpected error occurred during face verification.' });
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Camera /> Mark Your Attendance</CardTitle>
            <CardDescription>Position your face clearly in the frame and click "Mark Attendance".</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative aspect-video w-full bg-muted rounded-md overflow-hidden border">
              {permissionError && (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
                  <XCircle className="w-12 h-12 text-destructive mb-2" />
                  <p className="text-destructive font-medium">{permissionError}</p>
                </div>
              )}
              <video ref={videoRef} autoPlay muted playsInline className={`w-full h-full object-cover ${!stream || permissionError ? 'hidden' : 'block'}`}></video>
              {!stream && !permissionError && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <p className="text-muted-foreground">Camera is off</p>
                </div>
              )}
            </div>
            {stream ? (
              <Button onClick={handleMarkAttendance} disabled={isLoading || !registeredFaceUri} className="w-full">
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Camera className="mr-2 h-4 w-4" />}
                {isLoading ? 'Verifying...' : 'Mark Attendance'}
              </Button>
            ) : (
               <Button onClick={startCamera} disabled={!registeredFaceUri} className="w-full">
                <Camera className="mr-2 h-4 w-4" /> Enable Camera
              </Button>
            )}

            {validationResult && (
              <Alert variant={validationResult.isMatch ? 'default' : 'destructive'} className={validationResult.isMatch ? 'bg-accent/30 border-accent' : ''}>
                {validationResult.isMatch ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                <AlertTitle>{validationResult.isMatch ? 'Face Verification Successful' : 'Face Verification Failed'}</AlertTitle>
                <AlertDescription>
                  {validationResult.reason || (validationResult.isMatch ? 'Your face has been successfully verified.' : 'Please try again.')}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
        
        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>Notifications</CardTitle>
                    <CardDescription>Recent updates and alerts.</CardDescription>
                </CardHeader>
                <CardContent>
                    {missedClasses > 0 ? (
                        <div className="flex items-start gap-4 p-4 rounded-lg border bg-muted/50">
                            <Bell className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                            <div>
                                <p className="font-semibold">You have missed {missedClasses} class{missedClasses > 1 && 'es'}.</p>
                                <p className="text-sm text-muted-foreground">
                                Please ensure you attend future classes to meet the requirements.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-start gap-4 p-4 rounded-lg border bg-muted/50">
                           <CheckCircle className="h-5 w-5 text-accent-foreground mt-1 flex-shrink-0" />
                            <div>
                                <p className="font-semibold">All caught up!</p>
                                <p className="text-sm text-muted-foreground">No new notifications. Keep up the great work!</p>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Your Attendance Report</CardTitle>
                    <CardDescription>Overview of your attendance status.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <div className="flex justify-between mb-1">
                            <span className="text-sm font-medium">Attendance</span>
                            <span className="text-sm font-medium">{attendancePercentage}%</span>
                        </div>
                        <Progress value={attendancePercentage} className={attendancePercentage < 75 ? '[&>div]:bg-destructive' : '[&>div]:bg-accent'}/>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-center">
                        <div>
                            <p className="text-2xl font-bold">{student.attendance.attended}</p>
                            <p className="text-xs text-muted-foreground">Classes Attended</p>
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{student.attendance.total}</p>
                            <p className="text-xs text-muted-foreground">Total Classes</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {attendancePercentage < 75 && (
                <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Low Attendance Alert!</AlertTitle>
                    <AlertDescription>
                        Your attendance is below 75%. Please attend classes regularly to avoid consequences.
                    </AlertDescription>
                </Alert>
            )}
        </div>
      </div>
      <RecentLogins logins={recentLogins} />
    </div>
  );

    