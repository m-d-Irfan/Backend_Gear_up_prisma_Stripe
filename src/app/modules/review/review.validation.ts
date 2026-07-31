import { z } from 'zod';

const createReviewValidationSchema = z.object({
  body: z.object({
    gearId: z.string({ required_error: 'gearId is required' }),
    rating: z.number({ required_error: 'rating is required' }).min(1, 'Rating must be at least 1').max(5, 'Rating cannot exceed 5'),
    comment: z.string({ required_error: 'comment is required' }).min(3, 'Comment must be at least 3 characters'),
  }),
});

export const ReviewValidation = {
  createReviewValidationSchema,
};
