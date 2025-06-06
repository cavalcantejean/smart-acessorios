
'use server';

import type { RegisterFormState } from '@/components/auth/RegisterForm';
import { z } from 'zod';

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
  const validatedFields = RegisterSchema.safeParse(
    Object.fromEntries(formData.entries())
  );

  if (!validatedFields.success) {
    return {
      message: "Dados de cadastro inválidos. Verifique os campos.",
      success: false,
      issues: validatedFields.error.flatten().fieldErrors,
      fields: {
        name: formData.get('name')?.toString() || '',
        email: formData.get('email')?.toString() || '',
      }
    };
  }

  const { name, email, password } = validatedFields.data;

  // --- Mock Registration Logic ---
  console.log("Attempting User Registration:", { name, email });
  // Simulate checking if user already exists
  if (email === "existing@example.com") {
    return {
      message: "Este e-mail já está cadastrado.",
      success: false,
      issues: { email: ["Este e-mail já está cadastrado."] },
      fields: { name, email }
    };
  }

  console.log("User registration successful (mocked):", { name, email });
  // In a real app: save user to database, maybe send verification email, redirect
  // redirect('/login');
  return { message: `Cadastro de ${name} realizado com sucesso! (Simulado)`, success: true };
  // --- End Mock Registration Logic ---
}
