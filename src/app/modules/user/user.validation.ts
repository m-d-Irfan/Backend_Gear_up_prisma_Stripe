import { z } from 'zod';

const updateUserStatusValidationSchema = z.object({
  body: z.object({
    status: z.enum(['ACTIVE', 'SUSPENDED'], {
      required_error: 'Status is required and must be ACTIVE or SUSPENDED',
    }),
  }),
});

const updateUserRoleValidationSchema = z.object({
  body: z.object({
    role: z.enum(['CUSTOMER', 'PROVIDER', 'ADMIN'], {
      required_error: 'Role is required and must be CUSTOMER, PROVIDER, or ADMIN',
    }),
  }),
});

const updateProfileValidationSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').optional(),
    avatarUrl: z.string().optional(),
    password: z.string().min(6, 'Password must be at least 6 characters').optional(),
  }),
});

export const UserValidation = {
  updateUserStatusValidationSchema,
  updateUserRoleValidationSchema,
  updateProfileValidationSchema,
};

