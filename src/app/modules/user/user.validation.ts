import { z } from 'zod';

const updateUserStatusValidationSchema = z.object({
  body: z.object({
    status: z.enum(['ACTIVE', 'SUSPENDED'], {
      required_error: 'Status is required and must be ACTIVE or SUSPENDED',
    }),
  }),
});

export const UserValidation = {
  updateUserStatusValidationSchema,
};
