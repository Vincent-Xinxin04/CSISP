import { HomeworkSubmission as HomeworkSubmissionType } from '@csisp/types';

export class HomeworkSubmission implements HomeworkSubmissionType {
  id: number;
  homeworkId: number;
  userId: number;
  filePath: string;
  fileName?: string;
  content?: string;
  status: string;
  submitTime: Date;
  createdAt: Date;
  updatedAt: Date;

  constructor(
    id: number,
    homeworkId: number,
    userId: number,
    filePath: string,
    status: string = 'submitted',
    submitTime: Date = new Date(),
    createdAt: Date = new Date(),
    updatedAt: Date = new Date(),
    fileName?: string,
    content?: string
  ) {
    this.id = id;
    this.homeworkId = homeworkId;
    this.userId = userId;
    this.filePath = filePath;
    this.status = status;
    this.submitTime = submitTime;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.fileName = fileName;
    this.content = content;
  }
}

export default HomeworkSubmission;
