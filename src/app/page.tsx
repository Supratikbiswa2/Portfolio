
'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { ArrowRight, ShieldCheck, UserCheck, UserCog, Camera, CheckCircle } from 'lucide-react';
import Link from 'next/link';

const loginSchema = z.object({
  email: z.string().email({ message: 'Invalid email address.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
});

const signupSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Invalid email address.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
});

export default function Home() {
  const [open, setOpen] = useState(false);
  const [signupStep, setSignupStep] = useState<'details' | 'face'>('details');
  const [faceDataUri, setFaceDataUri] = useState<string | null>(null);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isStudentRegistered, setIsStudentRegistered] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { toast } = useToast();
  const router = useRouter();

  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const signupForm = useForm<z.infer<typeof signupSchema>>({
    resolver: zodResolver(signupSchema),
    defaultValues: { name: '', email: '', password: '' },
  });

  useEffect(() => {
    // Check if student face data exists in local storage
    const storedFace = localStorage.getItem('registeredFaceDataUri');
    setIsStudentRegistered(!!storedFace);
  }, []);
  
  const stopCamera = useCallback(() => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setIsCameraOn(false);
    }
  }, []);

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      stopCamera();
      setSignupStep('details');
      setFaceDataUri(null);
    }
  }

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCameraOn(true);
      }
    } catch (err) {
      console.error("Camera access denied:", err);
      toast({
        variant: "destructive",
        title: "Camera Access Denied",
        description: "Please enable camera access for face registration.",
      });
    }
  };

  const captureFace = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const dataUri = canvas.toDataURL('image/jpeg');
        setFaceDataUri(dataUri);
        stopCamera();
        toast({
            title: "Face Captured!",
            description: "Your facial data has been registered.",
            className: 'bg-accent text-accent-foreground'
        })
      }
    }
  };

  const onLoginSubmit = (values: z.infer<typeof loginSchema>) => {
    console.log('Login values:', values);
    toast({
      title: 'Login Successful',
      description: 'Redirecting to your dashboard...',
    });
    // For demonstration, route based on a mock role.
    // In a real app, you'd get the role from your auth system.
    if (values.email.includes('admin')) {
      router.push('/admin');
    } else if (values.email.includes('faculty')) {
        router.push('/faculty');
    }
    else {
      router.push('/student');
    }
    handleOpenChange(false);
  };

  const onSignupSubmit = (values: z.infer<typeof signupSchema>) => {
    console.log('Signup values:', values);
    // Store student name to be used on the dashboard
    localStorage.setItem('studentName', values.name);
    setSignupStep('face');
  };

  const onFinalSignupSubmit = () => {
     if (!faceDataUri) {
       toast({
         variant: 'destructive',
         title: 'Face data required',
         description: 'Please capture your face to complete signup.',
       });
       return;
     }
     console.log('Final Signup with face data:', { ...signupForm.getValues(), faceDataUri: '...' });
     // Store the registered face in localStorage to be used on the student page
     localStorage.setItem('registeredFaceDataUri', faceDataUri);
     setIsStudentRegistered(true);
     
     toast({
       title: 'Signup Successful',
       description: 'Your account has been created. Please log in.',
     });
     handleOpenChange(false);
  };


  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4 sm:p-6 md:p-8">
      <header className="text-center mb-12">
        <h1 className="font-headline text-5xl md:text-7xl font-bold text-primary tracking-tighter">
          SmartSched
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground mt-2 max-w-2xl mx-auto">
          Seamlessly manage student attendance with our intelligent, secure, and
          easy-to-use platform.
        </p>
        <Dialog open={open} onOpenChange={handleOpenChange}>
          <DialogTrigger asChild>
            <div className="mt-8 flex gap-4 justify-center">
              <Button size="lg">Login</Button>
              <Button size="lg" variant="outline">Sign Up</Button>
            </div>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>
              <TabsContent value="login">
                <DialogHeader>
                  <DialogTitle>Login</DialogTitle>
                  <DialogDescription>
                    Access your account to view your dashboard.
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <Form {...loginForm}>
                    <form
                      onSubmit={loginForm.handleSubmit(onLoginSubmit)}
                      className="space-y-4"
                    >
                      <FormField
                        control={loginForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="name@example.com"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={loginForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              <Input
                                type="password"
                                placeholder="••••••••"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button type="submit" className="w-full">
                        Login
                      </Button>
                    </form>
                  </Form>
                </div>
              </TabsContent>
              <TabsContent value="signup">
                {signupStep === 'details' && (
                  <>
                    <DialogHeader>
                      <DialogTitle>Sign Up - Step 1</DialogTitle>
                      <DialogDescription>
                        Create an account to get started.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                      <Form {...signupForm}>
                        <form
                          onSubmit={signupForm.handleSubmit(onSignupSubmit)}
                          className="space-y-4"
                        >
                          <FormField
                            control={signupForm.control}
                            name="name"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Name</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="Your Name"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={signupForm.control}
                            name="email"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="name@example.com"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={signupForm.control}
                            name="password"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Password</FormLabel>
                                <FormControl>
                                  <Input
                                    type="password"
                                    placeholder="••••••••"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <Button type="submit" className="w-full">
                            Next: Capture Face
                          </Button>
                        </form>
                      </Form>
                    </div>
                  </>
                )}
                {signupStep === 'face' && (
                   <>
                    <DialogHeader>
                        <DialogTitle>Sign Up - Step 2</DialogTitle>
                        <DialogDescription>
                        Register your face for attendance verification.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4 space-y-4">
                       <div className="relative aspect-video w-full bg-muted rounded-md overflow-hidden border">
                          <video ref={videoRef} autoPlay muted playsInline className={`w-full h-full object-cover ${!isCameraOn ? 'hidden' : 'block'}`}></video>
                          {!isCameraOn && !faceDataUri && (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <p className="text-muted-foreground">Camera is off</p>
                            </div>
                          )}
                           {faceDataUri && (
                             <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80">
                                <CheckCircle className="w-16 h-16 text-accent mb-4"/>
                                <p className="text-accent-foreground font-semibold">Face Registered!</p>
                             </div>
                           )}
                        </div>
                        
                        {!isCameraOn && !faceDataUri && (
                            <Button onClick={startCamera} className="w-full">
                                <Camera className="mr-2"/> Enable Camera
                            </Button>
                        )}

                        {isCameraOn && !faceDataUri && (
                            <Button onClick={captureFace} className="w-full">
                                <Camera className="mr-2"/> Capture Face
                            </Button>
                        )}

                        <div className="flex gap-2">
                            <Button variant="outline" onClick={() => setSignupStep('details')} className="w-full">Back</Button>
                            <Button onClick={onFinalSignupSubmit} disabled={!faceDataUri} className="w-full">
                                Complete Sign Up
                            </Button>
                        </div>
                    </div>
                   </>
                )}
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      </header>

      <main className="w-full max-w-5xl mt-8">
        <div className="text-center mb-8">
          <h2 className="font-headline text-3xl font-semibold">
            Choose Your Role
          </h2>
          <p className="text-muted-foreground">
            Select your dashboard to get started.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <RoleCard
            href="/admin"
            icon={<UserCog className="w-10 h-10 text-primary" />}
            title="Admin"
            description="Oversee the entire system, manage users, and view analytics."
          />
          <RoleCard
            href="/faculty"
            icon={<UserCheck className="w-10 h-10 text-primary" />}
            title="Faculty"
            description="Mark attendance, manage your classes, and track student progress."
          />
          <RoleCard
            href="/student"
            icon={<ShieldCheck className="w-10 h-10 text-primary" />}
            title="Student"
            description="Mark your attendance with Face ID and view your personal records."
            isStudentRegistered={isStudentRegistered}
          />
        </div>
      </main>

      <footer className="mt-12 text-center text-muted-foreground text-sm">
        <p>&copy; {new Date().getFullYear()} SmartSched. All Rights Reserved.</p>
      </footer>
    </div>
  );
}

interface RoleCardProps {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  isStudentRegistered?: boolean;
}

function RoleCard({ href, icon, title, description, isStudentRegistered = false }: RoleCardProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow duration-300 flex flex-col">
      <CardHeader className="items-center text-center">
        {icon}
        <CardTitle className="text-2xl font-bold mt-4">{title}</CardTitle>

        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow flex items-end">
        <Button asChild className="w-full">
          <Link href={href}>
            {title === "Student" && isStudentRegistered ? 'Go to Your Dashboard' : 'Go to Dashboard'} <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
