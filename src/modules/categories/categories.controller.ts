import { Request, Response } from 'express';
import { getCategories as getCategoriesModel, createCategory as createCategoryModel } from './categories.model';
import prisma from '../../../prisma/client';

export const getCategories = async (req: Request, res: Response) => {
  try {
    const categories = await getCategoriesModel();
    res.json({ categories });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la récupération des catégories' });
  }
};

export const createCategory = async (req: Request, res: Response) => {
  try {
    const { name } = req.body;

    const category = await createCategoryModel(name);

    res.status(201).json({ category });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la création de la catégorie' });
  }
};

export const updateCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    const category = await prisma.category.update({
      where: { id: parseInt(id) },
      data: { name },
      select: { id: true, name: true, createdAt: true, updatedAt: true }
    });

    res.json({ category });
  } catch (error) {
    console.error('Erreur lors de la mise à jour:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour de la catégorie' });
  }
};

export const deleteCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Vérifier si la catégorie a des annonces
    const categoryWithAds = await prisma.category.findUnique({
      where: { id: parseInt(id) },
      include: { _count: { select: { ads: true } } }
    });

    if (!categoryWithAds) {
      return res.status(404).json({ error: 'Catégorie non trouvée' });
    }

    if (categoryWithAds._count.ads > 0) {
      return res.status(400).json({ error: 'Impossible de supprimer une catégorie qui contient des annonces' });
    }

    await prisma.category.delete({
      where: { id: parseInt(id) }
    });

    res.json({ message: 'Catégorie supprimée avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression:', error);
    res.status(500).json({ error: 'Erreur lors de la suppression de la catégorie' });
  }
};