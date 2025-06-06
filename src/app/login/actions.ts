
'use server';

import type { LoginFormState } from '@/components/auth/LoginForm';
import { z } from 'zod';

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
        password: '',
      }
    };
  }

  const { email, password } = validatedFields.data;

  // --- Mock Authentication Logic ---
  console.log("Attempting User Login:", { email });
  if (email === "user@example.com" && password === "password123") {
    console.log("User login successful (mocked)");
    // In a real app: create session, set cookie, redirect
    // redirect('/dashboard'); 
    return { message: `Login bem-sucedido para ${email}! (Simulado)`, success: true };
  } else {
    console.log("User login failed (mocked)");
    return { 
        message: "Credenciais inválidas.", 
        success: false,
        fields: { email, password: '' }
    };
  }
  // --- End Mock Authentication Logic ---
}
