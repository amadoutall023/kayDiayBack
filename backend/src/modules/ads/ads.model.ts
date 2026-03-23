import prisma from '../../../prisma/client';

export const createAd = async (data: {
  title: string;
  description: string;
  price: number;
  phone?: string;
  address?: string;
  categoryId: number;
  images: string;
  userId: number;
}) => {
  return await prisma.ad.create({
    data: {
      title: data.title,
      description: data.description,
      price: data.price,
      phone: data.phone,
      address: data.address,
      categoryId: data.categoryId,
      images: data.images,
      status: 'pending_verification',
      verificationStatus: 'in_review',
      userId: data.userId
    },
    include: {
      category: true,
      user: { select: { id: true, name: true, email: true } }
    }
  });
};

export const getAds = async (where: any, skip: number, take: number) => {
  const ads = await prisma.ad.findMany({
    where,
    include: {
      category: true,
      user: { select: { id: true, name: true } }
    },
    skip,
    take,
    orderBy: { createdAt: 'desc' }
  });

  // Parse images JSON for each ad
  return ads.map(ad => ({
    ...ad,
    images: (ad as any).images ? JSON.parse((ad as any).images) : []
  }));
};

export const countAds = async (where: any) => {
  return await prisma.ad.count({ where });
};

export const findAdByIdAndUser = async (adId: number, userId: number) => {
  return await prisma.ad.findFirst({
    where: { id: adId, userId, status: { not: 'deleted' } }
  });
};

export const updateAd = async (id: number, data: any) => {
  return await prisma.ad.update({
    where: { id },
    data
  });
};