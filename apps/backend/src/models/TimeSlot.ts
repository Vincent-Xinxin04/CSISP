import { Status, TimeSlot as TimeSlotType } from '@csisp/types';

export class TimeSlot implements TimeSlotType {
  id: number;
  subCourseId: number;
  weekday: number;
  startTime: string;
  endTime: string;
  location: string;
  status: Status;
  createdAt: Date;
  updatedAt: Date;

  constructor(
    id: number,
    subCourseId: number,
    weekday: number,
    startTime: string,
    endTime: string,
    location: string,
    status: Status = Status.Active,
    createdAt: Date = new Date(),
    updatedAt: Date = new Date()
  ) {
    this.id = id;
    this.subCourseId = subCourseId;
    this.weekday = weekday;
    this.startTime = startTime;
    this.endTime = endTime;
    this.location = location;
    this.status = status;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }
}

export default TimeSlot;
