
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

export interface AuthContextType { // Exportando para uso em LoginForm
  user: AuthUser | null;
  firebaseUser: FirebaseUser | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  logout: () => Promise<void>;
  refreshAuthUser: () => Promise<void>; // Mantido caso seja útil, mas não é o foco da correção atual
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const processAuthStateChange = useCallback(async (fbUser: FirebaseUser | null) => {
    console.log("useAuth: processAuthStateChange INICIADO. fbUser UID:", fbUser ? fbUser.uid : "null");
    setIsLoading(true); // Sempre define loading no início do processamento

    try {
      if (fbUser) {
        console.log("useAuth: fbUser detectado em processAuthStateChange. UID:", fbUser.uid);
        setFirebaseUser(fbUser);

        console.log("useAuth: Buscando dados do Firestore para UID:", fbUser.uid);
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
          console.log(`useAuth: Dados do Firestore encontrados. Definindo authUser para UID: ${fbUser.uid}, Nome: ${currentAuthUser.name}, Admin: ${currentAuthUser.isAdmin}`);
          setAuthUser(currentAuthUser);
        } else {
          console.warn(`useAuth: Usuário ${fbUser.uid} autenticado (Firebase Auth) mas SEM documento no Firestore. Estado inconsistente. Forçando logout.`);
          await signOut(auth); // Isso irá disparar onAuthStateChanged novamente com fbUser = null
          // Não definir authUser/firebaseUser como null aqui, signOut irá cuidar disso.
        }
      } else {
        console.log("useAuth: Sem fbUser em processAuthStateChange (usuário deslogado ou estado inicial). Limpando estados authUser e firebaseUser.");
        setAuthUser(null);
        setFirebaseUser(null);
      }
    } catch (error) {
      console.error("useAuth: ERRO CRÍTICO dentro de processAuthStateChange:", error);
      setAuthUser(null);
      setFirebaseUser(null);
      if (auth.currentUser) {
        console.log("useAuth: Tentando deslogar usuário Firebase devido a erro em processAuthStateChange.");
        try {
          await signOut(auth);
        } catch (signOutError) {
          console.error("useAuth: Erro ao tentar deslogar usuário Firebase após erro em processAuthStateChange:", signOutError);
        }
      }
    } finally {
      console.log("useAuth: processAuthStateChange - Bloco FINALLY. Definindo isLoading para FALSE.");
      setIsLoading(false);
    }
  }, []); // useCallback para estabilizar a função

  useEffect(() => {
    console.log("useAuth: Configurando listener onAuthStateChanged.");
    const unsubscribe = onAuthStateChanged(auth, (fbUser) => {
      console.log("useAuth: onAuthStateChanged DISPARADO. fbUser UID:", fbUser ? fbUser.uid : "null");
      processAuthStateChange(fbUser);
    });

    return () => {
      console.log("useAuth: Limpando listener onAuthStateChanged (AuthProvider desmontado).");
      unsubscribe();
    };
  }, [processAuthStateChange]); // processAuthStateChange agora é uma dependência estável

  const logout = useCallback(async () => {
    console.log("useAuth: Função logout chamada.");
    try {
      await signOut(auth);
      console.log("useAuth: signOut bem-sucedido. onAuthStateChanged irá lidar com a limpeza do estado e isLoading.");
      // onAuthStateChanged será acionado, chamando processAuthStateChange com fbUser = null
    } catch (error) {
      console.error("useAuth: Erro durante signOut: ", error);
      // Se o signOut em si falhar, ainda definimos isLoading como false para evitar travamentos.
      setIsLoading(false);
    }
  }, []);

  // refreshAuthUser agora é mais uma forma de acionar a lógica de processAuthStateChange
  const refreshAuthUser = useCallback(async () => {
    console.log("useAuth: refreshAuthUser chamado.");
    await processAuthStateChange(auth.currentUser);
  }, [processAuthStateChange]);


  const isAuthenticated = !isLoading && !!authUser && !!firebaseUser;
  const isAdmin = !isLoading && (authUser?.isAdmin ?? false);

  if (typeof window !== 'undefined') {
    console.log(`useAuth: AuthProvider renderizando/re-renderizando. isLoading: ${isLoading}, isAuthenticated: ${isAuthenticated}, isAdmin: ${isAdmin}, authUser ID: ${authUser ? authUser.id : "null"}, fbUser UID: ${firebaseUser ? firebaseUser.uid : "null"}`);
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

