import express from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { OrderValidation } from './order.validation';
import { OrderController } from './order.controller';

const router = express.Router();

router.get(
  '/my-orders',
  auth('CUSTOMER', 'PROVIDER', 'ADMIN'),
  OrderController.getMyOrders
);

router.get(
  '/:id',
  auth('CUSTOMER', 'PROVIDER', 'ADMIN'),
  OrderController.getSingleOrder
);

router.post(
  '/',
  auth('CUSTOMER'),
  validateRequest(OrderValidation.createOrderValidationSchema),
  OrderController.createOrder
);

export const OrderRoutes = router;
