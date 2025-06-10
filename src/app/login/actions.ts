
'use server';

// Esta Server Action não é mais usada para o login principal do Firebase.
// A lógica de signInWithEmailAndPassword foi movida para LoginForm.tsx (cliente).
// Mantida aqui para referência ou se for usada para outras tarefas no futuro.

import type { LoginFormState } from '@/components/auth/LoginForm';
// import { z } from 'zod';
// import { auth, db } from '@/lib/firebase'; 
// import { signInWithEmailAndPassword } from 'firebase/auth';

// const LoginSchema = z.object({
//   email: z.string().email({ message: "E-mail inválido." }),
//   password: z.string().min(1, { message: "Senha é obrigatória." }),
// });

export async function loginUserAction(
  prevState: LoginFormState,
  formData: FormData // formData não é mais usado ativamente aqui para o login Firebase
): Promise<LoginFormState> {
  console.warn("loginUserAction (Server Action) FOI CHAMADA, mas o login principal do Firebase agora é feito no cliente (LoginForm.tsx). Esta action não deve mais ser o mecanismo primário de login.");
  
  // Retorna um erro genérico para indicar que esta action não deve ser o ponto de entrada
  // para o login Firebase a partir do formulário.
  return {
    message: "Erro interno: Ação de login no servidor não configurada para login principal. O login Firebase é feito no cliente.",
    success: false,
    fields: {
      email: formData.get('email')?.toString() || '',
    },
  };

  // O código abaixo é o antigo, agora movido/adaptado para o cliente em LoginForm.tsx
  /*
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

  console.log("loginUserAction (Server Action): Tentando login Firebase para:", { email: lowercasedEmail });

  if (!auth || !db) {
    console.error("loginUserAction (Server Action): CRITICAL - Firebase 'auth' or 'db' instance is not available.");
    return {
      message: "Erro crítico na configuração de autenticação. Contate o suporte.",
      success: false,
      fields: { email: lowercasedEmail },
    };
  }

  try {
    await signInWithEmailAndPassword(auth, lowercasedEmail, password);
    console.log(`loginUserAction (Server Action): Firebase Auth signInWithEmailAndPassword successful for ${lowercasedEmail}.`);
    
    return {
      message: `Login bem-sucedido! Redirecionando...`,
      success: true,
    };
  } catch (error: any) {
    console.error("loginUserAction (Server Action): Firebase Auth Login Error:", error);
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
  */
}
    
