
'use server';

import type { RegisterFormState } from '@/components/auth/RegisterForm';
import { z } from 'zod';
import { auth, db } from '@/lib/firebase'; // Firebase Auth and Firestore
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
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
  console.log("--- registerUserAction Server Action START (Firebase Auth) ---");

  const validatedFields = RegisterSchema.safeParse(
    Object.fromEntries(formData.entries())
  );

  if (!validatedFields.success) {
    console.log("Validation failed in registerUserAction.");
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

  console.log("Attempting User Registration with Firebase Auth:", { name, email: lowercasedEmail });
  
  if (!auth || !db) {
    console.error("!!! CRITICAL: Firebase 'auth' or 'db' instance is not available in registerUserAction. Registration aborted. !!!");
    return {
      message: "Erro crítico na configuração. Contate o suporte.",
      success: false,
      fields: { name, email: lowercasedEmail },
      user: null,
    };
  }

  try {
    // Step 1: Create user in Firebase Authentication
    const userCredential = await createUserWithEmailAndPassword(auth, lowercasedEmail, password);
    const firebaseAuthUser = userCredential.user;
    console.log("Firebase Auth user created successfully:", firebaseAuthUser.uid);

    // Step 2: Create user document in Firestore
    const newUserFirestoreData: UserFirestoreData = { 
      id: firebaseAuthUser.uid, // Use Firebase Auth UID as Firestore doc ID
      name,
      email: lowercasedEmail,
      isAdmin: false,
      followers: [],
      following: [],
      badges: [],
      createdAt: serverTimestamp(),
      // Password is NOT stored in Firestore
    };

    await setDoc(doc(db, "usuarios", firebaseAuthUser.uid), newUserFirestoreData);
    console.log("Firestore document created for user:", firebaseAuthUser.uid);
    
    // The AuthUser type for the frontend (simplified)
    const authUserForState: AuthUser = {
      id: firebaseAuthUser.uid,
      name,
      email: lowercasedEmail,
      isAdmin: false,
    };

    // The useAuth hook will pick up the auth state change via onAuthStateChanged
    // This return is primarily for UI feedback (e.g., success message)
    return { 
      message: `Cadastro de ${name} realizado com sucesso! Você já pode fazer login.`, 
      success: true,
      user: authUserForState, 
    };

  } catch (error: any) {
    console.error("--- Firebase Registration Error in registerUserAction CATCH BLOCK ---");
    console.error("Timestamp:", new Date().toISOString());
    console.error("Input Data:", { name, email: lowercasedEmail }); 
    
    let errorMessage = "Não foi possível registrar o usuário. Tente novamente.";
    if (error.code === 'auth/email-already-in-use') {
      errorMessage = "Este e-mail já está cadastrado. Tente fazer login ou use outro e-mail.";
      return {
        message: errorMessage,
        success: false,
        issues: { email: [errorMessage] },
        fields: { name, email: lowercasedEmail },
        user: null,
      };
    } else if (error.code === 'auth/weak-password') {
      errorMessage = "A senha é muito fraca. Use pelo menos 6 caracteres.";
       return {
        message: errorMessage,
        success: false,
        issues: { password: [errorMessage] },
        fields: { name, email: lowercasedEmail },
        user: null,
      };
    } else {
      console.error("Firebase Error Code:", error.code);
      console.error("Firebase Error Message:", error.message);
      console.error("Full Firebase Error Object:", error);
      errorMessage = `Erro no servidor ao registrar: ${error.message || 'Erro desconhecido.'} (Código: ${error.code || 'N/A'})`;
    }
    console.error("--- End Firebase Registration Error ---");
    
    return {
      message: errorMessage,
      success: false,
      fields: { name, email: lowercasedEmail },
      user: null,
    };
  }
}
