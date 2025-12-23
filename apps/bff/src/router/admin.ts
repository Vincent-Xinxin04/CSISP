import Router from '@koa/router';
import { getAdminOverview } from '@controllers/admin/dashboard.controller';
import jwtAuth from '@middleware/jwtAuth';
import { requireAdmin } from '@middleware/roles';
import { validateQuery } from '@validation';
import { AdminOverviewQuery } from '@schemas/dashboard.schema';
import { validateBffResponse } from '@middleware/responseValidation';
import { AdminOverviewResultSchema } from '@schemas/admin/dashboard.schema';

const admin = new Router();
admin.get(
  '/dashboard/overview',
  jwtAuth({ required: true }),
  requireAdmin,
  validateQuery(AdminOverviewQuery),
  validateBffResponse(AdminOverviewResultSchema),
  getAdminOverview
);

export default admin;
