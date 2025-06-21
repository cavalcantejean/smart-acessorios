"use client";
import React, { useState, useEffect, useCallback, createContext, useContext, type ReactNode } from 'react';
import {
  onAuthStateChanged,
  signOut,
  type User as FirebaseUser,
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'; 
import type { AuthUser, UserFirestoreData } from '@/lib/types';
import { useRouter } from 'next/navigation';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth, db } from '@/lib/firebase-client';

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

  console.log('%cAuthProvider: INÍCIO DO RENDER', 'color: purple; font-weight: bold;');

  const processAuthStateChange = useCallback(async (fbUser: FirebaseUser | null) => {
    console.log('%cuseAuth: processAuthStateChange INICIADO. fbUser UID:', 'color: blue;', fbUser ? fbUser.uid : "null");
    setIsLoading(true);

    if (fbUser) {
      setFirebaseUser(fbUser);
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
        console.log(`%cuseAuth: Firestore OK. isAdmin: ${currentAuthUser.isAdmin}`, 'color: green;');
        setAuthUser(currentAuthUser);
      } else {
        console.warn(`%cuseAuth: Documento Firestore NÃO ENCONTRADO para ${fbUser.uid}. Forçando logout.`, 'color: orange;');
        await signOut(auth);
      }
    } else {
      console.log('%cuseAuth: Nenhum usuário Firebase. limpando estados.', 'color: blue;');
      setAuthUser(null);
      setFirebaseUser(null);
    }
    
    console.log('%cuseAuth: processAuthStateChange FINALIZADO. Setando isLoading para FALSE.', 'color: blue; font-weight: bold;');
    setIsLoading(false);
  }, []);

  useEffect(() => {
    console.log('%cuseAuth: Montando listener onAuthStateChanged.', 'color: gray;');
    const unsubscribe = onAuthStateChanged(auth, processAuthStateChange);
    return () => {
      console.log('%cuseAuth: Desmontando listener onAuthStateChanged.', 'color: gray;');
      unsubscribe();
    };
  }, [processAuthStateChange]);
  
  const logout = useCallback(async () => {
      await signOut(auth);
      router.push('/');
    }, [router]);
    
  const refreshAuthUser = useCallback(async () => {
      await processAuthStateChange(auth.currentUser);
    }, [processAuthStateChange]);

  const isAuthenticated = !isLoading && !!authUser && !!firebaseUser;
  const isAdmin = !isLoading && (authUser?.isAdmin ?? false);

  console.log(`%cAuthProvider: FIM DO RENDER. Estado Atual: isLoading=${isLoading}, isAdmin=${isAdmin}, isAuthenticated=${isAuthenticated}`, 'color: purple; font-weight: bold;');

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