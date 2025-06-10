
"use client";
import React, { useState, useEffect, useCallback, createContext, useContext, type ReactNode } from 'react';
import { auth, db } from '@/lib/firebase'; 
import { 
  onAuthStateChanged, 
  signOut,
  type User as FirebaseUser 
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import type { AuthUser, UserFirestoreData } from '@/lib/types';

interface AuthContextType {
  user: AuthUser | null;
  firebaseUser: FirebaseUser | null; 
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  logout: () => Promise<void>; 
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log("useAuth: Setting up onAuthStateChanged listener.");
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      console.log("useAuth: onAuthStateChanged triggered. fbUser:", fbUser ? fbUser.uid : "null");
      setIsLoading(true);
      if (fbUser) {
        setFirebaseUser(fbUser);
        console.log("useAuth: Firebase user found (UID:", fbUser.uid, "). Fetching Firestore data...");
        const userDocRef = doc(db, "usuarios", fbUser.uid);
        try {
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists()) {
            const firestoreData = userDocSnap.data() as UserFirestoreData;
            console.log("useAuth: Firestore data found for UID:", fbUser.uid, "isAdmin:", firestoreData.isAdmin);
            setAuthUser({
              id: fbUser.uid,
              email: fbUser.email, // Email from Firebase Auth user object
              name: firestoreData.name || fbUser.displayName || "Usuário", 
              isAdmin: firestoreData.isAdmin || false,
            });
          } else {
            console.warn(`useAuth: User ${fbUser.uid} authenticated but no Firestore document found. Logging out potentially incomplete user.`);
            // This case could happen if Firestore doc creation failed after Auth creation
            // Or if the user was deleted from Firestore but not Auth.
            // For safety, treat as not fully logged in or log out.
            await signOut(auth); // This will trigger onAuthStateChanged again with fbUser = null
            setFirebaseUser(null);
            setAuthUser(null);
          }
        } catch (error) {
            console.error("useAuth: Error fetching user document from Firestore:", error);
            // Potentially log out the user if essential data cannot be fetched
            await signOut(auth);
            setFirebaseUser(null);
            setAuthUser(null);
        }
      } else {
        console.log("useAuth: No Firebase user. Clearing auth state.");
        setFirebaseUser(null);
        setAuthUser(null);
      }
      setIsLoading(false);
      console.log("useAuth: isLoading set to false.");
    });

    return () => {
      console.log("useAuth: Cleaning up onAuthStateChanged listener.");
      unsubscribe();
    };
  }, []);

  const logout = useCallback(async () => {
    console.log("useAuth: logout called.");
    setIsLoading(true);
    try {
      await signOut(auth);
      // onAuthStateChanged will handle setting user to null & isLoading to false
      console.log("useAuth: signOut successful.");
    } catch (error) {
      console.error("useAuth: Error signing out: ", error);
      setIsLoading(false); // Ensure loading state is reset on error
    }
  }, []);

  const isAuthenticated = !!authUser && !!firebaseUser;
  const isAdmin = authUser?.isAdmin ?? false;

  if (isLoading) {
      console.log("useAuth: AuthProvider rendering loading state (isLoading is true).");
  } else {
      console.log("useAuth: AuthProvider rendering. isAuthenticated:", isAuthenticated, "isAdmin:", isAdmin, "User:", authUser ? authUser.id : "null");
  }

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
