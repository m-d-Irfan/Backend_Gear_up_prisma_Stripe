import express from 'express';
import { AuthRoutes } from '../modules/auth/auth.route';
import { UserRoutes } from '../modules/user/user.route';
import { CategoryRoutes } from '../modules/category/category.route';
import { GearRoutes } from '../modules/gear/gear.route';
import { OrderRoutes } from '../modules/order/order.route';
import { PaymentRoutes } from '../modules/payment/payment.route';

const router = express.Router();

const moduleRoutes = [
  {
    path: '/auth',
    route: AuthRoutes,
  },
  {
    path: '/users',
    route: UserRoutes,
  },
  {
    path: '/categories',
    route: CategoryRoutes,
  },
  {
    path: '/gear',
    route: GearRoutes,
  },
  {
    path: '/orders',
    route: OrderRoutes,
  },
  {
    path: '/payments',
    route: PaymentRoutes,
  },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
