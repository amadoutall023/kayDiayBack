import { Request, Response } from 'express';
import { getPendingAds as getPendingAdsModel, approveAd as approveAdModel, rejectAd as rejectAdModel } from './verification.model';

export const getPendingAds = async (req: Request, res: Response) => {
  try {
    const ads = await getPendingAdsModel();

    res.json({ ads });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la récupération des annonces en attente' });
  }
};

export const approveAd = async (req: Request, res: Response) => {
  try {
    const { adId } = req.params;

    const ad = await approveAdModel(parseInt(adId));

    res.json({ ad, message: 'Annonce approuvée avec succès' });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de l\'approbation de l\'annonce' });
  }
};

export const rejectAd = async (req: Request, res: Response) => {
  try {
    const { adId } = req.params;
    const { reason } = req.body;

    const ad = await rejectAdModel(parseInt(adId), reason);

    res.json({ ad, message: 'Annonce rejetée' });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors du rejet de l\'annonce' });
  }
};