import AppError from '../../errors/AppError';
import prisma from '../../utils/prisma';

type TCreateReviewData = {
  gearId: string;
  rating: number;
  comment: string;
};

const createReviewInDB = async (customerId: string, payload: TCreateReviewData) => {
  const gear = await prisma.gear.findUnique({
    where: { id: payload.gearId },
  });

  if (!gear) {
    throw new AppError(404, 'Gear item not found');
  }

  // Verify customer has rented this gear
  const hasRented = await prisma.rentalOrder.findFirst({
    where: {
      customerId,
      gearId: payload.gearId,
    },
  });

  if (!hasRented) {
    throw new AppError(403, 'You can only review gear items that you have rented');
  }

  const result = await prisma.review.create({
    data: {
      customerId,
      gearId: payload.gearId,
      rating: payload.rating,
      comment: payload.comment,
    },
    include: {
      customer: {
        select: {
          id: true,
          name: true,
        },
      },
      gear: {
        select: {
          id: true,
          title: true,
        },
      },
    },
  });

  return result;
};

const getReviewsForGearFromDB = async (gearId: string) => {
  const gear = await prisma.gear.findUnique({
    where: { id: gearId },
  });

  if (!gear) {
    throw new AppError(404, 'Gear item not found');
  }

  const reviews = await prisma.review.findMany({
    where: { gearId },
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
  });

  return reviews;
};

export const ReviewService = {
  createReviewInDB,
  getReviewsForGearFromDB,
};
