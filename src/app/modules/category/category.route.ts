import express from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { CategoryValidation } from './category.validation';
import { CategoryController } from './category.controller';

const router = express.Router();

router.get('/', CategoryController.getAllCategories);
router.get('/:id', CategoryController.getSingleCategory);

router.post(
  '/',
  auth('ADMIN'),
  validateRequest(CategoryValidation.createCategoryValidationSchema),
  CategoryController.createCategory
);

router.patch(
  '/:id',
  auth('ADMIN'),
  validateRequest(CategoryValidation.updateCategoryValidationSchema),
  CategoryController.updateCategory
);

router.delete(
  '/:id',
  auth('ADMIN'),
  CategoryController.deleteCategory
);

export const CategoryRoutes = router;
