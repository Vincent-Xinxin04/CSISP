import { Status } from '@csisp/types';

/**
 * 用户业务模型
 * 表示系统中的用户实体，包含用户的核心属性和业务逻辑
 */
export interface User {
  id: number;
  username: string;
  password: string;
  studentId: string;
  enrollmentYear: number;
  major: string;
  realName: string;
  status: Status;
  createdAt?: Date;
  updatedAt?: Date;
  roles?: string[];
}

/**
 * 用户创建参数
 * 用于创建新用户时的参数验证和传递
 */
export interface UserCreateParams {
  username: string;
  password: string;
  studentId: string;
  enrollmentYear: number;
  major: string;
  realName: string;
  status?: Status;
}

/**
 * 用户更新参数
 * 用于更新用户信息时的参数验证和传递
 */
export interface UserUpdateParams {
  username?: string;
  password?: string;
  studentId?: string;
  enrollmentYear?: number;
  major?: string;
  realName?: string;
  status?: Status;
}

/**
 * 用户响应数据
 * 用于API响应中返回的用户数据格式
 */
export interface UserResponse {
  id: number;
  username: string;
  studentId: string;
  enrollmentYear: number;
  major: string;
  realName: string;
  status: Status;
  createdAt: Date;
  updatedAt: Date;
  roles: string[];
}
