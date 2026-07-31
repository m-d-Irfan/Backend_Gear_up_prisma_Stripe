import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { PaymentService } from './payment.service';

const createCheckoutSession = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { orderId } = req.body;

  const result = await PaymentService.createPaymentSessionInDB(userId, orderId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Stripe payment session created successfully',
    data: result,
  });
});

const verifyPayment = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { orderId, transactionId } = req.body;

  const result = await PaymentService.verifyAndConfirmPaymentInDB(userId, orderId, transactionId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Payment verified and rental order confirmed successfully',
    data: result,
  });
});

const getPaymentHistory = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const userRole = req.user!.role;

  const result = await PaymentService.getPaymentHistoryFromDB(userId, userRole);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Payment history retrieved successfully',
    data: result,
  });
});

export const PaymentController = {
  createCheckoutSession,
  verifyPayment,
  getPaymentHistory,
};
