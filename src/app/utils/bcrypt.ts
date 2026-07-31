import bcrypt from 'bcryptjs';
import config from '../config';

export const hashPassword = async (password: string): Promise<string> => {
  return await bcrypt.hash(password, Number(config.bcrypt_salt_rounds));
};

export const comparePassword = async (plainText: string, hashedText: string): Promise<boolean> => {
  return await bcrypt.compare(plainText, hashedText);
};
