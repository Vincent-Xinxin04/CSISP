import { AttendanceStatus, AttendanceRecord as AttendanceRecordType } from '@csisp/types';

export class AttendanceRecord implements AttendanceRecordType {
  id: number;
  attendanceTaskId: number;
  userId: number;
  status: AttendanceStatus;
  remark: string;
  createdAt: Date;
  updatedAt: Date;

  constructor(
    id: number,
    attendanceTaskId: number,
    userId: number,
    status: AttendanceStatus,
    remark: string,
    createdAt: Date = new Date(),
    updatedAt: Date = new Date()
  ) {
    this.id = id;
    this.attendanceTaskId = attendanceTaskId;
    this.userId = userId;
    this.status = status;
    this.remark = remark;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }
}

export default AttendanceRecord;
