import { UserRole } from '@prisma/client';
import AppError from '../../errors/AppError';
import prisma from '../../utils/prisma';

type TCreateOrderData = {
  gearId: string;
  startDate: string;
  endDate: string;
};

const createRentalOrderInDB = async (customerId: string, payload: TCreateOrderData) => {
  const gear = await prisma.gear.findUnique({
    where: { id: payload.gearId },
  });

  if (!gear) {
    throw new AppError(404, 'Gear item not found');
  }

  if (!gear.isAvailable || gear.stock < 1) {
    throw new AppError(400, 'This gear item is currently out of stock or unavailable for rent');
  }

  const start = new Date(payload.startDate);
  const end = new Date(payload.endDate);

  if (start >= end) {
    throw new AppError(400, 'Rental end date must be after start date');
  }

  // Calculate rental duration in days (minimum 1 day)
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const totalDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  const totalPrice = totalDays * gear.pricePerDay;

  const result = await prisma.rentalOrder.create({
    data: {
      customerId,
      gearId: payload.gearId,
      startDate: start,
      endDate: end,
      totalDays,
      totalPrice,
      orderStatus: 'PENDING',
      paymentStatus: 'UNPAID',
    },
    include: {
      gear: {
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
      },
      customer: {
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

const getMyOrdersFromDB = async (userId: string, userRole: UserRole) => {
  if (userRole === 'CUSTOMER') {
    return await prisma.rentalOrder.findMany({
      where: { customerId: userId },
      include: {
        gear: true,
        payment: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  } else if (userRole === 'PROVIDER') {
    return await prisma.rentalOrder.findMany({
      where: {
        gear: { providerId: userId },
      },
      include: {
        gear: true,
        customer: {
          select: { id: true, name: true, email: true },
        },
        payment: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  } else {
    // Admin: return all orders
    return await prisma.rentalOrder.findMany({
      include: {
        gear: true,
        customer: { select: { id: true, name: true, email: true } },
        payment: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }
};

const getSingleOrderFromDB = async (orderId: string, userId: string, userRole: UserRole) => {
  const order = await prisma.rentalOrder.findUnique({
    where: { id: orderId },
    include: {
      gear: {
        include: {
          provider: { select: { id: true, name: true, email: true } },
        },
      },
      customer: { select: { id: true, name: true, email: true } },
      payment: true,
    },
  });

  if (!order) {
    throw new AppError(404, 'Rental order not found');
  }

  // Authorization check
  if (
    userRole !== 'ADMIN' &&
    order.customerId !== userId &&
    order.gear.providerId !== userId
  ) {
    throw new AppError(403, 'You are not authorized to view this rental order');
  }

  return order;
};

export const OrderService = {
  createRentalOrderInDB,
  getMyOrdersFromDB,
  getSingleOrderFromDB,
};
