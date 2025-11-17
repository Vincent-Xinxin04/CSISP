/**
 * 考勤相关路由
 * 处理考勤任务、打卡、统计等
 */

import Router from '@koa/router';
import { AttendanceController } from '../controllers/AttendanceController';
import { jwtAuth, requireTeacher, requireStudent } from '../middleware/auth';
import { validateRequired, validateIdParam, validatePagination } from '../middleware/validation';

export function createAttendanceRoutes(attendanceController: AttendanceController): Router {
  const router = new Router({ prefix: '/api/attendance' });

  /**
   * 创建考勤任务
   * POST /api/attendance/tasks
   */
  router.post(
    '/tasks',
    jwtAuth(),
    requireTeacher,
    validateRequired(['classId', 'taskName', 'taskType', 'startTime', 'endTime']),
    async (ctx: AppContext, _next: Next) => {
      await attendanceController.createAttendanceTask(ctx);
    }
  );

  /**
   * 学生打卡
   * POST /api/attendance/checkin
   */
  router.post(
    '/checkin',
    jwtAuth(),
    requireStudent,
    validateRequired(['taskId']),
    async (ctx: AppContext, _next: Next) => {
      await attendanceController.checkIn(ctx);
    }
  );

  /**
   * 获取班级的考勤任务
   * GET /api/attendance/tasks/class/:classId?page=1&size=10
   */
  router.get(
    '/tasks/class/:classId',
    jwtAuth(),
    validateIdParam('classId'),
    validatePagination(),
    async (ctx: AppContext, _next: Next) => {
      await attendanceController.getClassAttendanceTasks(ctx);
    }
  );

  /**
   * 获取考勤任务的打卡记录
   * GET /api/attendance/tasks/:taskId/records?page=1&size=10
   */
  router.get(
    '/tasks/:taskId/records',
    jwtAuth(),
    validateIdParam('taskId'),
    validatePagination(),
    async (ctx: AppContext, _next: Next) => {
      await attendanceController.getAttendanceRecords(ctx);
    }
  );

  /**
   * 获取学生的考勤统计
   * GET /api/attendance/stats/student/:userId?classId=1
   */
  router.get(
    '/stats/student/:userId',
    jwtAuth(),
    validateIdParam('userId'),
    async (ctx: AppContext, _next: Next) => {
      await attendanceController.getStudentAttendanceStats(ctx);
    }
  );

  /**
   * 获取班级的考勤统计
   * GET /api/attendance/stats/class/:classId
   */
  router.get(
    '/stats/class/:classId',
    jwtAuth(),
    requireTeacher,
    validateIdParam('classId'),
    async (ctx: AppContext, _next: Next) => {
      await attendanceController.getClassAttendanceStats(ctx);
    }
  );

  /**
   * 更新考勤记录
   * PUT /api/attendance/records/:recordId
   */
  router.put(
    '/records/:recordId',
    jwtAuth(),
    requireTeacher,
    validateIdParam('recordId'),
    async ctx => {
      await attendanceController.updateAttendanceRecord(ctx);
    }
  );

  /**
   * 获取活跃的考勤任务
   * GET /api/attendance/active-tasks?classId=1
   */
  router.get('/active-tasks', jwtAuth(), async ctx => {
    await attendanceController.getActiveTasks(ctx);
  });

  /**
   * 获取学生的打卡记录
   * GET /api/attendance/student/:userId/records?classId=1&page=1&size=10
   */
  router.get(
    '/student/:userId/records',
    jwtAuth(),
    validateIdParam('userId'),
    validatePagination(),
    async ctx => {
      await attendanceController.getStudentAttendanceRecords(ctx);
    }
  );

  /**
   * 批量更新考勤记录
   * PUT /api/attendance/records/batch
   */
  router.put(
    '/records/batch',
    jwtAuth(),
    requireTeacher,
    validateRequired(['recordIds', 'status']),
    async ctx => {
      await attendanceController.batchUpdateAttendanceRecords(ctx);
    }
  );

  /**
   * 导出考勤数据
   * GET /api/attendance/export?classId=1&startDate=2024-01-01&endDate=2024-01-31
   */
  router.get('/export', jwtAuth(), requireTeacher, async ctx => {
    await attendanceController.exportAttendanceData(ctx);
  });

  return router;
}
