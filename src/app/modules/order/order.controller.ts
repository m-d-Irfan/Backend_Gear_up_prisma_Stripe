import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { OrderService } from './order.service';

const createOrder = catchAsync(async (req: Request, res: Response) => {
  const customerId = req.user!.id;
  const result = await OrderService.createRentalOrderInDB(customerId, req.body);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Rental order placed successfully',
    data: result,
  });
});

const getMyOrders = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const userRole = req.user!.role;
  const result = await OrderService.getMyOrdersFromDB(userId, userRole);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Rental orders retrieved successfully',
    data: result,
  });
});

const getSingleOrder = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user!.id;
  const userRole = req.user!.role;

  const result = await OrderService.getSingleOrderFromDB(id, userId, userRole);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Rental order retrieved successfully',
    data: result,
  });
});

const updateOrderStatus = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user!.id;
  const userRole = req.user!.role;
  const { orderStatus } = req.body;

  const result = await OrderService.updateOrderStatusInDB(id, userId, userRole, orderStatus);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: `Order status updated to ${orderStatus} successfully`,
    data: result,
  });
});

export const OrderController = {
  createOrder,
  getMyOrders,
  getSingleOrder,
  updateOrderStatus,
};
