import { Request, Response, NextFunction } from 'express';
import admin from '../services/firebase';
import logger from '../utils/logger';

/**
 * Professional JWT Middleware using Firebase Admin
 * This replaces the simple static token check.
 */
export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: No token provided.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    // If Firebase is initialized, verify real JWT
    // Otherwise fallback to the legacy secret for backward compatibility in demo
    if (admin.apps.length > 0) {
      const decodedToken = await admin.auth().verifyIdToken(token);
      (req as any).user = decodedToken;
    } else {
      if (token !== (process.env.ADMIN_SECRET || 'crowdpulse-admin-2024')) {
        throw new Error('Invalid legacy token');
      }
      (req as any).user = { role: 'admin', uid: 'legacy-admin' };
    }
    next();
  } catch (error) {
    logger.warn({ error: (error as Error).message }, 'Authentication Failed');
    return res.status(403).json({ error: 'Forbidden: Invalid token.' });
  }
};
