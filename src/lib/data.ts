import type { Student, Faculty, Class } from './types';

export const students: Student[] = [
  { id: 'S001', name: 'Alice Johnson', email: 'alice@example.com', avatar: '/avatars/01.png', attendance: { total: 20, attended: 18 } },
  { id: 'S002', name: 'Bob Williams', email: 'bob@example.com', avatar: '/avatars/02.png', attendance: { total: 20, attended: 15 } },
  { id: 'S003', name: 'Charlie Brown', email: 'charlie@example.com', avatar: '/avatars/03.png', attendance: { total: 20, attended: 19 } },
  { id: 'S004', name: 'Diana Miller', email: 'diana@example.com', avatar: '/avatars/04.png', attendance: { total: 20, attended: 20 } },
  { id: 'S005', name: 'Ethan Davis', email: 'ethan@example.com', avatar: '/avatars/05.png', attendance: { total: 20, attended: 12 } },
];

export const faculties: Faculty[] = [
  { id: 'F01', name: 'Dr. Alan Grant', email: 'grant@example.com', avatar: '/avatars/f01.png', classes: ['C01', 'C03'] },
  { id: 'F02', name: 'Dr. Ellie Sattler', email: 'sattler@example.com', avatar: '/avatars/f02.png', classes: ['C02'] },
];

export const classes: Class[] = [
  { id: 'C01', name: 'Computer Science 101', facultyId: 'F01', students: ['S001', 'S002', 'S003'], schedule: { day: 'Monday', startTime: '09:00', endTime: '10:00' } },
  { id: 'C02', name: 'Mathematics 202', facultyId: 'F02', students: ['S001', 'S004', 'S005'], schedule: { day: 'Tuesday', startTime: '11:00', endTime: '12:00' } },
  { id: 'C03', name: 'Advanced Algorithms', facultyId: 'F01', students: ['S002', 'S003', 'S004', 'S005'], schedule: { day: 'Monday', startTime: '14:00', endTime: '15:00' } },
];

export const timetable = {
    Monday: [
        { time: '09:00 - 10:00', class: 'Computer Science 101', faculty: 'Dr. Alan Grant', room: 'A-101' },
        { time: '14:00 - 15:00', class: 'Advanced Algorithms', faculty: 'Dr. Alan Grant', room: 'A-102' },
    ],
    Tuesday: [
        { time: '11:00 - 12:00', class: 'Mathematics 202', faculty: 'Dr. Ellie Sattler', room: 'B-201' },
    ],
    Wednesday: [],
    Thursday: [
        { time: '10:00 - 11:00', class: 'Data Structures', faculty: 'Dr. Alan Grant', room: 'A-101' },
    ],
    Friday: [
        { time: '13:00 - 14:00', class: 'Calculus III', faculty: 'Dr. Ellie Sattler', room: 'B-201' },
    ]
};
