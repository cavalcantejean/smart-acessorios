
'use server';

import type { LoginFormState } from '@/components/auth/LoginForm';
import { z } from 'zod';
import { auth } from '@/lib/firebase'; // Firebase Auth
import { signInWithEmailAndPassword } from 'firebase/auth';
// No need for AuthUser type here, as onAuthStateChanged will handle user state update.

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
      // user: null, // Not needed as onAuthStateChanged handles user state
    };
  }

  const { email, password } = validatedFields.data;
  const lowercasedEmail = email.toLowerCase();

  console.log("Attempting Firebase Auth Login:", { email: lowercasedEmail });

  if (!auth) {
    console.error("!!! CRITICAL: Firebase 'auth' instance is not available in loginUserAction. Login aborted. !!!");
    return {
      message: "Erro crítico na configuração de autenticação. Contate o suporte.",
      success: false,
      fields: { email: lowercasedEmail },
    };
  }

  try {
    await signInWithEmailAndPassword(auth, lowercasedEmail, password);
    // If signInWithEmailAndPassword succeeds, onAuthStateChanged in useAuth hook
    // will detect the new user and update the global auth state.
    // The user's name and isAdmin status will be fetched by useAuth from Firestore.
    
    console.log(`Firebase Auth Login successful for ${lowercasedEmail}.`);
    return { 
      message: `Login bem-sucedido! Redirecionando...`, 
      success: true,
      // No need to return user object here.
    };
  } catch (error: any) {
    console.error("Firebase Auth Login Error:", error);
    let errorMessage = "Credenciais inválidas ou erro ao fazer login.";
    if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
      errorMessage = "E-mail ou senha incorretos.";
    } else if (error.code === 'auth/too-many-requests') {
        errorMessage = "Muitas tentativas de login falhadas. Tente novamente mais tarde."
    }
    // Handle other specific Firebase Auth errors as needed
    return { 
        message: errorMessage, 
        success: false,
        fields: { email: lowercasedEmail, password: '' },
    };
  }
}
