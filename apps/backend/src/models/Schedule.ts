// Schedule类型定义
export interface ScheduleType {
  id: number;
  classId: number;
  weekday: number;
  timeSlotId: number;
  room: string;
  location: string;
  createdAt: Date;
  updatedAt: Date;
}

export class Schedule implements ScheduleType {
  id: number;
  classId: number;
  weekday: number;
  timeSlotId: number;
  room: string;
  location: string;
  createdAt: Date;
  updatedAt: Date;

  constructor(
    id: number,
    classId: number,
    weekday: number,
    timeSlotId: number,
    room: string,
    location: string,
    createdAt: Date = new Date(),
    updatedAt: Date = new Date()
  ) {
    this.id = id;
    this.classId = classId;
    this.weekday = weekday;
    this.timeSlotId = timeSlotId;
    this.room = room;
    this.location = location;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }
}

export default Schedule;
