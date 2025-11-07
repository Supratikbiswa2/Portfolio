'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { students, faculties, timetable } from '@/lib/data';

const analyticsData = students.map(s => ({
  name: s.name,
  percentage: Math.round((s.attendance.attended / s.attendance.total) * 100),
}));

const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

export default function AdminDashboard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Admin Dashboard</CardTitle>
        <CardDescription>Full administrative control over students, faculty, and system analytics.</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="analytics">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="students">Students</TabsTrigger>
            <TabsTrigger value="faculty">Faculty</TabsTrigger>
            <TabsTrigger value="timetable">Timetable</TabsTrigger>
          </TabsList>
          
          <TabsContent value="analytics" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Student Attendance Analytics</CardTitle>
                <CardDescription>Overall attendance percentages for all students.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analyticsData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} interval={0} />
                      <YAxis domain={[0, 100]} label={{ value: 'Percentage', angle: -90, position: 'insideLeft' }} />
                      <Tooltip cursor={{fill: 'hsl(var(--muted))'}} contentStyle={{backgroundColor: 'hsl(var(--card))'}} />
                      <Legend />
                      <Bar dataKey="percentage" name="Attendance %">
                        {analyticsData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.percentage < 75 ? 'hsl(var(--destructive))' : 'hsl(var(--primary))'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="students" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Manage Students</CardTitle>
                <CardDescription>View and manage all student records.</CardDescription>
              </CardHeader>
              <CardContent>
                <DataTable data={students} type="student" />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="faculty" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Manage Faculty</CardTitle>
                <CardDescription>View and manage all faculty records.</CardDescription>
              </CardHeader>
              <CardContent>
                <DataTable data={faculties} type="faculty" />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="timetable" className="mt-4">
             <Card>
              <CardHeader>
                <CardTitle>Class Timetable</CardTitle>
                <CardDescription>Weekly schedule for all classes.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  {daysOfWeek.map(day => (
                    <div key={day} className="border rounded-lg p-4">
                      <h3 className="font-bold text-center mb-4">{day}</h3>
                      <div className="space-y-2">
                        {(timetable[day as keyof typeof timetable] as any[]).length > 0 ? (
                           (timetable[day as keyof typeof timetable] as any[]).map((session, index) => (
                            <Card key={index} className="p-2 bg-muted">
                              <p className="font-semibold text-sm">{session.class}</p>
                              <p className="text-xs text-muted-foreground">{session.time}</p>
                              <p className="text-xs text-muted-foreground">by {session.faculty}</p>
                              <p className="text-xs text-muted-foreground">Room: {session.room}</p>
                            </Card>
                          ))
                        ) : (
                          <p className="text-sm text-muted-foreground text-center">No classes</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex justify-end mt-4">
                  <Button>Manage Timetable</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

function DataTable({ data, type }: { data: (typeof students[0] | typeof faculties[0])[], type: 'student' | 'faculty' }) {
    return (
        <div className="border rounded-md">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[80px]">Avatar</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        {type === 'student' && <TableHead>Attendance</TableHead>}
                        {type === 'faculty' && <TableHead>Classes Assigned</TableHead>}
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data.map(item => {
                        const isStudent = 'attendance' in item;
                        const percentage = isStudent ? Math.round((item.attendance.attended / item.attendance.total) * 100) : 0;
                        return (
                            <TableRow key={item.id}>
                                <TableCell>
                                    <Avatar>
                                        <AvatarImage src={`https://placehold.co/40x40.png`} alt={item.name} data-ai-hint="user avatar" />
                                        <AvatarFallback>{item.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                </TableCell>
                                <TableCell className="font-medium">{item.name}</TableCell>
                                <TableCell>{item.email}</TableCell>
                                {type === 'student' && isStudent && (
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Progress value={percentage} className="w-24" />
                                            <span className="text-sm text-muted-foreground">{percentage}%</span>
                                        </div>
                                    </TableCell>
                                )}
                                {type === 'faculty' && !isStudent && (
                                    <TableCell>
                                        <Badge variant="secondary">{item.classes.length}</Badge>
                                    </TableCell>
                                )}
                                <TableCell className="text-right">
                                    <Button variant="ghost" size="sm">Edit</Button>
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </div>
    );
}
