import express from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { PaymentValidation } from './payment.validation';
import { PaymentController } from './payment.controller';

const router = express.Router();

router.post(
  '/create-checkout-session',
  auth('CUSTOMER'),
  validateRequest(PaymentValidation.createCheckoutSessionValidationSchema),
  PaymentController.createCheckoutSession
);

router.post(
  '/verify',
  auth('CUSTOMER'),
  validateRequest(PaymentValidation.verifyPaymentValidationSchema),
  PaymentController.verifyPayment
);

router.get(
  '/history',
  auth('CUSTOMER', 'ADMIN'),
  PaymentController.getPaymentHistory
);

export const PaymentRoutes = router;
