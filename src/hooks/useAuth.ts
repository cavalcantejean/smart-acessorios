
"use client";
import React, { useState, useEffect, useCallback, createContext, useContext, type ReactNode } from 'react';
import { auth, db } from '@/lib/firebase';
import {
  onAuthStateChanged,
  signOut,
  type User as FirebaseUser,
  type UserCredential 
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'; 
import type { AuthUser, UserFirestoreData } from '@/lib/types';
import { useRouter } from 'next/navigation';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

export interface AuthContextType {
  user: AuthUser | null;
  firebaseUser: FirebaseUser | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  logout: () => Promise<void>;
  refreshAuthUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const processAuthStateChange = useCallback(async (fbUser: FirebaseUser | null) => {
    console.log("useAuth: processAuthStateChange TRIGGERED. fbUser UID:", fbUser ? fbUser.uid : "null");
    setIsLoading(true);

    try {
      if (fbUser) {
        console.log("useAuth: fbUser detected. Setting firebaseUser state for UID:", fbUser.uid);
        setFirebaseUser(fbUser);

        console.log("useAuth: Fetching Firestore data for UID:", fbUser.uid);
        const userDocRef = doc(db, "usuarios", fbUser.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          const firestoreData = userDocSnap.data() as UserFirestoreData;
          const currentAuthUser: AuthUser = {
            id: fbUser.uid,
            email: fbUser.email,
            name: firestoreData.name || fbUser.displayName || "Usuário",
            isAdmin: firestoreData.isAdmin || false,
          };
          console.log(`useAuth: Firestore data found & AuthUser set for UID: ${fbUser.uid}, Name: ${currentAuthUser.name}, Admin: ${currentAuthUser.isAdmin}`);
          setAuthUser(currentAuthUser);
        } else {
          console.warn(`useAuth: User ${fbUser.uid} authenticated (Firebase Auth) but NO Firestore document.`);
          
          const isSocialLogin = fbUser.providerData.some(
            (provider) => provider.providerId === GoogleAuthProvider.PROVIDER_ID
          );

          if (isSocialLogin) {
            console.log(`useAuth: User ${fbUser.uid} is a new social login (e.g., Google). Creating Firestore document.`);
            const newUserFirestoreData: Omit<UserFirestoreData, 'createdAt' | 'updatedAt'> = { 
              id: fbUser.uid,
              name: fbUser.displayName || "Usuário Social",
              email: fbUser.email || "email.social@desconhecido.com",
              isAdmin: false,
              avatarUrl: fbUser.photoURL || `https://placehold.co/150x150.png?text=${(fbUser.displayName || 'S').charAt(0).toUpperCase()}`,
              avatarHint: "user avatar social",
              bio: `Novo membro via login social!`,
            };
            await setDoc(userDocRef, {
                ...newUserFirestoreData,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            });
            console.log(`useAuth: Firestore document CREATED for new social user: ${fbUser.uid}`);
            const currentAuthUser: AuthUser = {
              id: newUserFirestoreData.id,
              email: newUserFirestoreData.email,
              name: newUserFirestoreData.name,
              isAdmin: newUserFirestoreData.isAdmin,
            };
            setAuthUser(currentAuthUser);
          } else {
            console.warn(`useAuth: User ${fbUser.uid} authenticated via non-social method but NO Firestore document. Forcing logout.`);
            await signOut(auth);
          }
        }
      } else {
        console.log("useAuth: No Firebase user (logged out or initial state). Clearing authUser and firebaseUser states.");
        setAuthUser(null);
        setFirebaseUser(null);
      }
    } catch (error) {
      console.error("useAuth: CRITICAL ERROR inside processAuthStateChange:", error);
      setAuthUser(null);
      setFirebaseUser(null);
      if (auth.currentUser) {
        console.log("useAuth: Attempting to sign out Firebase user due to error in processAuthStateChange.");
        try {
          await signOut(auth);
        } catch (signOutError) {
          console.error("useAuth: Error attempting to sign out Firebase user after error in processAuthStateChange:", signOutError);
        }
      }
    } finally {
      console.log("useAuth: processAuthStateChange - Bloco FINALLY. Definindo isLoading para FALSE.");
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    console.log("useAuth: Setting up onAuthStateChanged listener.");
    const unsubscribe = onAuthStateChanged(auth, (fbUser) => {
      processAuthStateChange(fbUser);
    });

    return () => {
      console.log("useAuth: Cleaning up onAuthStateChanged listener (AuthProvider unmounted).");
      unsubscribe();
    };
  }, [processAuthStateChange]);

  const logout = useCallback(async () => {
    console.log("useAuth: logout function called.");
    setIsLoading(true);
    try {
      await signOut(auth);
      console.log("useAuth: signOut successful. Navigating to homepage.");
      router.push('/');
    } catch (error) {
      console.error("useAuth: Error during signOut: ", error);
      setIsLoading(false);
    }
  }, [router]);

  const refreshAuthUser = useCallback(async () => {
    console.log("useAuth: refreshAuthUser called.");
    const currentUser = auth.currentUser;
    console.log("useAuth: refreshAuthUser - current Firebase user from auth.currentUser:", currentUser ? currentUser.uid : "null");
    await processAuthStateChange(currentUser);
  }, [processAuthStateChange]);

  const isAuthenticated = !isLoading && !!authUser && !!firebaseUser;
  const isAdmin = !isLoading && (authUser?.isAdmin ?? false);

  if (typeof window !== 'undefined') {
     // console.log(`useAuth: AuthProvider rendering/re-rendering. isLoading: ${isLoading}, isAuthenticated: ${isAuthenticated}, isAdmin: ${isAdmin}, authUser ID: ${authUser ? authUser.id : "null"}, fbUser UID: ${firebaseUser ? firebaseUser.uid : "null"}`);
  }

  return React.createElement(
    AuthContext.Provider,
    { value: { user: authUser, firebaseUser, isAuthenticated, isAdmin, isLoading, logout, refreshAuthUser } },
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
