import { UserRole, UserStatus } from '@prisma/client';
import AppError from '../../errors/AppError';
import prisma from '../../utils/prisma';

const getAllUsersFromDB = async (query: { role?: UserRole; status?: UserStatus }) => {
  const whereConditions: any = {};

  if (query.role) {
    whereConditions.role = query.role;
  }
  if (query.status) {
    whereConditions.status = query.status;
  }

  const users = await prisma.user.findMany({
    where: whereConditions,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return users;
};

const updateUserStatusInDB = async (userId: string, status: UserStatus) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new AppError(404, 'User not found');
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: { status },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
      updatedAt: true,
    },
  });

  return updatedUser;
};

export const UserService = {
  getAllUsersFromDB,
  updateUserStatusInDB,
};
