import { UserRole, Prisma } from '@prisma/client';
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

type TGearQueryFilters = {
  searchTerm?: string;
  categoryId?: string;
  brand?: string;
  location?: string;
  minPrice?: string;
  maxPrice?: string;
  isAvailable?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: string;
  limit?: string;
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

const getAllGearsFromDB = async (query: TGearQueryFilters) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const skip = (page - 1) * limit;

  const andConditions: Prisma.GearWhereInput[] = [];

  // SearchTerm condition across title, description, brand, location
  if (query.searchTerm) {
    andConditions.push({
      OR: [
        { title: { contains: query.searchTerm, mode: 'insensitive' } },
        { description: { contains: query.searchTerm, mode: 'insensitive' } },
        { brand: { contains: query.searchTerm, mode: 'insensitive' } },
        { location: { contains: query.searchTerm, mode: 'insensitive' } },
      ],
    });
  }

  if (query.categoryId) {
    andConditions.push({ categoryId: query.categoryId });
  }

  if (query.brand) {
    andConditions.push({ brand: { equals: query.brand, mode: 'insensitive' } });
  }

  if (query.location) {
    andConditions.push({ location: { contains: query.location, mode: 'insensitive' } });
  }

  if (query.isAvailable !== undefined) {
    andConditions.push({ isAvailable: query.isAvailable === 'true' });
  }

  if (query.minPrice || query.maxPrice) {
    const priceFilter: Prisma.FloatFilter = {};
    if (query.minPrice) priceFilter.gte = Number(query.minPrice);
    if (query.maxPrice) priceFilter.lte = Number(query.maxPrice);
    andConditions.push({ pricePerDay: priceFilter });
  }

  const whereConditions: Prisma.GearWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  const sortBy = query.sortBy || 'createdAt';
  const sortOrder = query.sortOrder || 'desc';

  const gears = await prisma.gear.findMany({
    where: whereConditions,
    include: {
      category: true,
      provider: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      _count: {
        select: { reviews: true },
      },
    },
    skip,
    take: limit,
    orderBy: {
      [sortBy]: sortOrder,
    },
  });

  const total = await prisma.gear.count({ where: whereConditions });

  return {
    meta: {
      page,
      limit,
      total,
      totalPage: Math.ceil(total / limit),
    },
    data: gears,
  };
};

const getSingleGearFromDB = async (gearId: string) => {
  const gear = await prisma.gear.findUnique({
    where: { id: gearId },
    include: {
      category: true,
      provider: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      reviews: {
        include: {
          customer: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      },
    },
  });

  if (!gear) {
    throw new AppError(404, 'Gear item not found');
  }

  return gear;
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
  getAllGearsFromDB,
  getSingleGearFromDB,
  getMyGearListingsFromDB,
  updateGearInDB,
  deleteGearFromDB,
};
