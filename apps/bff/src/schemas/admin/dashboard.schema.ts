import { z } from 'zod';

// Admin 仪表盘顶部统计卡片数据结构，对应 AdminDashboardStats（dashboard.service.ts）
export const AdminDashboardStatsSchema = z.object({
  userCount: z.number().int().nonnegative(),
  courseCount: z.number().int().nonnegative(),
  attendanceRate: z.number(),
  homeworkSubmissionRate: z.number(),
  notificationCount: z.number().int().nonnegative(),
});

// 用户增长趋势折线图数据点，对应 UserGrowthPoint
export const UserGrowthPointSchema = z.object({
  date: z.string(),
  count: z.number().int().nonnegative(),
});

// 课程分布饼图数据项，对应 CourseDistributionItem
export const CourseDistributionItemSchema = z.object({
  name: z.string(),
  value: z.number().int().nonnegative(),
});

// 最近活动中嵌入的用户信息，对应 RecentActivityItem.user
export const RecentActivityUserSchema = z.object({
  id: z.number().int().positive(),
  realName: z.string(),
});

// 最近活动时间线条目，对应 RecentActivityItem
export const RecentActivityItemSchema = z.object({
  id: z.number().int().positive(),
  type: z.string(),
  title: z.string(),
  description: z.string(),
  timestamp: z.string(),
  user: RecentActivityUserSchema.optional(),
});

// Admin 概览聚合总结构，对应 AdminOverviewResult（aggregateAdminOverview 返回值）
export const AdminOverviewResultSchema = z.object({
  stats: AdminDashboardStatsSchema,
  userGrowth: z.array(UserGrowthPointSchema),
  courseDistribution: z.array(CourseDistributionItemSchema),
  recentActivities: z.array(RecentActivityItemSchema),
  meta: z
    .object({
      error: z.string(),
    })
    .optional(),
});
