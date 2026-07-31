import bcrypt from 'bcryptjs';
import jwt, { JwtPayload, Secret } from 'jsonwebtoken';
import config from '../../config';

export const hashPassword = async (password: string): Promise<string> => {
  return await bcrypt.hash(password, config.bcrypt_salt_rounds);
};

export const comparePassword = async (
  plainTextPassword: string,
  hashedPassword: string
): Promise<boolean> => {
  return await bcrypt.compare(plainTextPassword, hashedPassword);
};

export const createToken = (
  jwtPayload: { id: string; email: string; role: string },
  secret: Secret,
  expiresIn: string
): string => {
  return jwt.sign(jwtPayload, secret, {
    expiresIn: expiresIn as jwt.SignOptions['expiresIn'],
  });
};

export const verifyToken = (token: string, secret: Secret): JwtPayload => {
  return jwt.verify(token, secret) as JwtPayload;
};
