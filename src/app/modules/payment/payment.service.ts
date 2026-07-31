import Stripe from 'stripe';
import { UserRole } from '@prisma/client';
import AppError from '../../errors/AppError';
import config from '../../config';
import prisma from '../../utils/prisma';

const stripe = new Stripe(config.stripe.secret_key, {
  apiVersion: '2024-11-20.acacia' as any,
});

const createPaymentSessionInDB = async (userId: string, orderId: string) => {
  const order = await prisma.rentalOrder.findUnique({
    where: { id: orderId },
    include: {
      gear: true,
      customer: true,
    },
  });

  if (!order) {
    throw new AppError(404, 'Rental order not found');
  }

  if (order.customerId !== userId) {
    throw new AppError(403, 'You are not authorized to make a payment for this order');
  }

  if (order.paymentStatus === 'PAID') {
    throw new AppError(400, 'This rental order has already been paid');
  }

  // Create Stripe PaymentIntent (amount in cents)
  const amountInCents = Math.round(order.totalPrice * 100);

  const paymentIntent = await stripe.paymentIntents.create({
    amount: amountInCents,
    currency: 'usd',
    metadata: {
      orderId: order.id,
      customerId: userId,
      gearTitle: order.gear.title,
    },
    description: `GearUp Rental Payment for ${order.gear.title} (${order.totalDays} days)`,
  });

  return {
    clientSecret: paymentIntent.client_secret,
    transactionId: paymentIntent.id,
    amount: order.totalPrice,
    currency: 'usd',
  };
};

const verifyAndConfirmPaymentInDB = async (
  userId: string,
  orderId: string,
  transactionId: string
) => {
  const order = await prisma.rentalOrder.findUnique({
    where: { id: orderId },
  });

  if (!order) {
    throw new AppError(404, 'Rental order not found');
  }

  if (order.customerId !== userId) {
    throw new AppError(403, 'You are not authorized to confirm this payment');
  }

  // Execute database transaction to update order and create payment record
  const result = await prisma.$transaction(async (tx) => {
    const payment = await tx.payment.create({
      data: {
        orderId,
        userId,
        amount: order.totalPrice,
        transactionId,
        status: 'PAID',
      },
    });

    const updatedOrder = await tx.rentalOrder.update({
      where: { id: orderId },
      data: {
        paymentStatus: 'PAID',
        orderStatus: 'CONFIRMED',
      },
      include: {
        gear: true,
        payment: true,
      },
    });

    return { payment, order: updatedOrder };
  });

  return result;
};

const getPaymentHistoryFromDB = async (userId: string, userRole: UserRole) => {
  if (userRole === 'ADMIN') {
    return await prisma.payment.findMany({
      include: {
        user: { select: { id: true, name: true, email: true } },
        order: { include: { gear: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  return await prisma.payment.findMany({
    where: { userId },
    include: {
      order: { include: { gear: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
};

export const PaymentService = {
  createPaymentSessionInDB,
  verifyAndConfirmPaymentInDB,
  getPaymentHistoryFromDB,
};
