import { Request, Response } from 'express';
import multer from 'multer';
import cloudinary from '../../config/cloudinary';
import { createAd as createAdModel, getAds as getAdsModel, countAds, findAdByIdAndUser, updateAd as updateAdModel } from './ads.model';

const upload = multer({ storage: multer.memoryStorage() });

export const uploadPhoto = [
  upload.single('photo'),
  async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'Aucune photo fournie' });
      }

      // Upload vers Cloudinary
      const result = await new Promise<any>((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: 'expat_ads', resource_type: 'image' },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        stream.end(req.file!.buffer);
      });

      res.json({ url: result.secure_url, publicId: result.public_id });
    } catch (error) {
        console.error(error);
      res.status(500).json({ error: 'Erreur lors de l\'upload de la photo' });
    }
  }
];

export const createAd = async (req: Request, res: Response) => {
  try {
    const { title, description, price, phone, address, categoryId, images } = req.body;
    const userId = parseInt((req as any).user.id);

    const ad = await createAdModel({
      title,
      description,
      price: parseFloat(price),
      phone,
      address,
      categoryId: parseInt(categoryId),
      images: JSON.stringify(images),
      userId
    });

    res.status(201).json({ ad });
  } catch (error) {
     console.error(error); // log complet
    res.status(500).json({ error: 'Erreur lors de la création de l\'annonce' });
  }
};

export const getAds = async (req: Request, res: Response) => {
   try {
     const { page = 1, limit = 10, categoryId, status = 'active' } = req.query;

     const where: any = {};
     if (status !== 'all') where.status = status;
     if (categoryId) where.categoryId = parseInt(categoryId as string);

     // Si l'utilisateur n'est pas admin, ne montrer que les annonces actives
     const user = (req as any).user;
     if (!user || user.role !== 'admin') {
       where.status = 'active';
     }

     const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
     const take = parseInt(limit as string);

     const ads = await getAdsModel(where, skip, take);
     const total = await countAds(where);

     res.json({
       ads,
       pagination: {
         page: parseInt(page as string),
         limit: parseInt(limit as string),
         total,
         pages: Math.ceil(total / parseInt(limit as string))
       }
     });
   } catch (error) {
     console.error('Erreur dans getAds:', error);
     res.status(500).json({ error: 'Erreur lors de la récupération des annonces' });
   }
 };

// Get current user's ads
export const getMyAds = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    if (!user) {
      return res.status(401).json({ error: 'Non autorisé' });
    }

    const { page = 1, limit = 10, status, categoryId } = req.query;

    const where: any = { userId: user.id };
    if (status && status !== 'all') {
      where.status = status;
    }
    if (categoryId) {
      where.categoryId = parseInt(categoryId as string);
    }

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
    const take = parseInt(limit as string);

    const ads = await getAdsModel(where, skip, take);
    const total = await countAds(where);

    res.json({
      ads,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total,
        pages: Math.ceil(total / parseInt(limit as string))
      }
    });
  } catch (error) {
    console.error('Erreur dans getMyAds:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération de vos annonces' });
  }
};

export const getAdById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const ad = await getAdsModel({ id: parseInt(id) }, 0, 1);
    
    if (ad.length === 0) {
      return res.status(404).json({ error: 'Annonce non trouvée' });
    }
    
    res.json({ ad: ad[0] });
  } catch (error) {
    console.error('Erreur dans getAdById:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération de l\'annonce' });
  }
};

export const extendAd = async (req: Request, res: Response) => {
  try {
    const { adId } = req.body;
    const userId = parseInt((req as any).user.id);

    const ad = await findAdByIdAndUser(parseInt(adId), userId);

    if (!ad) {
      return res.status(404).json({ error: 'Annonce non trouvée ou non active' });
    }

    const newExpiresAt = new Date(ad.expiresAt!.getTime() + 7 * 24 * 60 * 60 * 1000);

    await updateAdModel(parseInt(adId), { expiresAt: newExpiresAt });

    res.json({ message: 'Annonce prolongée avec succès' });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la prolongation de l\'annonce' });
  }
};

export const updateAd = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, description, price, phone, address, categoryId, images } = req.body;
    const userId = parseInt((req as any).user.id);

    // Vérifier que l'annonce appartient à l'utilisateur
    const existingAd = await findAdByIdAndUser(parseInt(id), userId);
    if (!existingAd) {
      return res.status(404).json({ error: 'Annonce non trouvée ou accès non autorisé' });
    }

    const updatedAd = await updateAdModel(parseInt(id), {
      title,
      description,
      price: parseFloat(price),
      phone,
      address,
      categoryId: parseInt(categoryId),
      images: images ? JSON.stringify(images) : existingAd.images
    });

    res.json({ ad: updatedAd });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour de l\'annonce' });
  }
};

export const deleteAd = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = parseInt((req as any).user.id);

    // Vérifier que l'annonce appartient à l'utilisateur
    const ad = await findAdByIdAndUser(parseInt(id), userId);
    if (!ad) {
      return res.status(404).json({ error: 'Annonce non trouvée ou accès non autorisé' });
    }

    await updateAdModel(parseInt(id), { status: 'deleted' });

    res.json({ message: 'Annonce supprimée avec succès' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur lors de la suppression de l\'annonce' });
  }
};
