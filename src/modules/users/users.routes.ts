import { Router } from 'express';
import { getPendingSellerRequests, approveSellerRequest, rejectSellerRequest, getSellers, suspendSeller, activateSeller, deleteSeller, requestSellerRole, changePassword } from './users.controller';
import { authenticateToken, requireRole } from '../../middlewares/auth.middleware';
import { validateRequest } from '../../middlewares/validateRequest';
import { changePasswordSchema } from './users.schemas';

const router = Router();

// Route pour demander le rôle vendeur depuis le profil
router.post('/request-seller', authenticateToken, requestSellerRole);
router.put('/change-password', authenticateToken, validateRequest(changePasswordSchema), changePassword);

// Routes admin pour gérer les demandes de vendeurs
router.get('/seller-requests', authenticateToken, requireRole(['admin']), getPendingSellerRequests);
router.put('/seller-requests/:id/approve', authenticateToken, requireRole(['admin']), approveSellerRequest);
router.put('/seller-requests/:id/reject', authenticateToken, requireRole(['admin']), rejectSellerRequest);

// Routes admin pour gérer les vendeurs
router.get('/sellers', authenticateToken, requireRole(['admin']), getSellers);
router.put('/sellers/:id/suspend', authenticateToken, requireRole(['admin']), suspendSeller);
router.put('/sellers/:id/activate', authenticateToken, requireRole(['admin']), activateSeller);
router.delete('/sellers/:id', authenticateToken, requireRole(['admin']), deleteSeller);

export default router;
