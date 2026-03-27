import prisma from '../../../prisma/client';

export const createUser = async (data: { name: string; email: string; password: string; role?: string; status?: string }) => {
  return await prisma.user.create({
    data,
    select: { id: true, name: true, email: true, role: true, status: true, createdAt: true }
  });
};

export const createSellerRequest = async (data: { userId: number; reason?: string }) => {
  return await prisma.sellerRequest.create({
    data,
    include: { user: true }
  });
};

export const getSellerRequests = async (status?: string) => {
  const where: any = {};
  if (status) where.status = status;

  return await prisma.sellerRequest.findMany({
    where,
    include: { user: true },
    orderBy: { createdAt: 'desc' }
  });
};

export const updateSellerRequest = async (id: number, data: { status: string; reason?: string; reviewedBy?: number }) => {
  return await prisma.sellerRequest.update({
    where: { id },
    data: {
      ...data,
      reviewedAt: new Date()
    },
    include: { user: true }
  });
};

export const updateUserRole = async (id: number, role: string) => {
  return await prisma.user.update({
    where: { id },
    data: { role },
    select: { id: true, name: true, email: true, role: true, status: true }
  });
};

export const findUserByEmail = async (email: string) => {
  return await prisma.user.findUnique({
    where: { email },
    select: { id: true, name: true, email: true, password: true, role: true, status: true, createdAt: true }
  });
};

export const findUserById = async (id: number ) => {
  return await prisma.user.findUnique({
    where: { id },
    select: { id: true, name: true, email: true, role: true, createdAt: true }
  });
};

export const updateUser = async (id: number , data: { name?: string }) => {
  return await prisma.user.update({
    where: { id },
    data,
    select: { id: true, name: true, email: true, role: true, createdAt: true }
  });
};