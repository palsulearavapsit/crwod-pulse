import * as admin from 'firebase-admin';
import logger from '../utils/logger';

// Try to initialize with Environment Variable JSON or default service account
const initializeFirebase = () => {
  try {
    if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
      logger.info('🔥 Firebase Admin initialized via Environment Variable');
    } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      admin.initializeApp();
      logger.info('🔥 Firebase Admin initialized via Default Credentials');
    } else {
      logger.warn('⚠️ No Firebase Credentials found. Operating in Mock Persistence mode.');
      return null;
    }
    return admin.firestore();
  } catch (error) {
    logger.error({ error }, '❌ Failed to initialize Firebase Admin');
    return null;
  }
};

export const db = initializeFirebase();
export default admin;
