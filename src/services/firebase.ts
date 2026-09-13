import { initializeApp, getApps, getApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider, 
  GithubAuthProvider,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser
} from "firebase/auth";
import { getDatabase, ref, set, get, child, onValue } from "firebase/database";

const env = (import.meta as any).env || {};

// Your web app's Firebase configuration
export const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY || "AIzaSyAu8BM2KDpOa8dbqbpBjPN-wYotj3r6VjU",
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || "scmain-b2cde.firebaseapp.com",
  databaseURL: env.VITE_FIREBASE_DATABASE_URL || "https://scmain-b2cde-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: env.VITE_FIREBASE_PROJECT_ID || "scmain-b2cde",
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || "scmain-b2cde.firebasestorage.app",
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || "781407518974",
  appId: env.VITE_FIREBASE_APP_ID || "1:781407518974:web:efa17000fc961fac8aa5af",
  measurementId: env.VITE_FIREBASE_MEASUREMENT_ID || "G-CGR084SKP9"
};

// Initialize Firebase
export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Analytics if supported in environment
export let analytics: any = null;
if (typeof window !== "undefined") {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  }).catch(() => {});
}

// Initialize Auth & Realtime Database
export const auth = getAuth(app);
export const database = getDatabase(app);

// Google & GitHub Auth Providers
export const googleProvider = new GoogleAuthProvider();
export const githubProvider = new GithubAuthProvider();

export {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  ref,
  set,
  get,
  child,
  onValue
};
export type { FirebaseUser };
