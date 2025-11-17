import { Status, Semester, Class as ClassType } from '@csisp/types';

export class Class implements ClassType {
  id: number;
  className: string;
  courseId: number;
  teacherId: number;
  semester: Semester;
  academicYear: number;
  maxStudents: number;
  status: Status;
  createdAt: Date;
  updatedAt: Date;

  constructor(
    id: number,
    className: string,
    courseId: number,
    teacherId: number,
    semester: Semester,
    academicYear: number,
    maxStudents: number,
    status: Status,
    createdAt: Date = new Date(),
    updatedAt: Date = new Date()
  ) {
    this.id = id;
    this.className = className;
    this.courseId = courseId;
    this.teacherId = teacherId;
    this.semester = semester;
    this.academicYear = academicYear;
    this.maxStudents = maxStudents;
    this.status = status;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }
}

export default Class;
