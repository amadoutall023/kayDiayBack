import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../../prisma/client';

export interface AuthRequest extends Request {
  user?: {
    id: number;
    email: string;
    role: string;
    status: string;
    name: string;
  };
}

export const authenticateToken = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token d\'authentification manquant' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: number; email: string; role: string };
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        email: true,
        role: true,
        status: true,
        name: true
      }
    });

    if (!user) {
      return res.status(401).json({ error: 'Utilisateur introuvable' });
    }

    if (user.status === 'suspended') {
      return res.status(403).json({ error: 'Votre compte a été suspendu.' });
    }

    req.user = user;
    next();
  } catch {
    return res.status(403).json({ error: 'Token invalide' });
  }
};

export const requireRole = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Accès refusé' });
    }
    next();
  };
};
