import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { getAnalytics, logEvent } from 'firebase/analytics';

// Firebase configuration (using placeholders for demo, but structure is correct)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSy_fake_key_for_demo",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "crowdpulse-demo.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "crowdpulse-demo",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "crowdpulse-demo.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:123456789:web:abcdef",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-ABCDEF"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Initialize Analytics selectively
export let analytics = null;
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
}

/**
 * Log page views or custom events
 * @param {string} eventName 
 * @param {object} eventParams 
 */
export const trackEvent = (eventName, eventParams = {}) => {
  if (analytics) {
    logEvent(analytics, eventName, eventParams);
  }
};
