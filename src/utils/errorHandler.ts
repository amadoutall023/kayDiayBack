import { Request, Response, NextFunction } from 'express';
import winston from 'winston';

const logger = winston.createLogger({
  level: 'error',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log' }),
    new winston.transports.Console()
  ]
});

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  logger.error(err);

  if (err.name === 'ValidationError') {
    return res.status(400).json({ error: 'Erreur de validation', details: err.errors });
  }

  if (err.code === 'P2002') {
    return res.status(409).json({ error: 'Conflit de données (valeur unique)' });
  }

  res.status(err.status || 500).json({
    error: err.message || 'Erreur interne du serveur'
  });
};