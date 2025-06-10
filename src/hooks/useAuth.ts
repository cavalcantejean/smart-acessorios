
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
  const [isLoading, setIsLoading] = useState(true); // Começa como true

  useEffect(() => {
    console.log("useAuth: Setting up onAuthStateChanged listener.");
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      console.log("useAuth: onAuthStateChanged triggered. fbUser UID:", fbUser ? fbUser.uid : "null");
      setIsLoading(true); // Inicia o carregamento ao detectar mudança

      if (fbUser) {
        setFirebaseUser(fbUser);
        console.log("useAuth: Firebase user found (UID:", fbUser.uid, "). Fetching Firestore data...");
        const userDocRef = doc(db, "usuarios", fbUser.uid);
        try {
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists()) {
            const firestoreData = userDocSnap.data() as UserFirestoreData;
            const currentAuthUser: AuthUser = {
              id: fbUser.uid,
              email: fbUser.email, // Email do Firebase Auth
              name: firestoreData.name || fbUser.displayName || "Usuário",
              isAdmin: firestoreData.isAdmin || false,
            };
            setAuthUser(currentAuthUser);
            console.log("useAuth: Firestore data found & AuthUser set. UID:", fbUser.uid, "isAdmin:", currentAuthUser.isAdmin, "Name:", currentAuthUser.name);
          } else {
            console.warn(`useAuth: User ${fbUser.uid} authenticated but NO Firestore document found. Logging out.`);
            await signOut(auth); // Isso acionará onAuthStateChanged novamente com fbUser = null
            setAuthUser(null); // Limpa explicitamente
            setFirebaseUser(null); // Limpa explicitamente
          }
        } catch (error) {
          console.error("useAuth: Error fetching user document from Firestore:", error);
          await signOut(auth);
          setAuthUser(null);
          setFirebaseUser(null);
        }
      } else {
        console.log("useAuth: No Firebase user. Clearing auth state.");
        setFirebaseUser(null);
        setAuthUser(null);
      }
      // Esta é a mudança crucial: setIsLoading(false) deve ser chamado DEPOIS que authUser/firebaseUser são atualizados.
      setIsLoading(false);
      if (typeof window !== 'undefined') {
        console.log("useAuth: onAuthStateChanged finished. isLoading:", false, "isAuthenticated:", !!(fbUser && authUser), "authUser:", authUser, "fbUser:", fbUser);
      }
    });

    return () => {
      console.log("useAuth: Cleaning up onAuthStateChanged listener.");
      unsubscribe();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const logout = useCallback(async () => {
    console.log("useAuth: logout called.");
    setIsLoading(true);
    try {
      await signOut(auth);
      console.log("useAuth: signOut successful. onAuthStateChanged will clear user state and set isLoading=false.");
      // onAuthStateChanged cuidará de definir user como null e isLoading como false
    } catch (error) {
      console.error("useAuth: Error signing out: ", error);
      setIsLoading(false); // Garante que o estado de carregamento seja resetado em caso de erro no signOut
    }
  }, []);

  const isAuthenticated = !isLoading && !!authUser && !!firebaseUser;
  const isAdmin = authUser?.isAdmin ?? false;

  if (typeof window !== 'undefined') {
     console.log("useAuth: AuthProvider rendering/re-rendering. isLoading:", isLoading, "isAuthenticated:", isAuthenticated, "isAdmin:", isAdmin, "authUser ID:", authUser ? authUser.id : "null", "fbUser UID:", firebaseUser ? firebaseUser.uid : "null");
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
    