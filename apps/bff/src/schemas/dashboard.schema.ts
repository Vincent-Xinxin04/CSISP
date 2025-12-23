import { z } from 'zod';

// 学生端仪表盘查询参数（portal/dashboard.student）
export const StudentDashboardQuery = z.object({
  userId: z.coerce.number().int().positive(),
});

// Admin 概览仪表盘查询参数（admin/dashboard.overview）
export const AdminOverviewQuery = z.object({
  days: z.coerce.number().int().min(1).max(180).default(30).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(10).optional(),
});
