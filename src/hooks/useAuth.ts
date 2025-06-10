
"use client";
import React, { useState, useEffect, useCallback, createContext, useContext, type ReactNode } from 'react';
import { auth, db } from '@/lib/firebase'; // Import Firebase auth and db
import { 
  onAuthStateChanged, 
  signOut,
  type User as FirebaseUser // Firebase Auth User type
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import type { AuthUser, UserFirestoreData } from '@/lib/types';

interface AuthContextType {
  user: AuthUser | null;
  firebaseUser: FirebaseUser | null; // Raw Firebase user object
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  // login function is now handled by loginUserAction which uses Firebase SDK
  logout: () => Promise<void>; // Logout is now async
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setIsLoading(true);
      if (fbUser) {
        setFirebaseUser(fbUser);
        // Fetch additional user data (like name, isAdmin) from Firestore
        const userDocRef = doc(db, "usuarios", fbUser.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          const firestoreData = userDocSnap.data() as UserFirestoreData;
          setAuthUser({
            id: fbUser.uid,
            email: fbUser.email,
            name: firestoreData.name || fbUser.displayName, // Prefer Firestore name
            isAdmin: firestoreData.isAdmin || false,
          });
        } else {
          // User exists in Auth but not Firestore (should not happen with current register flow)
          // Or, this is a new user and their Firestore doc is about to be created
          console.warn(`User ${fbUser.uid} authenticated but no Firestore document found. Creating a basic AuthUser.`);
          setAuthUser({
            id: fbUser.uid,
            email: fbUser.email,
            name: fbUser.displayName || "Novo Usuário", // Fallback name
            isAdmin: false, // Default to not admin
          });
        }
      } else {
        setFirebaseUser(null);
        setAuthUser(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      await signOut(auth);
      // onAuthStateChanged will handle setting user to null
    } catch (error) {
      console.error("Error signing out: ", error);
    } finally {
      // Let onAuthStateChanged handle loading state if appropriate,
      // or set it false here if there's no further async activity.
      // For now, onAuthStateChanged should set isLoading to false after state update.
    }
  }, []);

  const isAuthenticated = !!authUser && !!firebaseUser;
  const isAdmin = authUser?.isAdmin ?? false;

  return React.createElement(
    AuthContext.Provider,
    { value: { user: authUser, firebaseUser, isAuthenticated, isAdmin, isLoading, logout } },
    children
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
