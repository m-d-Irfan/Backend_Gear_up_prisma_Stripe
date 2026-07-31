import express from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { UserValidation } from './user.validation';
import { UserController } from './user.controller';

const router = express.Router();

router.get(
  '/',
  auth('ADMIN'),
  UserController.getAllUsers
);

router.patch(
  '/:id/status',
  auth('ADMIN'),
  validateRequest(UserValidation.updateUserStatusValidationSchema),
  UserController.updateUserStatus
);

export const UserRoutes = router;
