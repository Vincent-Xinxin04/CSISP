import { Status, Semester } from '@csisp/types';

/**
 * 课程业务模型
 */
export interface Course {
  id: number;
  courseName: string;
  courseCode: string;
  semester: Semester;
  academicYear: number;
  availableMajors: string[];
  status: Status;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * 创建课程的参数
 */
export interface CourseCreateParams {
  courseName: string;
  courseCode: string;
  semester: Semester;
  academicYear: number;
  availableMajors: string[];
  status: Status;
}

/**
 * 更新课程的参数
 */
export interface CourseUpdateParams {
  courseName?: string;
  courseCode?: string;
  semester?: Semester;
  academicYear?: number;
  availableMajors?: string[];
  status?: Status;
}

/**
 * 课程响应数据
 */
export interface CourseResponse {
  id: number;
  courseName: string;
  courseCode: string;
  semester: Semester;
  academicYear: number;
  availableMajors: string[];
  status: Status;
  createdAt: Date;
  updatedAt: Date;
}
