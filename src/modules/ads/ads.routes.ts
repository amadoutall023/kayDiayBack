import { Router } from 'express';
import { uploadPhoto, createAd, getAds, getMyAds, getAdById, extendAd, updateAd, deleteAd } from './ads.controller';
import { validateRequest } from '../../middlewares/validateRequest';
import { authenticateToken } from '../../middlewares/auth.middleware';
import { createAdSchema, extendAdSchema } from './ads.schemas';

const router = Router();

router.post('/upload-photo', authenticateToken, uploadPhoto);
router.post('/', authenticateToken, validateRequest(createAdSchema), createAd);
router.get('/', getAds);
router.get('/my-ads', authenticateToken, getMyAds);
router.get('/:id', getAdById);
router.put('/:id', authenticateToken, validateRequest(createAdSchema), updateAd);
router.delete('/:id', authenticateToken, deleteAd);
router.post('/extend', authenticateToken, validateRequest(extendAdSchema), extendAd);

export default router;