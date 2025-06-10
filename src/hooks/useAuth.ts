
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
import { useRouter } from 'next/navigation'; // Importar useRouter

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
  const router = useRouter(); // Obter a instância do router

  const processAuthStateChange = useCallback(async (fbUser: FirebaseUser | null) => {
    console.log("useAuth: processAuthStateChange TRIGGERED. fbUser UID:", fbUser ? fbUser.uid : "null");
    setIsLoading(true); // Definir loading no início

    try {
      if (fbUser) {
        console.log("useAuth: fbUser detected. Setting firebaseUser state for UID:", fbUser.uid);
        setFirebaseUser(fbUser); // Definir firebaseUser primeiro

        console.log("useAuth: Fetching Firestore data for UID:", fbUser.uid);
        const userDocRef = doc(db, "usuarios", fbUser.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          const firestoreData = userDocSnap.data() as UserFirestoreData;
          const currentAuthUser: AuthUser = {
            id: fbUser.uid,
            email: fbUser.email, // Usar e-mail do Firebase Auth
            name: firestoreData.name || fbUser.displayName || "Usuário",
            isAdmin: firestoreData.isAdmin || false,
          };
          console.log(`useAuth: Firestore data found & AuthUser set for UID: ${fbUser.uid}, Name: ${currentAuthUser.name}, Admin: ${currentAuthUser.isAdmin}`);
          setAuthUser(currentAuthUser);
        } else {
          console.warn(`useAuth: User ${fbUser.uid} authenticated (Firebase Auth) but NO Firestore document. Forcing logout.`);
          // Se o documento do Firestore não existe, consideramos um estado inconsistente e deslogamos.
          await signOut(auth); // Isso irá disparar onAuthStateChanged novamente com fbUser = null
          // Não definir authUser/firebaseUser como null aqui, signOut irá cuidar disso.
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
      // Tentar deslogar se houver um erro crítico durante o processamento do estado de autenticação
      if (auth.currentUser) {
        console.log("useAuth: Attempting to sign out Firebase user due to error in processAuthStateChange.");
        try {
          await signOut(auth);
        } catch (signOutError) {
          console.error("useAuth: Error attempting to sign out Firebase user after error in processAuthStateChange:", signOutError);
        }
      }
    } finally {
      console.log("useAuth: processAuthStateChange - finally block. Setting isLoading to FALSE.");
      setIsLoading(false); // Definir isLoading para false no final, independentemente do resultado
    }
  }, []); // useCallback para estabilizar a função

  useEffect(() => {
    console.log("useAuth: Setting up onAuthStateChanged listener.");
    const unsubscribe = onAuthStateChanged(auth, (fbUser) => {
      // A lógica de processamento agora está em processAuthStateChange
      processAuthStateChange(fbUser);
    });

    return () => {
      console.log("useAuth: Cleaning up onAuthStateChanged listener (AuthProvider unmounted).");
      unsubscribe();
    };
  }, [processAuthStateChange]); // processAuthStateChange é a dependência

  const logout = useCallback(async () => {
    console.log("useAuth: logout function called.");
    setIsLoading(true); // Opcional: pode definir loading durante o logout
    try {
      await signOut(auth);
      console.log("useAuth: signOut successful. Navigating to homepage. onAuthStateChanged will handle state cleanup.");
      router.push('/'); // Redirecionar para a página inicial após o logout
      // onAuthStateChanged será acionado, chamando processAuthStateChange com fbUser = null
      // que limpará authUser, firebaseUser e definirá isLoading = false.
    } catch (error) {
      console.error("useAuth: Error during signOut: ", error);
      // Se o signOut em si falhar, ainda definimos isLoading como false para evitar travamentos.
      // authUser e firebaseUser podem não ser limpos se onAuthStateChanged não for acionado
      setIsLoading(false);
    }
  }, [router]); // router é uma dependência do useCallback

  // Função para explicitamente tentar re-sincronizar o estado do usuário
  const refreshAuthUser = useCallback(async () => {
    console.log("useAuth: refreshAuthUser called.");
    const currentUser = auth.currentUser;
    console.log("useAuth: refreshAuthUser - current Firebase user from auth.currentUser:", currentUser ? currentUser.uid : "null");
    await processAuthStateChange(currentUser); // Reutilizar a lógica principal
  }, [processAuthStateChange]);


  // Um usuário está autenticado se o carregamento estiver completo, E
  // authUser (com dados do Firestore) E firebaseUser (do Firebase Auth) existirem.
  const isAuthenticated = !isLoading && !!authUser && !!firebaseUser;
  const isAdmin = !isLoading && (authUser?.isAdmin ?? false);

  if (typeof window !== 'undefined') {
    // Este log pode ser muito verboso para produção, mas útil para depuração
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
