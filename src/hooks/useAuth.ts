
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
    console.log("useAuth: useEffect for onAuthStateChanged setup running.");
    const unsubscribe = onAuthStateChanged(auth, (fbUser) => {
      // Usar uma função assíncrona auto-invocável para lidar com operações assíncronas
      // e garantir que o bloco finally para setIsLoading seja sempre chamado.
      (async () => {
        console.log("useAuth: onAuthStateChanged TRIGGERED. fbUser UID:", fbUser ? fbUser.uid : "null");
        setIsLoading(true); // Define loading como true no início do processamento desta mudança de auth

        try {
          if (fbUser) {
            console.log("useAuth: fbUser detected. Setting firebaseUser state for UID:", fbUser.uid);
            setFirebaseUser(fbUser); // Define o estado do Firebase user

            console.log("useAuth: Fetching Firestore data for UID:", fbUser.uid);
            const userDocRef = doc(db, "usuarios", fbUser.uid);
            const userDocSnap = await getDoc(userDocRef);

            if (userDocSnap.exists()) {
              const firestoreData = userDocSnap.data() as UserFirestoreData;
              const currentAuthUser: AuthUser = {
                id: fbUser.uid,
                email: fbUser.email, // E-mail do Firebase Auth
                name: firestoreData.name || fbUser.displayName || "Usuário",
                isAdmin: firestoreData.isAdmin || false,
              };
              console.log("useAuth: Firestore data found. Setting authUser state for UID:", fbUser.uid, "Name:", currentAuthUser.name, "IsAdmin:", currentAuthUser.isAdmin);
              setAuthUser(currentAuthUser); // Define o estado do usuário específico da aplicação
            } else {
              console.warn(`useAuth: User ${fbUser.uid} authenticated (Firebase Auth) but NO Firestore document found. This is an inconsistent state. Forcing logout.`);
              // Tenta deslogar para evitar estado inconsistente. Isso irá disparar onAuthStateChanged novamente.
              await signOut(auth);
              // Não é necessário definir authUser/firebaseUser como null aqui, pois o signOut irá re-disparar este callback
              // e o próximo if (fbUser) será falso.
            }
          } else {
            console.log("useAuth: No fbUser (user logged out or initial state without user). Clearing authUser and firebaseUser states.");
            setAuthUser(null);
            setFirebaseUser(null);
          }
        } catch (error) {
          console.error("useAuth: CRITICAL ERROR within onAuthStateChanged async processing:", error);
          // Tenta limpar o estado de autenticação em caso de erro para evitar estados inconsistentes
          setAuthUser(null);
          setFirebaseUser(null);
          // Se ainda houver um usuário no Firebase Auth, tenta deslogá-lo
          if (auth.currentUser) {
            console.log("useAuth: Attempting to signOut Firebase user due to error in onAuthStateChanged.");
            try {
              await signOut(auth);
            } catch (signOutError) {
              console.error("useAuth: Error trying to signOut Firebase user after onAuthStateChanged error:", signOutError);
            }
          }
        } finally {
          // Este bloco é crucial e DEVE ser alcançado.
          console.log("useAuth: onAuthStateChanged - finally block. Setting isLoading to FALSE.");
          setIsLoading(false); // Garante que isLoading seja definido como false independentemente do caminho
        }
      })(); // Invoca imediatamente a função assíncrona
    });

    // Cleanup
    return () => {
      console.log("useAuth: Cleaning up onAuthStateChanged listener (AuthProvider unmounted).");
      unsubscribe();
    };
  }, []); // O array de dependências vazio significa que este efeito executa uma vez na montagem e limpa na desmontagem

  const logout = useCallback(async () => {
    console.log("useAuth: logout function called.");
    // Não definimos isLoading aqui, pois onAuthStateChanged irá lidar com isso quando o estado do usuário mudar para null.
    // Definir isLoading aqui pode causar um flash de estado de carregamento desnecessário se onAuthStateChanged for rápido.
    try {
      await signOut(auth);
      console.log("useAuth: signOut successful. onAuthStateChanged will handle clearing user state and managing isLoading.");
      // onAuthStateChanged será disparado por signOut, que então definirá authUser/firebaseUser para null
      // e, eventualmente, setIsLoading(false) através de seu próprio bloco finally.
    } catch (error) {
      console.error("useAuth: Error during signOut: ", error);
      // Se o signOut em si falhar, definimos isLoading como false para não ficar preso no estado de carregamento.
      // Isso é uma recuperação, pois o estado de autenticação pode não ter mudado.
      setIsLoading(false);
    }
  }, []);

  // Calcula isAuthenticated e isAdmin com base nos estados atuais, incluindo isLoading.
  // Um usuário só está autenticado e seu status de admin é conhecido se o carregamento terminou.
  const isAuthenticated = !isLoading && !!authUser && !!firebaseUser;
  const isAdmin = !isLoading && (authUser?.isAdmin ?? false);

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
