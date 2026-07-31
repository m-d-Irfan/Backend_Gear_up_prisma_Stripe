import { z } from 'zod';

const createCheckoutSessionValidationSchema = z.object({
  body: z.object({
    orderId: z.string({ required_error: 'orderId is required' }),
  }),
});

const verifyPaymentValidationSchema = z.object({
  body: z.object({
    orderId: z.string({ required_error: 'orderId is required' }),
    transactionId: z.string({ required_error: 'transactionId is required' }),
  }),
});

export const PaymentValidation = {
  createCheckoutSessionValidationSchema,
  verifyPaymentValidationSchema,
};
