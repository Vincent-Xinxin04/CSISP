// 通用基础类型定义

/**
 * 通用状态枚举
 */
export enum Status {
  /** 活跃/可用/在职/进行中/有效 */
  Active = 1,
  /** 禁用/离职/已结束/无效 */
  Inactive = 0,
}

/**
 * 学期枚举
 */
export enum Semester {
  First = 1,
  Second = 2,
  Third = 3,
  Fourth = 4,
  Fifth = 5,
  Sixth = 6,
  Seventh = 7,
  Eighth = 8,
}

/**
 * 时间戳类型
 */
export type Timestamp = Date;

/**
 * 专业数组类型
 */
export type MajorList = string[];

/**
 * 通用分页参数
 */
export interface PaginationParams {
  page: number;
  size: number;
}

/**
 * 通用分页响应
 */
export interface PaginationResponse<T> {
  data: T[];
  total: number;
  page: number;
  size: number;
  totalPages: number;
}

/**
 * 通用响应结构
 */
export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data?: T;
}

/**
 * 通用时间段
 */
export interface TimeRange {
  startTime: string | Date;
  endTime: string | Date;
}

/**
 * 用户角色类型
 */
export type UserRoleType = 'student' | 'teacher' | 'admin';

/**
 * 星期枚举
 */
export enum WeekDay {
  Monday = 1,
  Tuesday = 2,
  Wednesday = 3,
  Thursday = 4,
  Friday = 5,
  Saturday = 6,
  Sunday = 7,
}
