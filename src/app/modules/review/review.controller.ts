import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { ReviewService } from './review.service';

const createReview = catchAsync(async (req: Request, res: Response) => {
  const customerId = req.user!.id;
  const result = await ReviewService.createReviewInDB(customerId, req.body);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Review posted successfully',
    data: result,
  });
});

const getReviewsForGear = catchAsync(async (req: Request, res: Response) => {
  const { gearId } = req.params;
  const result = await ReviewService.getReviewsForGearFromDB(gearId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Reviews retrieved successfully',
    data: result,
  });
});

export const ReviewController = {
  createReview,
  getReviewsForGear,
};
