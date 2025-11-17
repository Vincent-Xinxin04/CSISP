/**
 * 作业相关路由
 * 处理作业发布、提交、批改等
 */

import Router from '@koa/router';
import { HomeworkController } from '../controllers/HomeworkController';
import { jwtAuth, requireTeacher, requireStudent } from '../middlewares/auth';
import { validateRequired, validateIdParam, validatePagination } from '../middlewares/validation';

export function createHomeworkRoutes(homeworkController: HomeworkController): Router {
  const router = new Router({ prefix: '/api/homework' });

  /**
   * 发布作业
   * POST /api/homework
   */
  router.post(
    '/',
    jwtAuth(),
    requireTeacher,
    validateRequired(['classId', 'title', 'content', 'deadline']),
    async ctx => {
      await homeworkController.createHomework(ctx);
    }
  );

  /**
   * 提交作业
   * POST /api/homework/submit
   */
  router.post(
    '/submit',
    jwtAuth(),
    requireStudent,
    validateRequired(['homeworkId', 'userId']),
    async ctx => {
      await homeworkController.submitHomework(ctx);
    }
  );

  /**
   * 获取班级的作业列表
   * GET /api/homework/class/:classId?page=1&size=10
   */
  router.get(
    '/class/:classId',
    jwtAuth(),
    validateIdParam('classId'),
    validatePagination(),
    async ctx => {
      await homeworkController.getClassHomeworks(ctx);
    }
  );

  /**
   * 获取学生的作业提交情况
   * GET /api/homework/student/:userId?classId=1
   */
  router.get('/student/:userId', jwtAuth(), validateIdParam('userId'), async ctx => {
    await homeworkController.getStudentSubmissions(ctx);
  });

  /**
   * 批改作业
   * PUT /api/homework/grade
   */
  router.put(
    '/grade',
    jwtAuth(),
    requireTeacher,
    validateRequired(['submissionId', 'score']),
    async ctx => {
      await homeworkController.gradeHomework(ctx);
    }
  );

  /**
   * 获取作业的提交情况
   * GET /api/homework/:homeworkId/submissions?page=1&size=10
   */
  router.get(
    '/:homeworkId/submissions',
    jwtAuth(),
    requireTeacher,
    validateIdParam('homeworkId'),
    validatePagination(),
    async ctx => {
      await homeworkController.getHomeworkSubmissions(ctx);
    }
  );

  /**
   * 获取作业统计信息
   * GET /api/homework/:homeworkId/stats
   */
  router.get(
    '/:homeworkId/stats',
    jwtAuth(),
    requireTeacher,
    validateIdParam('homeworkId'),
    async ctx => {
      await homeworkController.getHomeworkStats(ctx);
    }
  );

  /**
   * 更新作业信息
   * PUT /api/homework/:homeworkId
   */
  router.put(
    '/:homeworkId',
    jwtAuth(),
    requireTeacher,
    validateIdParam('homeworkId'),
    async ctx => {
      await homeworkController.updateHomework(ctx);
    }
  );

  /**
   * 删除作业
   * DELETE /api/homework/:homeworkId
   */
  router.delete(
    '/:homeworkId',
    jwtAuth(),
    requireTeacher,
    validateIdParam('homeworkId'),
    async ctx => {
      await homeworkController.deleteHomework(ctx);
    }
  );

  /**
   * 获取作业详细信息
   * GET /api/homework/:homeworkId
   */
  router.get('/:homeworkId', jwtAuth(), validateIdParam('homeworkId'), async ctx => {
    await homeworkController.getHomeworkDetail(ctx);
  });

  /**
   * 获取学生的作业详情
   * GET /api/homework/:homeworkId/student/:userId
   */
  router.get(
    '/:homeworkId/student/:userId',
    jwtAuth(),
    validateIdParam('homeworkId'),
    validateIdParam('userId'),
    async ctx => {
      await homeworkController.getStudentHomeworkDetail(ctx);
    }
  );

  return router;
}
