
'use server';

import type { LoginFormState } from '@/components/auth/LoginForm';
import { z } from 'zod';
import { auth, db } from '@/lib/firebase'; // Firebase Auth
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import type { UserFirestoreData } from '@/lib/types';

const LoginSchema = z.object({
  email: z.string().email({ message: "E-mail inválido." }),
  password: z.string().min(1, { message: "Senha é obrigatória." }),
});

export async function loginUserAction(
  prevState: LoginFormState,
  formData: FormData
): Promise<LoginFormState> {
  const validatedFields = LoginSchema.safeParse(
    Object.fromEntries(formData.entries())
  );

  if (!validatedFields.success) {
    return {
      message: "Dados de login inválidos. Verifique os campos.",
      success: false,
      issues: validatedFields.error.flatten().fieldErrors,
      fields: {
        email: formData.get('email')?.toString() || '',
      },
    };
  }

  const { email, password } = validatedFields.data;
  const lowercasedEmail = email.toLowerCase();

  console.log("Attempting Firebase Auth Login:", { email: lowercasedEmail });

  if (!auth || !db) {
    console.error("!!! CRITICAL: Firebase 'auth' or 'db' instance is not available in loginUserAction. Login aborted. !!!");
    return {
      message: "Erro crítico na configuração de autenticação. Contate o suporte.",
      success: false,
      fields: { email: lowercasedEmail },
    };
  }

  try {
    const userCredential = await signInWithEmailAndPassword(auth, lowercasedEmail, password);
    const firebaseUser = userCredential.user;
    
    // After successful Firebase Auth, fetch isAdmin status from Firestore
    // This is to provide immediate feedback if an admin logs in, though useAuth will also fetch this.
    const userDocRef = doc(db, "usuarios", firebaseUser.uid);
    const userDocSnap = await getDoc(userDocRef);
    let isAdmin = false;
    if (userDocSnap.exists()) {
      const firestoreData = userDocSnap.data() as UserFirestoreData;
      isAdmin = firestoreData.isAdmin || false;
    }

    console.log(`Firebase Auth Login successful for ${lowercasedEmail}. Is Admin: ${isAdmin}`);
    
    return { 
      message: `Login bem-sucedido! Redirecionando... ${isAdmin ? '(Admin)' : ''}`, 
      success: true,
    };
  } catch (error: any) {
    console.error("Firebase Auth Login Error:", error);
    let errorMessage = "Credenciais inválidas ou erro ao fazer login.";
    if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
      errorMessage = "E-mail ou senha incorretos.";
    } else if (error.code === 'auth/too-many-requests') {
        errorMessage = "Muitas tentativas de login falhadas. Tente novamente mais tarde."
    } else if (error.code === 'auth/user-disabled') {
        errorMessage = "Esta conta de usuário foi desabilitada.";
    }
    return { 
        message: errorMessage, 
        success: false,
        fields: { email: lowercasedEmail, password: '' },
    };
  }
}

