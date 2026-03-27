import { Router } from 'express';
import { getPendingAds, approveAd, rejectAd } from './verification.controller';
import { authenticateToken, requireRole } from '../../middlewares/auth.middleware';

const router = Router();

router.get('/pending', authenticateToken, requireRole(['admin', 'moderator']), getPendingAds);
router.put('/:adId/approve', authenticateToken, requireRole(['admin', 'moderator']), approveAd);
router.put('/:adId/reject', authenticateToken, requireRole(['admin', 'moderator']), rejectAd);

export default router;