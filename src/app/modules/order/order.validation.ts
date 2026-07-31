import { z } from 'zod';

const createOrderValidationSchema = z.object({
  body: z.object({
    gearId: z.string({ required_error: 'Gear ID is required' }),
    startDate: z.string({ required_error: 'Start date is required' }).refine((val) => !isNaN(Date.parse(val)), {
      message: 'Invalid start date string format',
    }),
    endDate: z.string({ required_error: 'End date is required' }).refine((val) => !isNaN(Date.parse(val)), {
      message: 'Invalid end date string format',
    }),
  }),
});

export const OrderValidation = {
  createOrderValidationSchema,
};
