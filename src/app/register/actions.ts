
'use server';

import type { RegisterFormState } from '@/components/auth/RegisterForm';
import { z } from 'zod';
import { auth, db } from '@/lib/firebase'; // Firebase Auth and Firestore
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { doc, setDoc, serverTimestamp, collection, query, where, getDocs } from 'firebase/firestore';
import type { AuthUser, UserFirestoreData } from '@/lib/types';

const RegisterSchema = z.object({
  name: z.string().min(2, { message: "O nome deve ter pelo menos 2 caracteres." }),
  email: z.string().email({ message: "Por favor, insira um e-mail válido." }),
  password: z.string().min(6, { message: "A senha deve ter pelo menos 6 caracteres." }),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas não coincidem.",
  path: ["confirmPassword"],
});

export async function registerUserAction(
  prevState: RegisterFormState,
  formData: FormData
): Promise<RegisterFormState> {
  console.log("--- registerUserAction: START ---");

  const validatedFields = RegisterSchema.safeParse(
    Object.fromEntries(formData.entries())
  );

  if (!validatedFields.success) {
    console.log("registerUserAction: Validation failed.");
    return {
      message: "Dados de cadastro inválidos. Verifique os campos.",
      success: false,
      issues: validatedFields.error.flatten().fieldErrors,
      fields: {
        name: formData.get('name')?.toString() || '',
        email: formData.get('email')?.toString() || '',
      },
      user: null,
    };
  }

  const { name, email, password } = validatedFields.data;
  const lowercasedEmail = email.toLowerCase();

  console.log("registerUserAction: Attempting registration for:", { name, email: lowercasedEmail });

  if (!auth || !db) {
    console.error("registerUserAction: CRITICAL - Firebase 'auth' or 'db' instance is not available.");
    return {
      message: "Erro crítico na configuração. Contate o suporte.",
      success: false,
      fields: { name, email: lowercasedEmail },
      user: null,
    };
  }

  try {
    // REMOVIDA: Verificação de e-mail duplicado no Firestore.
    // Firebase Auth cuidará disso com 'auth/email-already-in-use'.

    console.log("registerUserAction: Calling createUserWithEmailAndPassword...");
    const userCredential = await createUserWithEmailAndPassword(auth, lowercasedEmail, password);
    const firebaseAuthUser = userCredential.user;
    console.log("registerUserAction: Firebase Auth user CREATED successfully. UID:", firebaseAuthUser.uid);
    console.log("registerUserAction: auth.currentUser immediately after createUserWithEmailAndPassword:", auth.currentUser ? auth.currentUser.uid : "null");


    const newUserFirestoreData: Omit<UserFirestoreData, 'followers' | 'following'> = { // Omit removed fields
      id: firebaseAuthUser.uid,
      name,
      email: lowercasedEmail,
      isAdmin: false,
      // followers: [], // REMOVED
      // following: [], // REMOVED
      badges: [],
      createdAt: serverTimestamp(),
      avatarUrl: `https://placehold.co/150x150.png?text=${name.charAt(0).toUpperCase()}`,
      avatarHint: "user avatar placeholder",
      bio: `Novo membro da comunidade SmartAcessorios!`,
    };

    console.log("registerUserAction: Firestore User Details for write - UID:", firebaseAuthUser.uid, "Email:", firebaseAuthUser.email);
    console.log("registerUserAction: Data to be sent to Firestore (newUserFirestoreData):", JSON.stringify(newUserFirestoreData, null, 2));

    console.log("registerUserAction: Calling setDoc to Firestore for UID:", firebaseAuthUser.uid);
    await setDoc(doc(db, "usuarios", firebaseAuthUser.uid), newUserFirestoreData);
    console.log("registerUserAction: Firestore document CREATED for user:", firebaseAuthUser.uid);

    try {
      console.log("registerUserAction: Calling sendEmailVerification...");
      await sendEmailVerification(firebaseAuthUser);
      console.log("registerUserAction: Verification email sent to:", firebaseAuthUser.email);
    } catch (emailError) {
      console.error("registerUserAction: Error sending verification email:", emailError);
    }

    const authUserForState: AuthUser = {
      id: firebaseAuthUser.uid,
      name,
      email: lowercasedEmail,
      isAdmin: false,
    };

    console.log("registerUserAction: SUCCESS");
    return {
      message: `Cadastro de ${name} realizado com sucesso! Um e-mail de verificação foi enviado para ${lowercasedEmail}. Por favor, verifique sua caixa de entrada (e spam).`,
      success: true,
      user: authUserForState,
    };

  } catch (error: any) {
    console.error("--- registerUserAction: ERROR CATCH BLOCK ---");
    console.error("Timestamp:", new Date().toISOString());
    console.error("Input Data:", { name, email: lowercasedEmail });
    let errorMessage = "Não foi possível registrar o usuário. Tente novamente.";

    if (error.code) {
      console.error("Firebase Error Code:", error.code);
      console.error("Firebase Error Message:", error.message);
    } else {
      console.error("Full Error Object:", error);
    }

    if (error.code === 'auth/email-already-in-use') {
      errorMessage = "Este e-mail já está cadastrado. Tente fazer login ou use outro e-mail.";
      return { message: errorMessage, success: false, issues: { email: [errorMessage] }, fields: { name, email: lowercasedEmail }, user: null };
    } else if (error.code === 'auth/weak-password') {
      errorMessage = "A senha é muito fraca. Use pelo menos 6 caracteres.";
      return { message: errorMessage, success: false, issues: { password: [errorMessage] }, fields: { name, email: lowercasedEmail }, user: null };
    } else if (error.code === 'permission-denied') {
      errorMessage = `Erro de permissão ao interagir com o Firestore. Verifique as regras de segurança e os logs do servidor. (Código: ${error.code})`;
      console.error("registerUserAction: PERMISSION DENIED on Firestore operation.");
    } else {
      errorMessage = `Erro no servidor ao registrar: ${error.message || 'Erro desconhecido.'} (Código: ${error.code || 'N/A'})`;
    }
    
    console.error("--- registerUserAction: END ERROR CATCH BLOCK ---");
    return { message: errorMessage, success: false, fields: { name, email: lowercasedEmail }, user: null };
  }
}
    
