import { Router } from 'express';
import { getCategories, createCategory, updateCategory, deleteCategory } from './categories.controller';
import { authenticateToken, requireRole } from '../../middlewares/auth.middleware';

const router = Router();

router.get('/', getCategories);
router.post('/', authenticateToken, requireRole(['admin']), createCategory);
router.put('/:id', authenticateToken, requireRole(['admin']), updateCategory);
router.delete('/:id', authenticateToken, requireRole(['admin']), deleteCategory);

export default router;