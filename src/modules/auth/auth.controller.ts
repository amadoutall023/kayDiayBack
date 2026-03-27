import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { createUser, findUserByEmail, createSellerRequest } from '../users/users.model';

export const register = async (req: Request, res: Response) => {
   try {
     const { name, email, password, role } = req.body;

     // Vérifier si l'utilisateur existe déjà
     const existingUser = await findUserByEmail(email);
     if (existingUser) {
       return res.status(409).json({ error: 'Cet email est déjà utilisé' });
     }

     // Hacher le mot de passe
     const hashedPassword = await bcrypt.hash(password, 10);

     // Créer l'utilisateur avec le rôle demandé
     const userRole = role === 'seller' ? 'pending_seller' : 'user';
     const userStatus = role === 'seller' ? 'pending_verification' : 'active';

     const user = await createUser({
       name,
       email,
       password: hashedPassword,
       role: userRole,
       status: userStatus
     });

     // Si c'est une demande de vendeur, créer une demande d'approbation
     if (role === 'seller') {
       await createSellerRequest({
         userId: user.id,
         reason: 'Demande d\'approbation pour devenir vendeur'
       });
     }

     res.status(201).json({
       user,
       message: role === 'seller'
         ? 'Votre demande de compte vendeur a été soumise. Elle sera examinée par un administrateur.'
         : 'Compte créé avec succès.'
     });
   } catch (error) {
     console.error('Erreur lors de l\'inscription:', error);
     res.status(500).json({ error: 'Erreur lors de l\'inscription' });
   }
 };

export const login = async (req: Request, res: Response) => {
   try {
     const { email, password } = req.body;

     // Trouver l'utilisateur
     const user = await findUserByEmail(email);
     if (!user) {
       return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
     }

     // Vérifier le statut de l'utilisateur
     if ((user as any).status === 'pending_verification') {
       return res.status(403).json({
         error: 'Votre compte est en attente de vérification par un administrateur. Vous serez notifié une fois approuvé.'
       });
     }

     if ((user as any).status === 'suspended') {
       return res.status(403).json({ error: 'Votre compte a été suspendu.' });
     }

     // Vérifier le mot de passe
     const isValidPassword = await bcrypt.compare(password, user.password);
     if (!isValidPassword) {
       return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
     }

     // Générer le token JWT
     const token = jwt.sign(
       { id: user.id, email: user.email, role: user.role },
       process.env.JWT_SECRET!,
       { expiresIn: '7d' }
     );

     res.json({
       user: {
         id: user.id,
         name: user.name,
         email: user.email,
         role: user.role,
         status: (user as any).status
       },
       token
     });
   } catch (error) {
     console.error('Erreur lors de la connexion:', error);
     res.status(500).json({ error: 'Erreur lors de la connexion' });
   }
 };