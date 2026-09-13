import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  auth, 
  googleProvider, 
  signInWithPopup, 
  signOut as firebaseSignOut, 
  onAuthStateChanged,
  FirebaseUser,
  database,
  ref,
  set
} from '../services/firebase';

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  role: 'student' | 'developer' | 'instructor';
}

interface AuthContextType {
  user: UserProfile | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  signInWithGoogle: () => Promise<UserProfile>;
  signInWithEmailPassword: (email: string, password?: string, displayName?: string) => Promise<UserProfile>;
  signInWithGuest: (name?: string, email?: string) => Promise<UserProfile>;
  signOut: () => Promise<void>;
  authError: string | null;
  setAuthError: (err: string | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [user, setUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('infinity_user');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return null;
  });
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setFirebaseUser(currentUser);
      if (currentUser) {
        const profile: UserProfile = {
          uid: currentUser.uid,
          email: currentUser.email,
          displayName: currentUser.displayName || currentUser.email?.split('@')[0] || 'Developer',
          photoURL: currentUser.photoURL,
          role: 'developer'
        };
        setUser(profile);
        localStorage.setItem('infinity_user', JSON.stringify(profile));

        // Sync to Firebase Realtime Database
        try {
          const userRef = ref(database, `users/${currentUser.uid}`);
          set(userRef, {
            ...profile,
            lastLogin: new Date().toISOString()
          }).catch(() => {});
        } catch (e) {}
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleSignInWithGoogle = async (): Promise<UserProfile> => {
    setAuthError(null);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const curUser = result.user;
      const profile: UserProfile = {
        uid: curUser.uid,
        email: curUser.email,
        displayName: curUser.displayName || curUser.email?.split('@')[0] || 'Developer',
        photoURL: curUser.photoURL,
        role: 'developer'
      };
      setUser(profile);
      localStorage.setItem('infinity_user', JSON.stringify(profile));

      try {
        const userRef = ref(database, `users/${curUser.uid}`);
        await set(userRef, {
          ...profile,
          lastLogin: new Date().toISOString()
        });
      } catch (e) {}

      return profile;
    } catch (error: any) {
      console.error('Firebase Google Sign In Error:', error);
      const msg = error.code === 'auth/popup-closed-by-user' 
        ? 'Sign in popup was closed.' 
        : error.code === 'auth/unauthorized-domain'
        ? 'Firebase auth domain not authorized. You can also use email or 1-click login below.'
        : error.message || 'Google Authentication failed';
      setAuthError(msg);
      throw new Error(msg);
    }
  };

  const handleSignInWithEmailPassword = async (email: string, _password?: string, displayName?: string): Promise<UserProfile> => {
    setAuthError(null);
    const cleanEmail = email.trim() || 'developer@sc-infinity.ai';
    const cleanName = displayName?.trim() || cleanEmail.split('@')[0] || 'Developer';
    const profile: UserProfile = {
      uid: `usr_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      email: cleanEmail,
      displayName: cleanName,
      photoURL: null,
      role: 'developer'
    };
    setUser(profile);
    localStorage.setItem('infinity_user', JSON.stringify(profile));
    return profile;
  };

  const handleSignInWithGuest = async (name: string = 'Developer', email: string = 'demo@sc-infinity.ai'): Promise<UserProfile> => {
    setAuthError(null);
    const profile: UserProfile = {
      uid: `guest_${Date.now()}`,
      email,
      displayName: name,
      photoURL: null,
      role: 'developer'
    };
    setUser(profile);
    localStorage.setItem('infinity_user', JSON.stringify(profile));
    return profile;
  };

  const handleSignOut = async () => {
    try {
      await firebaseSignOut(auth).catch(() => {});
      setUser(null);
      localStorage.removeItem('infinity_user');
    } catch (error: any) {
      console.error('Sign Out Error:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        firebaseUser,
        loading,
        signInWithGoogle: handleSignInWithGoogle,
        signInWithEmailPassword: handleSignInWithEmailPassword,
        signInWithGuest: handleSignInWithGuest,
        signOut: handleSignOut,
        authError,
        setAuthError
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
