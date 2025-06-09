
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

  // Simulate adding user (in a real app, this would involve hashing password and DB insertion)
  // For this mock, addUser function in data.ts can simulate this.
  // New users are always non-admins.
  const newUser: AuthUser = {
    id: `user-${Date.now()}`, // mock ID
    name,
    email,
    isAdmin: false, 
  };

  // Simulate adding to our mock data store
  // Note: addUser in data.ts currently doesn't modify the in-memory array for simplicity in this example.
  // It mainly checks for existence. If it were to modify, that would be reflected if app was stateful across requests.
  // For this server action, we'll assume addUser logic is sufficient.
  const userAdded = addUser({ ...newUser, password }); // Pass password for the mock addUser if it needs it

  if (!userAdded && email !== "existing@example.com") { // existing@example.com is handled by getUserByEmail check
     // This case might not be hit if getUserByEmail is comprehensive, but as a fallback.
     return {
        message: "Não foi possível registrar o usuário. Tente novamente.",
        success: false,
        fields: { name, email },
        user: null,
     }
  }


  console.log("User registration successful (mocked):", newUser);
  return { 
    message: `Cadastro de ${name} realizado com sucesso! Você já pode fazer login.`, 
    success: true,
    user: newUser, // Return the newly created user data (without password)
  };
}
