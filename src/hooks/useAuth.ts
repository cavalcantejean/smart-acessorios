
"use client";
import React, { useState, useEffect, useCallback, createContext, useContext, type ReactNode } from 'react';
import { auth, db } from '@/lib/firebase';
import {
  onAuthStateChanged,
  signOut,
  type User as FirebaseUser,
  GoogleAuthProvider, // Importar GoogleAuthProvider
  signInWithPopup,    // Importar signInWithPopup
  type UserCredential // Importar UserCredential
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'; // Importar setDoc e serverTimestamp
import type { AuthUser, UserFirestoreData } from '@/lib/types';
import { useRouter } from 'next/navigation';

export interface AuthContextType {
  user: AuthUser | null;
  firebaseUser: FirebaseUser | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  logout: () => Promise<void>;
  signInWithGoogle: () => Promise<UserCredential | null>; // Adicionar nova função
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
          // Usuário autenticado no Firebase Auth mas NÃO existe no Firestore
          console.warn(`useAuth: User ${fbUser.uid} authenticated (Firebase Auth) but NO Firestore document.`);
          
          // Verificar se o login foi por um provedor (ex: Google)
          // FirebaseUser.providerData contém informações sobre os provedores vinculados
          const isSocialLogin = fbUser.providerData.some(
            (provider) => provider.providerId === GoogleAuthProvider.PROVIDER_ID // Ou outros provedores
          );

          if (isSocialLogin) {
            console.log(`useAuth: User ${fbUser.uid} is a new social login. Creating Firestore document.`);
            const newUserFirestoreData: UserFirestoreData = {
              id: fbUser.uid,
              name: fbUser.displayName || "Usuário Google",
              email: fbUser.email || "email.google@desconhecido.com", // Email é geralmente fornecido pelo Google
              isAdmin: false,
              followers: [],
              following: [],
              badges: [],
              createdAt: serverTimestamp(),
              avatarUrl: fbUser.photoURL || `https://placehold.co/150x150.png?text=${(fbUser.displayName || 'G').charAt(0).toUpperCase()}`,
              avatarHint: "user avatar google",
              bio: `Novo membro via Google!`,
            };
            await setDoc(userDocRef, newUserFirestoreData);
            console.log(`useAuth: Firestore document CREATED for new social user: ${fbUser.uid}`);
            const currentAuthUser: AuthUser = {
              id: newUserFirestoreData.id,
              email: newUserFirestoreData.email,
              name: newUserFirestoreData.name,
              isAdmin: newUserFirestoreData.isAdmin,
            };
            setAuthUser(currentAuthUser);
          } else {
            // Se não for login social E não existe no Firestore, pode ser um problema (ex: registro por email/senha falhou ao criar doc)
            console.warn(`useAuth: User ${fbUser.uid} authenticated via non-social method but NO Firestore document. Forcing logout.`);
            await signOut(auth); // Isso irá disparar onAuthStateChanged novamente com fbUser = null
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

  const signInWithGoogle = useCallback(async (): Promise<UserCredential | null> => {
    console.log("useAuth: signInWithGoogle called.");
    setIsLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      console.log("useAuth: signInWithPopup successful. User:", result.user.uid);
      // onAuthStateChanged será acionado e chamará processAuthStateChange,
      // que agora lida com a criação do documento no Firestore se for um novo usuário do Google.
      // Não precisamos definir isLoading(false) aqui, processAuthStateChange cuidará disso.
      return result;
    } catch (error: any) {
      console.error("useAuth: Error during signInWithGoogle:", error);
      // Tratar erros específicos do Google Sign-In
      if (error.code === 'auth/popup-closed-by-user') {
        console.warn('useAuth: Google Sign-In popup closed by user.');
      } else if (error.code === 'auth/cancelled-popup-request') {
        console.warn('useAuth: Google Sign-In popup request cancelled (multiple popups).');
      } else if (error.code === 'auth/popup-blocked') {
        console.error('useAuth: Google Sign-In popup blocked by browser. Advise user to allow popups.');
        // Você pode querer mostrar uma mensagem para o usuário aqui
      }
      // Se houver erro, onAuthStateChanged não deve ser acionado com um novo usuário.
      // Se já havia um usuário logado, onAuthStateChanged o manterá.
      // Definir isLoading como false se o estado do usuário não mudou.
      if(auth.currentUser === firebaseUser) { // Checa se o usuário atual não mudou
          setIsLoading(false);
      }
      return null;
    }
  }, []);


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
    { value: { user: authUser, firebaseUser, isAuthenticated, isAdmin, isLoading, logout, signInWithGoogle, refreshAuthUser } },
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
