import express from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { PaymentValidation } from './payment.validation';
import { PaymentController } from './payment.controller';

const router = express.Router();

// Stripe Webhook — MUST be BEFORE express.json() middleware
// Stripe sends raw body, not JSON. This route has NO auth (Stripe calls it directly).
router.post(
  '/webhook',
  express.raw({ type: 'application/json' }),
  PaymentController.handleWebhook
);

// Checkout Session (for future frontend redirect flow)
router.post(
  '/create-checkout-session',
  auth('CUSTOMER'),
  validateRequest(PaymentValidation.createCheckoutSessionValidationSchema),
  PaymentController.createCheckoutSession
);

// PaymentIntent (for Postman/Swagger direct testing)
router.post(
  '/create-payment-intent',
  auth('CUSTOMER'),
  validateRequest(PaymentValidation.createCheckoutSessionValidationSchema),
  PaymentController.createPaymentIntent
);

// Manual verify (for Postman/Swagger testing)
router.post(
  '/verify',
  auth('CUSTOMER'),
  validateRequest(PaymentValidation.verifyPaymentValidationSchema),
  PaymentController.verifyPayment
);

// Payment history
router.get(
  '/history',
  auth('CUSTOMER', 'ADMIN'),
  PaymentController.getPaymentHistory
);

export const PaymentRoutes = router;
