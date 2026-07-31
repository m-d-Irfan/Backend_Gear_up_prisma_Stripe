import express from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { ReviewValidation } from './review.validation';
import { ReviewController } from './review.controller';

const router = express.Router();

router.get('/gear/:gearId', ReviewController.getReviewsForGear);

router.post(
  '/',
  auth('CUSTOMER'),
  validateRequest(ReviewValidation.createReviewValidationSchema),
  ReviewController.createReview
);

export const ReviewRoutes = router;
