
'use server';

import type { RegisterFormState } from '@/components/auth/RegisterForm';
import { z } from 'zod';
import { getUserByEmail, addUser } from '@/lib/data'; // For mock data interaction
import type { AuthUser } from '@/lib/types';

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
      },
      user: null,
    };
  }

  const { name, email, password } = validatedFields.data;

  console.log("Attempting User Registration:", { name, email });
  
  if (getUserByEmail(email)) {
    return {
      message: "Este e-mail já está cadastrado.",
      success: false,
      issues: { email: ["Este e-mail já está cadastrado."] },
      fields: { name, email },
      user: null,
    };
  }

  const newUser: AuthUser = {
    id: `user-${Date.now()}`, // mock ID
    name,
    email,
    isAdmin: false, 
  };

  const userAdded = addUser({ ...newUser, password }); 

  if (!userAdded && email !== "existing@example.com") { 
     return {
        message: "Não foi possível registrar o usuário. Tente novamente.",
        success: false,
        fields: { name, email },
        user: null,
     }
  }

  console.log("User registration successful (mocked):", newUser);
  return { 
    message: `Cadastro de ${name} realizado com sucesso! Um e-mail de confirmação foi enviado para ${email}. Por favor, verifique sua caixa de entrada e também a pasta de spam para validar seu cadastro.`, 
    success: true,
    user: newUser, 
  };
}

