import { Status, SemesterConfig } from '@csisp/types';

export class AcademicConfig implements SemesterConfig {
  id: number;
  year: string;
  semester: 1 | 2;
  startDate: Date;
  endDate: Date;
  isCurrent: boolean;
  status: Status;
  createdAt: Date;
  updatedAt: Date;

  constructor(
    id: number,
    year: string,
    semester: 1 | 2,
    startDate: Date,
    endDate: Date,
    isCurrent: boolean = false,
    status: Status = Status.Active,
    createdAt: Date = new Date(),
    updatedAt: Date = new Date()
  ) {
    this.id = id;
    this.year = year;
    this.semester = semester;
    this.startDate = startDate;
    this.endDate = endDate;
    this.isCurrent = isCurrent;
    this.status = status;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }
}

export default AcademicConfig;
