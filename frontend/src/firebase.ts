import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getAnalytics, logEvent, Analytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIza-demo",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

let app: any;
try {
  app = initializeApp(firebaseConfig);
} catch (error) {
  console.error('Firebase failed to initialize. Check your environment variables:', error);
  app = { name: '[DEFAULT]', options: {}, automaticDataCollectionEnabled: false }; 
}


export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

let analytics: Analytics | null = null;
if (typeof window !== 'undefined' && import.meta.env.VITE_FIREBASE_MEASUREMENT_ID?.startsWith('G-')) {
  try {
    analytics = getAnalytics(app);
  } catch (err) {
    console.error('Firebase Analytics failed to initialize:', err);
  }
}

export const logAnalyticsEvent = (eventName: string, params?: any) => {
  if (analytics) {
    logEvent(analytics, eventName, params);
  }
};

export default app;
