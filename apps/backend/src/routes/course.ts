/**
 * 课程相关路由
 * 处理课程管理、班级管理、教师分配等
 */

import Router from '@koa/router';
import { CourseController } from '../controllers/CourseController';
import { jwtAuth, requireAdmin, requireTeacher } from '../middleware/auth';
import { validateRequired, validateIdParam, validatePagination } from '../middleware/validation';

export function createCourseRoutes(courseController: CourseController): Router {
  const router = new Router({ prefix: '/api/courses' });

  /**
   * 创建课程
   * POST /api/courses
   */
  router.post(
    '/',
    jwtAuth(),
    requireAdmin,
    validateRequired(['courseName', 'courseCode', 'semester', 'academicYear', 'availableMajors']),
    async ctx => {
      await courseController.createCourse(ctx);
    }
  );

  /**
   * 为课程分配教师
   * POST /api/courses/:id/teachers
   */
  router.post(
    '/:id/teachers',
    jwtAuth(),
    requireAdmin,
    validateIdParam('id'),
    validateRequired(['teacherIds']),
    async ctx => {
      await courseController.assignTeachers(ctx);
    }
  );

  /**
   * 创建班级
   * POST /api/courses/classes
   */
  router.post(
    '/classes',
    jwtAuth(),
    requireTeacher,
    validateRequired([
      'className',
      'courseId',
      'teacherId',
      'semester',
      'academicYear',
      'maxStudents',
    ]),
    async ctx => {
      await courseController.createClass(ctx);
    }
  );

  /**
   * 创建时间段
   * POST /api/courses/time-slots
   */
  router.post(
    '/time-slots',
    jwtAuth(),
    requireTeacher,
    validateRequired(['subCourseId', 'weekday', 'startTime', 'endTime', 'location']),
    async ctx => {
      await courseController.createTimeSlot(ctx);
    }
  );

  /**
   * 创建子课程
   * POST /api/courses/sub-courses
   */
  router.post(
    '/sub-courses',
    jwtAuth(),
    requireTeacher,
    validateRequired(['courseId', 'subCourseCode', 'teacherId', 'academicYear']),
    async ctx => {
      await courseController.createSubCourse(ctx);
    }
  );

  /**
   * 获取课程列表（支持专业筛选）
   * GET /api/courses?major=计算机科学&semester=1&page=1&size=10
   */
  router.get('/', jwtAuth(), validatePagination(), async ctx => {
    await courseController.getCourses(ctx);
  });

  /**
   * 获取课程详细信息
   * GET /api/courses/:id
   */
  router.get('/:id', jwtAuth(), validateIdParam('id'), async ctx => {
    await courseController.getCourseDetail(ctx);
  });

  /**
   * 获取课程教师列表
   * GET /api/courses/:id/teachers
   */
  router.get('/:id/teachers', jwtAuth(), validateIdParam('id'), async ctx => {
    await courseController.getCourseTeachers(ctx);
  });

  /**
   * 获取课程班级列表
   * GET /api/courses/:id/classes?page=1&size=10
   */
  router.get('/:id/classes', jwtAuth(), validateIdParam('id'), validatePagination(), async ctx => {
    await courseController.getCourseClasses(ctx);
  });

  /**
   * 获取班级详细信息
   * GET /api/courses/classes/:classId
   */
  router.get('/classes/:classId', jwtAuth(), validateIdParam('classId'), async ctx => {
    await courseController.getClassDetail(ctx);
  });

  /**
   * 获取班级学生列表
   * GET /api/courses/classes/:classId/students?page=1&size=10
   */
  router.get(
    '/classes/:classId/students',
    jwtAuth(),
    requireTeacher,
    validateIdParam('classId'),
    validatePagination(),
    async ctx => {
      await courseController.getClassStudents(ctx);
    }
  );

  /**
   * 获取学期课程列表
   * GET /api/courses/semester/:semester?academicYear=2023&page=1&size=10
   */
  router.get(
    '/semester/:semester',
    jwtAuth(),
    validateIdParam('semester'),
    validatePagination(),
    async ctx => {
      await courseController.getCoursesBySemester(ctx);
    }
  );

  /**
   * 获取教师课程列表
   * GET /api/courses/teacher/:teacherId?page=1&size=10
   */
  router.get(
    '/teacher/:teacherId',
    jwtAuth(),
    requireTeacher,
    validateIdParam('teacherId'),
    validatePagination(),
    async ctx => {
      await courseController.getTeacherCourses(ctx);
    }
  );

  return router;
}
