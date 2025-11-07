'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger } from '@/components/ui/sheet';
import { faculties, classes as allClassData, students as allStudentData } from '@/lib/data';
import type { Student } from '@/lib/types';
import { Check, X } from 'lucide-react';

type AttendanceStatus = 'present' | 'absent' | 'unmarked';

export default function FacultyDashboard() {
  const faculty = faculties[0];
  const facultyClasses = allClassData.filter(c => c.facultyId === faculty.id);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  const [attendance, setAttendance] = useState<Record<string, Record<string, AttendanceStatus>>>(() => {
    const initialState: Record<string, Record<string, AttendanceStatus>> = {};
    facultyClasses.forEach(c => {
      initialState[c.id] = {};
      c.students.forEach(studentId => {
        initialState[c.id][studentId] = 'unmarked';
      });
    });
    return initialState;
  });

  const handleMarkAttendance = (classId: string, studentId: string, status: AttendanceStatus) => {
    setAttendance(prev => ({
      ...prev,
      [classId]: {
        ...prev[classId],
        [studentId]: status,
      }
    }));
  };

  const selectedStudentAttendance = selectedStudent ? Math.round((selectedStudent.attendance.attended / selectedStudent.attendance.total) * 100) : 0;

  return (
    <Sheet open={!!selectedStudent} onOpenChange={(open) => !open && setSelectedStudent(null)}>
      <Card>
        <CardHeader>
          <CardTitle>Faculty Dashboard</CardTitle>
          <CardDescription>Welcome, {faculty.name}. Manage your classes and mark attendance here.</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue={facultyClasses[0]?.id}>
            <TabsList>
              {facultyClasses.map(c => (
                <TabsTrigger key={c.id} value={c.id}>{c.name}</TabsTrigger>
              ))}
            </TabsList>
            {facultyClasses.map(c => {
              const classStudents = allStudentData.filter(s => c.students.includes(s.id));
              return (
                <TabsContent key={c.id} value={c.id}>
                  <Card>
                    <CardHeader>
                      <CardTitle>Mark Attendance for {c.name}</CardTitle>
                      <CardDescription>
                        {c.schedule.day}, {c.schedule.startTime} - {c.schedule.endTime}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="border rounded-md">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="w-[80px]">Avatar</TableHead>
                              <TableHead>Student Name</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {classStudents.map(student => {
                              const status = attendance[c.id]?.[student.id] || 'unmarked';
                              return (
                                  <TableRow key={student.id}>
                                      <TableCell>
                                          <Avatar>
                                              <AvatarImage src={`https://placehold.co/40x40.png`} alt={student.name} data-ai-hint="student avatar" />
                                              <AvatarFallback>{student.name.charAt(0)}</AvatarFallback>
                                          </Avatar>
                                      </TableCell>
                                      <TableCell className="font-medium">
                                        <SheetTrigger asChild>
                                          <Button variant="link" className="p-0 h-auto text-left font-medium" onClick={() => setSelectedStudent(student)}>
                                            {student.name}
                                          </Button>
                                        </SheetTrigger>
                                      </TableCell>
                                      <TableCell>
                                      <Badge variant={status === 'present' ? 'default' : status === 'absent' ? 'destructive' : 'secondary'} className={status === 'present' ? 'bg-accent text-accent-foreground' : ''}>
                                          {status.charAt(0).toUpperCase() + status.slice(1)}
                                      </Badge>
                                      </TableCell>
                                      <TableCell className="text-right space-x-2">
                                          <Button
                                              variant={status === 'present' ? 'default' : 'outline'}
                                              size="icon"
                                              className={status === 'present' ? `bg-accent text-accent-foreground hover:bg-accent/80` : ''}
                                              onClick={() => handleMarkAttendance(c.id, student.id, 'present')}
                                          >
                                              <Check className="h-4 w-4" />
                                          </Button>
                                          <Button
                                              variant={status === 'absent' ? 'destructive' : 'outline'}
                                              size="icon"
                                              onClick={() => handleMarkAttendance(c.id, student.id, 'absent')}
                                          >
                                              <X className="h-4 w-4" />
                                          </Button>
                                      </TableCell>
                                  </TableRow>
                              )
                            })}
                          </TableBody>
                        </Table>
                      </div>
                       <div className="flex justify-end mt-4">
                          <Button>Submit Attendance</Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              );
            })}
          </Tabs>
        </CardContent>
      </Card>

      <SheetContent className="sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Student Details</SheetTitle>
          <SheetDescription>Detailed information and attendance for {selectedStudent?.name}.</SheetDescription>
        </SheetHeader>
        {selectedStudent && (
          <div className="py-4 space-y-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={`https://placehold.co/80x80.png`} alt={selectedStudent.name} data-ai-hint="student profile avatar" />
                <AvatarFallback>{selectedStudent.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-xl font-semibold">{selectedStudent.name}</h3>
                <p className="text-sm text-muted-foreground">{selectedStudent.email}</p>
              </div>
            </div>
            <div className="space-y-4">
              <h4 className="font-semibold text-muted-foreground">Overall Attendance</h4>
              <div>
                <div className="flex justify-between mb-1 text-sm">
                    <span>Progress</span>
                    <span className="font-medium">{selectedStudentAttendance}%</span>
                </div>
                <Progress value={selectedStudentAttendance} className={selectedStudentAttendance < 75 ? '[&>div]:bg-destructive' : '[&>div]:bg-primary'} />
              </div>
              <div className="grid grid-cols-2 gap-4 text-center mt-4 pt-4 border-t">
                  <div>
                      <p className="text-3xl font-bold">{selectedStudent.attendance.attended}</p>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider">Attended</p>
                  </div>
                  <div>
                      <p className="text-3xl font-bold">{selectedStudent.attendance.total}</p>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider">Total</p>
                  </div>
              </div>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
