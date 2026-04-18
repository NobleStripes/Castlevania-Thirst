import { initializeApp, type FirebaseOptions } from 'firebase/app';
import {
  GoogleAuthProvider,
  getAuth,
  signInWithPopup,
  signOut,
  type UserCredential,
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig: FirebaseOptions = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

const hasRequiredFirebaseConfig = Boolean(
  firebaseConfig.apiKey &&
    firebaseConfig.authDomain &&
    firebaseConfig.projectId &&
    firebaseConfig.storageBucket &&
    firebaseConfig.messagingSenderId &&
    firebaseConfig.appId,
);

export const isFirebaseConfigured = hasRequiredFirebaseConfig;

const app = hasRequiredFirebaseConfig ? initializeApp(firebaseConfig) : null;

export const auth = app ? getAuth(app) : null;

const databaseId = import.meta.env.VITE_FIREBASE_DATABASE_ID;
export const db = app ? (databaseId ? getFirestore(app, databaseId) : getFirestore(app)) : null;

const googleProvider = auth ? new GoogleAuthProvider() : null;

export async function signIn(): Promise<UserCredential | null> {
  if (!auth || !googleProvider) {
    return null;
  }

  return signInWithPopup(auth, googleProvider);
}

export async function logOut(): Promise<void> {
  if (!auth) {
    return;
  }

  await signOut(auth);
}
