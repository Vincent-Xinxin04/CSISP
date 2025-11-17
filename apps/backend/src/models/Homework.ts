import { Status, Homework as HomeworkType } from '@csisp/types';

export class Homework implements HomeworkType {
  id: number;
  classId: number;
  title: string;
  content: string;
  deadline: Date;
  status: Status;
  createdAt: Date;
  updatedAt: Date;

  constructor(
    id: number,
    classId: number,
    title: string,
    content: string,
    deadline: Date,
    status: Status,
    createdAt: Date = new Date(),
    updatedAt: Date = new Date()
  ) {
    this.id = id;
    this.classId = classId;
    this.title = title;
    this.content = content;
    this.deadline = deadline;
    this.status = status;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }
}

export default Homework;
