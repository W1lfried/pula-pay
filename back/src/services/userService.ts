import { Prisma, PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const userService = {
    getUserByPhone: async function (phone: string) {
        return await prisma.appUser.findUnique({ where: { phone } });
    }
};

export default userService;