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
  '/me',
  auth(),
  validateRequest(UserValidation.updateProfileValidationSchema),
  UserController.updateProfile
);

router.patch(
  '/:id/status',
  auth('ADMIN'),
  validateRequest(UserValidation.updateUserStatusValidationSchema),
  UserController.updateUserStatus
);

router.patch(
  '/:id/role',
  auth('ADMIN'),
  validateRequest(UserValidation.updateUserRoleValidationSchema),
  UserController.updateUserRole
);

router.delete(
  '/:id',
  auth('ADMIN'),
  UserController.deleteUser
);

export const UserRoutes = router;

