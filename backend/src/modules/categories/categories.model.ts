import prisma from '../../../prisma/client';

export const getCategories = async () => {
  return await prisma.category.findMany({
    select: { id: true, name: true, createdAt: true }
  });
};

export const createCategory = async (name: string) => {
  return await prisma.category.create({
    data: { name },
    select: { id: true, name: true, createdAt: true }
  });
};