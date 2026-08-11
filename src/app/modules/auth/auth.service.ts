import { UserRole } from '@prisma/client';
import AppError from '../../errors/AppError';
import prisma from '../../utils/prisma';
import config from '../../config';
import { comparePassword, createToken, hashPassword } from './auth.utils';

type TRegisterUserData = {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
};

type TLoginUserData = {
  email: string;
  password: string;
};

export const DEFAULT_CARTOON_AVATARS = [
  'https://api.dicebear.com/7.x/bottts/svg?seed=GearUpHero1',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=GearUpHero2',
  'https://api.dicebear.com/7.x/adventurer/svg?seed=GearUpHero3',
  'https://api.dicebear.com/7.x/micah/svg?seed=GearUpHero4',
  'https://api.dicebear.com/7.x/bottts/svg?seed=GearUpHero5',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=GearUpHero6',
  'https://api.dicebear.com/7.x/adventurer/svg?seed=GearUpHero7',
  'https://api.dicebear.com/7.x/micah/svg?seed=GearUpHero8',
];

const registerUserIntoDB = async (payload: TRegisterUserData) => {
  const existingUser = await prisma.user.findUnique({
    where: { email: payload.email },
  });

  if (existingUser) {
    throw new AppError(400, 'User with this email already exists');
  }

  const hashedPassword = await hashPassword(payload.password);
  const randomAvatar = DEFAULT_CARTOON_AVATARS[Math.floor(Math.random() * DEFAULT_CARTOON_AVATARS.length)];

  const newUser = await prisma.user.create({
    data: {
      name: payload.name,
      email: payload.email,
      password: hashedPassword,
      avatarUrl: randomAvatar,
      role: payload.role || 'CUSTOMER',
    },
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

  return newUser;
};

const loginUserFromDB = async (payload: TLoginUserData) => {
  const user = await prisma.user.findUnique({
    where: { email: payload.email },
  });

  if (!user) {
    throw new AppError(401, 'Invalid email or password');
  }

  if (user.status === 'SUSPENDED') {
    throw new AppError(403, 'Your account has been suspended by an administrator');
  }

  const isPasswordMatch = await comparePassword(payload.password, user.password);
  if (!isPasswordMatch) {
    throw new AppError(401, 'Invalid email or password');
  }

  const jwtPayload = {
    id: user.id,
    email: user.email,
    role: user.role,
  };

  const accessToken = createToken(
    jwtPayload,
    config.jwt.access_secret,
    config.jwt.access_expires_in
  );

  return {
    accessToken,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      avatarUrl: user.avatarUrl || DEFAULT_CARTOON_AVATARS[0],
      role: user.role,
      status: user.status,
    },
  };
};

const getProfileFromDB = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
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

  if (!user) {
    throw new AppError(404, 'User profile not found');
  }

  return user;
};

export const AuthService = {
  registerUserIntoDB,
  loginUserFromDB,
  getProfileFromDB,
};

