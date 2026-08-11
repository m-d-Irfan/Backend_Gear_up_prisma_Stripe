import { UserRole, UserStatus } from '@prisma/client';
import AppError from '../../errors/AppError';
import prisma from '../../utils/prisma';
import { hashPassword } from '../auth/auth.utils';

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
      avatarUrl: true,
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

const updateUserStatusInDB = async (adminId: string, userId: string, status: UserStatus) => {
  if (adminId === userId && status === 'SUSPENDED') {
    throw new AppError(400, 'Administrators cannot suspend their own account');
  }

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
      avatarUrl: true,
      role: true,
      status: true,
      updatedAt: true,
    },
  });

  return updatedUser;
};

const updateUserRoleInDB = async (adminId: string, userId: string, role: UserRole) => {
  if (adminId === userId && role !== 'ADMIN') {
    throw new AppError(400, 'Administrators cannot revoke their own admin role');
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new AppError(404, 'User not found');
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: { role },
    select: {
      id: true,
      name: true,
      email: true,
      avatarUrl: true,
      role: true,
      status: true,
      updatedAt: true,
    },
  });

  return updatedUser;
};

const deleteUserFromDB = async (adminId: string, userId: string) => {
  if (adminId === userId) {
    throw new AppError(400, 'Administrators cannot delete their own account');
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new AppError(404, 'User not found');
  }

  await prisma.user.delete({
    where: { id: userId },
  });

  return { message: 'User deleted successfully' };
};

const updateUserProfileInDB = async (
  userId: string,
  payload: { name?: string; avatarUrl?: string; password?: string }
) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new AppError(404, 'User not found');
  }

  const updateData: any = {};

  if (payload.name) {
    updateData.name = payload.name;
  }
  if (payload.avatarUrl !== undefined) {
    updateData.avatarUrl = payload.avatarUrl;
  }
  if (payload.password) {
    updateData.password = await hashPassword(payload.password);
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: updateData,
    select: {
      id: true,
      name: true,
      email: true,
      avatarUrl: true,
      role: true,
      status: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return updatedUser;
};

export const UserService = {
  getAllUsersFromDB,
  updateUserStatusInDB,
  updateUserRoleInDB,
  deleteUserFromDB,
  updateUserProfileInDB,
};

