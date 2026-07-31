import { UserRole } from '@prisma/client';
import AppError from '../../errors/AppError';
import prisma from '../../utils/prisma';

type TCreateGearData = {
  title: string;
  description: string;
  pricePerDay: number;
  location: string;
  brand?: string;
  stock: number;
  isAvailable?: boolean;
  categoryId: string;
};

const createGearInDB = async (providerId: string, payload: TCreateGearData) => {
  const categoryExists = await prisma.category.findUnique({
    where: { id: payload.categoryId },
  });

  if (!categoryExists) {
    throw new AppError(404, 'Category not found');
  }

  const result = await prisma.gear.create({
    data: {
      ...payload,
      providerId,
    },
    include: {
      category: true,
      provider: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  return result;
};

const getMyGearListingsFromDB = async (providerId: string) => {
  const result = await prisma.gear.findMany({
    where: { providerId },
    include: {
      category: true,
      _count: {
        select: { orders: true, reviews: true },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return result;
};

const updateGearInDB = async (
  gearId: string,
  userId: string,
  userRole: UserRole,
  payload: Partial<TCreateGearData>
) => {
  const gear = await prisma.gear.findUnique({
    where: { id: gearId },
  });

  if (!gear) {
    throw new AppError(404, 'Gear item not found');
  }

  if (userRole !== 'ADMIN' && gear.providerId !== userId) {
    throw new AppError(403, 'You are not authorized to update this gear listing');
  }

  if (payload.categoryId) {
    const categoryExists = await prisma.category.findUnique({
      where: { id: payload.categoryId },
    });
    if (!categoryExists) {
      throw new AppError(404, 'Category not found');
    }
  }

  const result = await prisma.gear.update({
    where: { id: gearId },
    data: payload,
    include: {
      category: true,
    },
  });

  return result;
};

const deleteGearFromDB = async (gearId: string, userId: string, userRole: UserRole) => {
  const gear = await prisma.gear.findUnique({
    where: { id: gearId },
  });

  if (!gear) {
    throw new AppError(404, 'Gear item not found');
  }

  if (userRole !== 'ADMIN' && gear.providerId !== userId) {
    throw new AppError(403, 'You are not authorized to delete this gear listing');
  }

  const result = await prisma.gear.delete({
    where: { id: gearId },
  });

  return result;
};

export const GearService = {
  createGearInDB,
  getMyGearListingsFromDB,
  updateGearInDB,
  deleteGearFromDB,
};
