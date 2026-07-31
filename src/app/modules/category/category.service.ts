import AppError from '../../errors/AppError';
import prisma from '../../utils/prisma';

type TCategoryData = {
  name: string;
  description?: string;
};

const createCategoryInDB = async (payload: TCategoryData) => {
  const existingCategory = await prisma.category.findUnique({
    where: { name: payload.name },
  });

  if (existingCategory) {
    throw new AppError(400, 'Category with this name already exists');
  }

  const result = await prisma.category.create({
    data: payload,
  });

  return result;
};

const getAllCategoriesFromDB = async () => {
  const result = await prisma.category.findMany({
    include: {
      _count: {
        select: { gears: true },
      },
    },
    orderBy: {
      name: 'asc',
    },
  });

  return result;
};

const getSingleCategoryFromDB = async (id: string) => {
  const category = await prisma.category.findUnique({
    where: { id },
    include: {
      gears: true,
    },
  });

  if (!category) {
    throw new AppError(404, 'Category not found');
  }

  return category;
};

const updateCategoryInDB = async (id: string, payload: Partial<TCategoryData>) => {
  const category = await prisma.category.findUnique({
    where: { id },
  });

  if (!category) {
    throw new AppError(404, 'Category not found');
  }

  if (payload.name && payload.name !== category.name) {
    const duplicate = await prisma.category.findUnique({
      where: { name: payload.name },
    });
    if (duplicate) {
      throw new AppError(400, 'Category with this name already exists');
    }
  }

  const result = await prisma.category.update({
    where: { id },
    data: payload,
  });

  return result;
};

const deleteCategoryFromDB = async (id: string) => {
  const category = await prisma.category.findUnique({
    where: { id },
  });

  if (!category) {
    throw new AppError(404, 'Category not found');
  }

  const result = await prisma.category.delete({
    where: { id },
  });

  return result;
};

export const CategoryService = {
  createCategoryInDB,
  getAllCategoriesFromDB,
  getSingleCategoryFromDB,
  updateCategoryInDB,
  deleteCategoryFromDB,
};
