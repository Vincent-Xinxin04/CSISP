/**
 * 文件上传中间件
 * 处理文件上传和验证
 */

import { Middleware, UploadMiddlewareOptions } from '../types/middleware';
import { AppContext } from '../types/context';

/**
 * 文件上传中间件
 * 处理文件上传和基础验证
 */
export const upload = (options: UploadMiddlewareOptions = {}): Middleware => {
  const {
    maxFileSize = 10 * 1024 * 1024, // 10MB
    allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'],
    uploadDir = 'uploads/',
    preserveFilename = false,
    maxFiles = 5,
  } = options;

  return async (ctx: AppContext, next) => {
    // 只处理multipart/form-data请求
    if (!ctx.is('multipart')) {
      return await next();
    }

    try {
      // 解析multipart数据（简化版，实际项目中建议使用koa-multer或类似库）
      const files: any[] = [];
      const fields: Record<string, any> = {};

      // 这里应该解析multipart数据，由于koa没有内置的multipart解析器
      // 我们假设请求体已经被解析为files和fields
      if (ctx.request.files) {
        const requestFiles = Array.isArray(ctx.request.files)
          ? ctx.request.files
          : Object.values(ctx.request.files);

        if (requestFiles.length > maxFiles) {
          ctx.status = 400;
          ctx.body = { code: 400, message: `最多允许上传${maxFiles}个文件` };
          return;
        }

        for (const file of requestFiles) {
          // 验证文件类型
          if (!allowedTypes.includes(file.mimetype || file.type)) {
            ctx.status = 400;
            ctx.body = {
              code: 400,
              message: `不支持的文件类型: ${file.mimetype || file.type}`,
              allowedTypes,
            };
            return;
          }

          // 验证文件大小
          if (file.size > maxFileSize) {
            ctx.status = 400;
            ctx.body = {
              code: 400,
              message: `文件大小超过限制: ${maxFileSize / (1024 * 1024)}MB`,
            };
            return;
          }

          files.push({
            originalname: file.originalname || file.name,
            mimetype: file.mimetype || file.type,
            size: file.size,
            url: `/uploads/${file.filename || file.name}`,
          });
        }
      }

      // 将上传的文件信息添加到上下文
      ctx.request.files = files;
      ctx.request.body = { ...ctx.request.body, ...fields };

      await next();
    } catch (error: any) {
      console.error('文件上传处理失败:', error);
      ctx.status = 500;
      ctx.body = { code: 500, message: '文件上传处理失败' };
    }
  };
};

/**
 * 图片上传中间件
 * 专门处理图片上传
 */
export const imageUpload = (options: Partial<UploadMiddlewareOptions> = {}): Middleware => {
  return upload({
    maxFileSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    uploadDir: 'uploads/images/',
    ...options,
  });
};

/**
 * 文档上传中间件
 * 专门处理文档文件上传
 */
export const documentUpload = (options: Partial<UploadMiddlewareOptions> = {}): Middleware => {
  return upload({
    maxFileSize: 20 * 1024 * 1024, // 20MB
    allowedTypes: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
    ],
    uploadDir: 'uploads/documents/',
    ...options,
  });
};
