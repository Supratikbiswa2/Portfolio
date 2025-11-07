
export interface Student {
  id: string;
  name: string;
  email: string;
  avatar: string;
  attendance: {
    total: number;
    attended: number;
  };
}

export interface Faculty {
  id: string;
  name: string;
  email: string;
  avatar: string;
  classes: string[];
}

export interface Class {
  id: string;
  name: string;
  facultyId: string;
  students: string[];
  schedule: {
    day: string;
    startTime: string;
    endTime: string;
  };
}

export interface LoginEntry {
  id: string;
  name: string;
  timestamp: Date;
}
