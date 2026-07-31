import express from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { GearValidation } from './gear.validation';
import { GearController } from './gear.controller';

const router = express.Router();

router.get(
  '/my-listings',
  auth('PROVIDER', 'ADMIN'),
  GearController.getMyGearListings
);

router.post(
  '/',
  auth('PROVIDER', 'ADMIN'),
  validateRequest(GearValidation.createGearValidationSchema),
  GearController.createGear
);

router.patch(
  '/:id',
  auth('PROVIDER', 'ADMIN'),
  validateRequest(GearValidation.updateGearValidationSchema),
  GearController.updateGear
);

router.delete(
  '/:id',
  auth('PROVIDER', 'ADMIN'),
  GearController.deleteGear
);

export const GearRoutes = router;
