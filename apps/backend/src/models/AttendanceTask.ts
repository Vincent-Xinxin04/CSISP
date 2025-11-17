import { Status, AttendanceTask as AttendanceTaskType } from '@csisp/types';

export class AttendanceTask implements AttendanceTaskType {
  id: number;
  classId: number;
  taskName: string;
  taskType: string;
  startTime: Date;
  endTime: Date;
  status: Status;
  createdAt: Date;
  updatedAt: Date;

  constructor(
    id: number,
    classId: number,
    taskName: string,
    taskType: string,
    startTime: Date,
    endTime: Date,
    status: Status,
    createdAt: Date = new Date(),
    updatedAt: Date = new Date()
  ) {
    this.id = id;
    this.classId = classId;
    this.taskName = taskName;
    this.taskType = taskType;
    this.startTime = startTime;
    this.endTime = endTime;
    this.status = status;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }
}

export default AttendanceTask;
