import { Status, Teacher as TeacherType } from '@csisp/types';

export class Teacher implements TeacherType {
  id: number;
  userId: number;
  teacherId: string;
  realName: string;
  email: string;
  phone: string;
  department: string;
  title: string;
  status: Status;
  createdAt: Date;
  updatedAt: Date;

  constructor(
    id: number,
    userId: number,
    teacherId: string,
    realName: string,
    email: string,
    phone: string,
    department: string,
    title: string,
    status: Status = Status.Active,
    createdAt: Date = new Date(),
    updatedAt: Date = new Date()
  ) {
    this.id = id;
    this.userId = userId;
    this.teacherId = teacherId;
    this.realName = realName;
    this.email = email;
    this.phone = phone;
    this.department = department;
    this.title = title;
    this.status = status;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }
}

export default Teacher;
