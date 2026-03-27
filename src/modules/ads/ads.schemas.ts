import { z } from 'zod';

export const createAdSchema = z.object({
  title: z.string().min(3, 'Le titre doit contenir au moins 3 caractères'),
  description: z.string().min(10, 'La description doit contenir au moins 10 caractères'),
  price: z.coerce.number().positive('Le prix doit être positif'),
  phone: z.string().min(7, 'Le numéro de téléphone doit contenir au moins 7 caractères').optional(),
  address: z.string().min(5, 'L\'adresse doit contenir au moins 5 caractères').optional(),
  categoryId: z.coerce.number().int('ID de catégorie invalide'),
  images: z.array(z.string()).min(1, 'Au moins une image est requise').max(4, 'Maximum 4 images autorisées'),
});

export const extendAdSchema = z.object({
  adId: z.number().int('ID d\'annonce invalide'),
});