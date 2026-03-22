/**
 * Firebase initialisation and shared service exports.
 * Config is loaded from firebase-applet-config.json (not committed with secrets).
 */
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
// Uses the custom database ID from config to support non-default Firestore instances.
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
// Google OAuth provider used for sign-in popup.
export const googleProvider = new GoogleAuthProvider();

/** Triggers the Google sign-in popup and returns the credential promise. */
export const signIn = () => signInWithPopup(auth, googleProvider);
/** Signs the current user out of Firebase Auth. */
export const logOut = () => signOut(auth);

// Verify connectivity to Firestore on startup so misconfiguration is surfaced early.
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration.");
    }
  }
}
testConnection();
