/**
 * 作业控制器
 * 处理作业相关的HTTP请求，包括作业发布、提交、批改等
 */
import { AppContext } from '../types/context';
import { HomeworkService } from '../services/HomeworkService';
import { BaseController } from './BaseController';
import { CreateHomeworkInput, CreateHomeworkSubmissionInput, Status } from '@csisp/types';

export class HomeworkController extends BaseController {
  private homeworkService: HomeworkService;

  constructor(homeworkService: HomeworkService) {
    super();
    this.homeworkService = homeworkService;
  }

  /**
   * 发布作业
   * POST /api/homework
   * @param ctx Koa上下文
   */
  async createHomework(ctx: AppContext): Promise<void> {
    try {
      const homeworkData: CreateHomeworkInput = ctx.request.body as CreateHomeworkInput;

      // 验证必填参数
      const requiredParams = ['classId', 'title', 'content', 'deadline'];
      if (!this.validateRequiredParams(ctx, requiredParams, homeworkData)) {
        return;
      }

      const result = await this.homeworkService.createHomework(homeworkData);
      this.handleServiceResponse(ctx, result);
    } catch {
      this.serverError(ctx, '发布作业失败');
    }
  }

  /**
   * 提交作业
   * POST /api/homework/submit
   * @param ctx Koa上下文
   */
  async submitHomework(ctx: AppContext): Promise<void> {
    try {
      const submissionData: CreateHomeworkSubmissionInput = ctx.request
        .body as CreateHomeworkSubmissionInput;

      // 验证必填参数
      const requiredParams = ['homeworkId', 'userId'];
      if (!this.validateRequiredParams(ctx, requiredParams, submissionData)) {
        return;
      }

      // 获取文件上传信息（如果有）
      const fileData = ctx.request.files?.file;
      let fileInfo = undefined;

      if (fileData) {
        // 假设文件上传中间件已经处理了文件并提供了文件信息
        const file = Array.isArray(fileData) ? fileData[0] : fileData;
        fileInfo = {
          fileName: file.originalname || file.name,
          filePath: file.path || file.filepath,
          fileSize: file.size,
          fileType: file.mimetype || file.type,
        };
      }

      const result = await this.homeworkService.submitHomework(submissionData, fileInfo);
      this.handleServiceResponse(ctx, result);
    } catch {
      this.serverError(ctx, '提交作业失败');
    }
  }

  /**
   * 获取班级的作业列表
   * GET /api/homework/class/:classId?page=1&size=10
   * @param ctx Koa上下文
   */
  async getClassHomeworks(ctx: AppContext): Promise<void> {
    try {
      const classId = parseInt(ctx.params.classId);
      if (isNaN(classId)) {
        this.error(ctx, '班级ID必须是数字', 400);
        return;
      }

      // 验证分页参数
      const pagination = this.validatePagination(ctx, ctx.query);

      const result = await this.homeworkService.getClassHomeworks(classId, pagination);
      this.handleServiceResponse(ctx, result);
    } catch {
      this.serverError(ctx, '获取班级作业列表失败');
    }
  }

  /**
   * 获取学生的作业提交情况
   * GET /api/homework/student/:userId?classId=1
   * @param ctx Koa上下文
   */
  async getStudentSubmissions(ctx: AppContext): Promise<void> {
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

      const result = await this.homeworkService.getStudentSubmissions(userId, classId);
      this.handleServiceResponse(ctx, result);
    } catch {
      this.serverError(ctx, '获取学生作业提交情况失败');
    }
  }

  /**
   * 批改作业
   * PUT /api/homework/grade
   * @param ctx Koa上下文
   */
  async gradeHomework(ctx: AppContext): Promise<void> {
    try {
      const { submissionId, score, comment } = ctx.request.body as {
        submissionId: number;
        score: number;
        comment?: string;
      };

      // 验证必填参数
      if (!submissionId || score === undefined) {
        this.error(ctx, '提交ID和分数不能为空', 400);
        return;
      }

      if (score < 0 || score > 100) {
        this.error(ctx, '分数必须在0-100之间', 400);
        return;
      }

      const result = await this.homeworkService.gradeHomework(submissionId, score, comment);
      this.handleServiceResponse(ctx, result);
    } catch {
      this.serverError(ctx, '批改作业失败');
    }
  }

  /**
   * 获取作业的提交情况
   * GET /api/homework/:homeworkId/submissions?page=1&size=10
   * @param ctx Koa上下文
   */
  async getHomeworkSubmissions(ctx: AppContext): Promise<void> {
    try {
      const homeworkId = parseInt(ctx.params.homeworkId);
      if (isNaN(homeworkId)) {
        this.error(ctx, '作业ID必须是数字', 400);
        return;
      }

      // 验证分页参数
      const pagination = this.validatePagination(ctx, ctx.query);

      const result = await this.homeworkService.getHomeworkSubmissions(homeworkId, pagination);
      this.handleServiceResponse(ctx, result);
    } catch {
      this.serverError(ctx, '获取作业提交情况失败');
    }
  }

  /**
   * 获取作业统计信息
   * GET /api/homework/:homeworkId/stats
   * @param ctx Koa上下文
   */
  async getHomeworkStats(ctx: AppContext): Promise<void> {
    try {
      const homeworkId = parseInt(ctx.params.homeworkId);
      if (isNaN(homeworkId)) {
        this.error(ctx, '作业ID必须是数字', 400);
        return;
      }

      const result = await this.homeworkService.getHomeworkStats(homeworkId);
      this.handleServiceResponse(ctx, result);
    } catch {
      this.serverError(ctx, '获取作业统计信息失败');
    }
  }

  /**
   * 更新作业状态
   * PUT /api/homework/:homeworkId/status
   * @param ctx Koa上下文
   */
  async updateHomeworkStatus(ctx: AppContext): Promise<void> {
    try {
      const homeworkId = parseInt(ctx.params.homeworkId);
      if (isNaN(homeworkId)) {
        this.error(ctx, '作业ID必须是数字', 400);
        return;
      }

      const { status } = ctx.request.body as { status: Status };

      if (status !== Status.Active && status !== Status.Inactive) {
        this.error(ctx, '状态必须是0(禁用)或1(启用)', 400);
        return;
      }

      const result = await this.homeworkService.updateHomeworkStatus(homeworkId, status);
      this.handleServiceResponse(ctx, result);
    } catch {
      this.serverError(ctx, '更新作业状态失败');
    }
  }

  /**
   * 更新作业信息
   * PUT /api/homework/:homeworkId
   */
  async updateHomework(ctx: AppContext): Promise<void> {
    try {
      const homeworkId = parseInt(ctx.params.homeworkId);
      if (isNaN(homeworkId)) {
        this.error(ctx, '作业ID必须是数字', 400);
        return;
      }

      const updateData = ctx.request.body as Partial<CreateHomeworkInput>;
      const result = await this.homeworkService.update(homeworkId, updateData);
      this.handleServiceResponse(ctx, result);
    } catch {
      this.serverError(ctx, '更新作业失败');
    }
  }

  /**
   * 删除作业
   * DELETE /api/homework/:homeworkId
   */
  async deleteHomework(ctx: AppContext): Promise<void> {
    try {
      const homeworkId = parseInt(ctx.params.homeworkId);
      if (isNaN(homeworkId)) {
        this.error(ctx, '作业ID必须是数字', 400);
        return;
      }

      const result = await this.homeworkService.delete(homeworkId);
      this.handleServiceResponse(ctx, result);
    } catch {
      this.serverError(ctx, '删除作业失败');
    }
  }

  /**
   * 获取作业详情
   * GET /api/homework/:homeworkId
   */
  async getHomeworkDetail(ctx: AppContext): Promise<void> {
    try {
      const homeworkId = parseInt(ctx.params.homeworkId);
      if (isNaN(homeworkId)) {
        this.error(ctx, '作业ID必须是数字', 400);
        return;
      }

      const result = await this.homeworkService.findById(homeworkId);
      this.handleServiceResponse(ctx, result);
    } catch {
      this.serverError(ctx, '获取作业详情失败');
    }
  }

  /**
   * 获取学生的作业详情
   * GET /api/homework/:homeworkId/student/:userId
   */
  async getStudentHomeworkDetail(ctx: AppContext): Promise<void> {
    try {
      const homeworkId = parseInt(ctx.params.homeworkId);
      const userId = parseInt(ctx.params.userId);
      if (isNaN(homeworkId) || isNaN(userId)) {
        this.error(ctx, '作业ID和用户ID必须是数字', 400);
        return;
      }

      // 复用提交列表并筛选指定用户
      const pagination = { page: 1, size: 100 };
      const list = await this.homeworkService.getHomeworkSubmissions(homeworkId, pagination);
      if (list.code !== 200 || !list.data) {
        this.handleServiceResponse(ctx, list);
        return;
      }
      const submission = (list.data as any).data.find((s: any) => s.user_id === userId);
      if (!submission) {
        this.error(ctx, '未找到该学生的提交', 404);
        return;
      }
      this.success(ctx, submission, '获取学生作业详情成功');
    } catch {
      this.serverError(ctx, '获取学生作业详情失败');
    }
  }
}
