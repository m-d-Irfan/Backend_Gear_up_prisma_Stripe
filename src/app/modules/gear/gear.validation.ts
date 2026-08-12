import { z } from 'zod';

const createGearValidationSchema = z.object({
  body: z.object({
    title: z.string({ required_error: 'Title is required' }).min(2, 'Title must be at least 2 characters'),
    description: z.string({ required_error: 'Description is required' }),
    pricePerDay: z.number({ required_error: 'Price per day is required' }).positive('Price per day must be greater than 0'),
    additionalDayPrice: z.number().min(0).optional(),
    location: z.string({ required_error: 'Location is required' }),
    brand: z.string().optional(),
    stock: z.number().int().min(1, 'Stock must be at least 1').default(1),
    isAvailable: z.boolean().default(true),
    image: z.string().optional(),
    images: z.array(z.string()).optional(),
    categoryId: z.string({ required_error: 'Category ID is required' }),
  }),
});

const updateGearValidationSchema = z.object({
  body: z.object({
    title: z.string().min(2).optional(),
    description: z.string().optional(),
    pricePerDay: z.number().positive().optional(),
    additionalDayPrice: z.number().min(0).optional(),
    location: z.string().optional(),
    brand: z.string().optional(),
    stock: z.number().int().min(0).optional(),
    isAvailable: z.boolean().optional(),
    image: z.string().optional(),
    images: z.array(z.string()).optional(),
    categoryId: z.string().optional(),
  }),
});

export const GearValidation = {
  createGearValidationSchema,
  updateGearValidationSchema,
};

