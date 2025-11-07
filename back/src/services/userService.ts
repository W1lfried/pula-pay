import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const userService = {
  getUserByPhone: async function (phone: string) {
    return await prisma.appUser.findUnique({ where: { phone } });
  },
  
  getUserById: async function (id: string) {
    return await prisma.appUser.findUnique({ where: { id } });
  },

  createUser: async function (phone: string, password: string) {
    return await prisma.appUser.create({
      data: {
        phone: phone,
        passwordHash: password
      }
    });
  },

  addOtp: async function (phone: string, otpCode: string, otpExpiresAt: Date) {
    return await prisma.appUser.update({
      where: { phone },
      data: { otpCode, otpExpiresAt }
    });
  },

  verifiedUser: async function (phone: string) {
    return await prisma.appUser.update({
      where: { phone },
      data: { isVerified: true, otpCode: null, otpExpiresAt: null}
    });
  }
};

export default userService;