/**
 * 考勤控制器
 * 处理考勤相关的HTTP请求，包括考勤任务管理、打卡、统计等
 */
import { AttendanceService } from '../services/AttendanceService';
import { BaseController } from './BaseController';
import { CreateAttendanceTaskInput, AttendanceStatus } from '@csisp/types';
import { AppContext } from '../types/context';

export class AttendanceController extends BaseController {
  private attendanceService: AttendanceService;

  constructor(attendanceService: AttendanceService) {
    super();
    this.attendanceService = attendanceService;
  }

  /**
   * 创建考勤任务
   * POST /api/attendance/tasks
   * @param ctx Koa上下文
   */
  async createAttendanceTask(ctx: AppContext): Promise<void> {
    try {
      const taskData: CreateAttendanceTaskInput = ctx.request.body as CreateAttendanceTaskInput;

      // 验证必填参数
      const requiredParams = ['classId', 'taskName', 'taskType', 'startTime', 'endTime'];
      if (!this.validateRequiredParams(ctx, requiredParams, taskData)) {
        return;
      }

      const result = await this.attendanceService.createAttendanceTask(taskData);
      this.handleServiceResponse(ctx, result);
    } catch {
      this.serverError(ctx, '创建考勤任务失败');
    }
  }

  /**
   * 学生打卡
   * POST /api/attendance/checkin
   * @param ctx Koa上下文
   */
  async checkIn(ctx: AppContext): Promise<void> {
    try {
      const { taskId, status, remark } = ctx.request.body as {
        taskId: number;
        status?: AttendanceStatus;
        remark?: string;
      };

      // 验证必填参数
      if (!taskId) {
        this.error(ctx, '考勤任务ID不能为空', 400);
        return;
      }

      // 获取当前用户ID
      const userId = ctx.userId || ctx.state.userId;
      if (!userId) {
        this.unauthorized(ctx, '未登录或登录已过期');
        return;
      }

      const result = await this.attendanceService.checkIn(taskId, userId, status, remark);
      this.handleServiceResponse(ctx, result);
    } catch {
      this.serverError(ctx, '打卡失败');
    }
  }

  /**
   * 获取班级的考勤任务
   * GET /api/attendance/tasks/class/:classId?page=1&size=10
   * @param ctx Koa上下文
   */
  async getClassAttendanceTasks(ctx: AppContext): Promise<void> {
    try {
      const classId = parseInt(ctx.params.classId);
      if (isNaN(classId)) {
        this.error(ctx, '班级ID必须是数字', 400);
        return;
      }

      // 验证分页参数
      const pagination = this.validatePagination(ctx, ctx.query);

      const result = await this.attendanceService.getClassAttendanceTasks(classId, pagination);
      this.handleServiceResponse(ctx, result);
    } catch {
      this.serverError(ctx, '获取班级考勤任务失败');
    }
  }

  /**
   * 获取考勤任务的打卡记录
   * GET /api/attendance/tasks/:taskId/records?page=1&size=10
   * @param ctx Koa上下文
   */
  async getAttendanceRecords(ctx: AppContext): Promise<void> {
    try {
      const taskId = parseInt(ctx.params.taskId);
      if (isNaN(taskId)) {
        this.error(ctx, '考勤任务ID必须是数字', 400);
        return;
      }

      // 验证分页参数
      const pagination = this.validatePagination(ctx, ctx.query);

      const result = await this.attendanceService.getAttendanceRecords(taskId, pagination);
      this.handleServiceResponse(ctx, result);
    } catch {
      this.serverError(ctx, '获取打卡记录失败');
    }
  }

  /**
   * 获取学生的考勤统计
   * GET /api/attendance/stats/student/:userId?classId=1
   * @param ctx Koa上下文
   */
  async getStudentAttendanceStats(ctx: AppContext): Promise<void> {
    try {
      const userId = parseInt(ctx.params.userId);
      if (isNaN(userId)) {
        this.error(ctx, '用户ID必须是数字', 400);
        return;
      }

      const classId = ctx.query.classId ? parseInt(ctx.query.classId as string) : undefined;
      if (classId && isNaN(classId)) {
        this.error(ctx, '班级ID必须是数字', 400);
        return;
      }

      const result = await this.attendanceService.getStudentAttendanceStats(userId, classId);
      this.handleServiceResponse(ctx, result);
    } catch {
      this.serverError(ctx, '获取学生考勤统计失败');
    }
  }

  /**
   * 获取班级的考勤统计
   * GET /api/attendance/stats/class/:classId
   * @param ctx Koa上下文
   */
  async getClassAttendanceStats(ctx: AppContext): Promise<void> {
    try {
      const classId = parseInt(ctx.params.classId);
      if (isNaN(classId)) {
        this.error(ctx, '班级ID必须是数字', 400);
        return;
      }

      const result = await this.attendanceService.getClassAttendanceStats(classId);
      this.handleServiceResponse(ctx, result);
    } catch {
      this.serverError(ctx, '获取班级考勤统计失败');
    }
  }

  /**
   * 更新考勤记录
   * PUT /api/attendance/records/:recordId
   * @param ctx Koa上下文
   */
  async updateAttendanceRecord(ctx: AppContext): Promise<void> {
    try {
      const recordId = parseInt(ctx.params.recordId);
      if (isNaN(recordId)) {
        this.error(ctx, '记录ID必须是数字', 400);
        return;
      }

      const { status, remark } = ctx.request.body as {
        status?: AttendanceStatus;
        remark?: string;
      };

      if (!status && !remark) {
        this.error(ctx, '必须提供状态或备注', 400);
        return;
      }

      const updateData: any = {};
      if (status) updateData.status = status;
      if (remark !== undefined) updateData.remark = remark;

      const result = await this.attendanceService.updateAttendanceRecord(recordId, updateData);
      this.handleServiceResponse(ctx, result);
    } catch {
      this.serverError(ctx, '更新考勤记录失败');
    }
  }

  /**
   * 获取当前活跃的考勤任务
   * GET /api/attendance/tasks/active?classId=1
   * @param ctx Koa上下文
   */
  async getActiveAttendanceTasks(ctx: AppContext): Promise<void> {
    try {
      const classId = ctx.query.classId ? parseInt(ctx.query.classId as string) : undefined;
      if (classId && isNaN(classId)) {
        this.error(ctx, '班级ID必须是数字', 400);
        return;
      }

      const result = await this.attendanceService.getActiveAttendanceTasks(classId);
      this.handleServiceResponse(ctx, result);
    } catch {
      this.serverError(ctx, '获取活跃考勤任务失败');
    }
  }

  /**
   * 获取活跃考勤任务（别名）
   */
  async getActiveTasks(ctx: AppContext): Promise<void> {
    await this.getActiveAttendanceTasks(ctx);
  }

  /**
   * 获取学生打卡记录（占位实现）
   */
  async getStudentAttendanceRecords(ctx: AppContext): Promise<void> {
    this.error(ctx, '暂不支持该查询', 400);
  }

  /**
   * 批量更新考勤记录（占位实现）
   */
  async batchUpdateAttendanceRecords(ctx: AppContext): Promise<void> {
    this.error(ctx, '暂不支持批量更新', 400);
  }

  /**
   * 导出考勤数据（占位实现）
   */
  async exportAttendanceData(ctx: AppContext): Promise<void> {
    this.error(ctx, '暂不支持数据导出', 400);
  }
}
