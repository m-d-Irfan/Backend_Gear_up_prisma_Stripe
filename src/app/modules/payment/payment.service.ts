import Stripe from 'stripe';
import { UserRole } from '@prisma/client';
import AppError from '../../errors/AppError';
import config from '../../config';
import prisma from '../../utils/prisma';

const stripe = new Stripe(config.stripe.secret_key, {
  apiVersion: '2024-11-20.acacia' as any,
});

// Creates a Stripe Checkout Session (for future frontend redirect flow)
const createCheckoutSessionInDB = async (userId: string, orderId: string) => {
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

  // Create Stripe Checkout Session (amount in cents)
  const amountInCents = Math.round(order.totalPrice * 100);

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'payment',
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: order.gear.title,
            description: `GearUp Rental: ${order.totalDays} day(s)`,
          },
          unit_amount: amountInCents,
        },
        quantity: 1,
      },
    ],
    metadata: {
      orderId: order.id,
      customerId: userId,
    },
    // Frontend will replace these URLs in the future
    success_url: `${process.env.CLIENT_URL || 'http://localhost:3000'}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.CLIENT_URL || 'http://localhost:3000'}/payment/cancel`,
  });

  return {
    sessionId: session.id,
    checkoutUrl: session.url,
    amount: order.totalPrice,
    currency: 'usd',
  };
};

// Creates a Stripe PaymentIntent (for Postman/Swagger testing without frontend)
const createPaymentIntentInDB = async (userId: string, orderId: string) => {
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

// Manual payment verification (for Postman/Swagger testing)
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

// Stripe Webhook Handler — Stripe calls this endpoint automatically after payment
const handleStripeWebhook = async (rawBody: Buffer, signature: string) => {
  const webhookSecret = config.stripe.webhook_secret;

  if (!webhookSecret) {
    throw new AppError(500, 'Stripe webhook secret is not configured');
  }

  // Verify the event came from Stripe (not a fake request)
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err: any) {
    throw new AppError(400, `Webhook signature verification failed: ${err.message}`);
  }

  // Handle the event based on its type
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      const orderId = session.metadata?.orderId;
      const customerId = session.metadata?.customerId;

      if (orderId && customerId) {
        // Check if payment already recorded (prevent duplicate processing)
        const existingPayment = await prisma.payment.findUnique({
          where: { orderId },
        });

        if (!existingPayment) {
          await prisma.$transaction(async (tx) => {
            await tx.payment.create({
              data: {
                orderId,
                userId: customerId,
                amount: (session.amount_total || 0) / 100,
                transactionId: session.payment_intent as string,
                status: 'PAID',
              },
            });

            await tx.rentalOrder.update({
              where: { id: orderId },
              data: {
                paymentStatus: 'PAID',
                orderStatus: 'CONFIRMED',
              },
            });
          });

          console.log(`✅ Webhook: Payment confirmed for order ${orderId}`);
        }
      }
      break;
    }

    case 'checkout.session.expired': {
      const session = event.data.object as Stripe.Checkout.Session;
      const orderId = session.metadata?.orderId;

      if (orderId) {
        await prisma.rentalOrder.update({
          where: { id: orderId },
          data: {
            paymentStatus: 'FAILED',
            orderStatus: 'CANCELLED',
          },
        });
        console.log(`❌ Webhook: Payment expired for order ${orderId}`);
      }
      break;
    }

    default:
      console.log(`ℹ️ Unhandled Stripe event type: ${event.type}`);
  }

  return { received: true };
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
  createCheckoutSessionInDB,
  createPaymentIntentInDB,
  verifyAndConfirmPaymentInDB,
  handleStripeWebhook,
  getPaymentHistoryFromDB,
};
