import { Status, CourseRep as CourseRepType } from '@csisp/types';

export class CourseRep implements CourseRepType {
  id: number;
  userId: number;
  classId: number;
  responsibility: string;
  appointmentDate: Date;
  status: Status;
  createdAt: Date;
  updatedAt: Date;

  constructor(
    id: number,
    userId: number,
    classId: number,
    responsibility: string,
    appointmentDate: Date,
    status: Status,
    createdAt: Date = new Date(),
    updatedAt: Date = new Date()
  ) {
    this.id = id;
    this.userId = userId;
    this.classId = classId;
    this.responsibility = responsibility;
    this.appointmentDate = appointmentDate;
    this.status = status;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }
}

export default CourseRep;
