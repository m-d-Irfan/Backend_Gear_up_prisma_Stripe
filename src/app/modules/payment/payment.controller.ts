import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { PaymentService } from './payment.service';

// For future frontend — creates a Stripe Checkout Session with redirect URL
const createCheckoutSession = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { orderId } = req.body;

  const result = await PaymentService.createCheckoutSessionInDB(userId, orderId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Stripe checkout session created successfully. Redirect customer to checkoutUrl.',
    data: result,
  });
});

// For Postman/Swagger testing — creates a PaymentIntent directly
const createPaymentIntent = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { orderId } = req.body;

  const result = await PaymentService.createPaymentIntentInDB(userId, orderId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Stripe payment intent created successfully',
    data: result,
  });
});

// Manual verify endpoint (for Postman/Swagger testing without frontend)
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

// Stripe Webhook — Stripe calls this automatically (no auth needed)
const handleWebhook = async (req: Request, res: Response): Promise<void> => {
  const signature = req.headers['stripe-signature'] as string;

  if (!signature) {
    res.status(400).json({ success: false, message: 'Missing stripe-signature header' });
    return;
  }

  try {
    const result = await PaymentService.handleStripeWebhook(req.body, signature);
    res.status(200).json(result);
  } catch (error: any) {
    console.error('Webhook error:', error.message);
    res.status(400).json({ success: false, message: error.message });
  }
};

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
  createPaymentIntent,
  verifyPayment,
  handleWebhook,
  getPaymentHistory,
};
