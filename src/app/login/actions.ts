
'use server';

import type { LoginFormState } from '@/components/auth/LoginForm';
import { z } from 'zod';
import { auth, db } from '@/lib/firebase'; // Firebase Auth
import { signInWithEmailAndPassword } from 'firebase/auth';
// Não é mais necessário buscar dados do Firestore aqui, useAuth cuidará disso.

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
    console.log("loginUserAction: Validation failed.");
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

  console.log("loginUserAction: Attempting Firebase Auth Login for:", { email: lowercasedEmail });

  if (!auth || !db) {
    console.error("loginUserAction: CRITICAL - Firebase 'auth' or 'db' instance is not available.");
    return {
      message: "Erro crítico na configuração de autenticação. Contate o suporte.",
      success: false,
      fields: { email: lowercasedEmail },
    };
  }

  try {
    // Apenas faz o login com o Firebase Auth.
    // onAuthStateChanged em useAuth.ts irá então pegar este usuário,
    // buscar seus detalhes do Firestore e atualizar o estado global de autenticação.
    await signInWithEmailAndPassword(auth, lowercasedEmail, password);

    console.log(`loginUserAction: Firebase Auth signInWithEmailAndPassword successful for ${lowercasedEmail}.`);
    // A mensagem aqui é mais para feedback imediato, se necessário, mas o redirecionamento
    // e as atualizações da UI devem depender das mudanças de estado do useAuth.
    return {
      message: `Login bem-sucedido! Redirecionando...`, // Mensagem simplificada
      success: true,
    };
  } catch (error: any) {
    console.error("loginUserAction: Firebase Auth Login Error:", error);
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
    