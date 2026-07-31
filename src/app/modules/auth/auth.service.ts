import { UserRole } from '@prisma/client';
import AppError from '../../errors/AppError';
import prisma from '../../utils/prisma';
import { hashPassword } from './auth.utils';

type TRegisterUserData = {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
};

const registerUserIntoDB = async (payload: TRegisterUserData) => {
  const existingUser = await prisma.user.findUnique({
    where: { email: payload.email },
  });

  if (existingUser) {
    throw new AppError(400, 'User with this email already exists');
  }

  const hashedPassword = await hashPassword(payload.password);

  const newUser = await prisma.user.create({
    data: {
      name: payload.name,
      email: payload.email,
      password: hashedPassword,
      role: payload.role || 'CUSTOMER',
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return newUser;
};

export const AuthService = {
  registerUserIntoDB,
};
