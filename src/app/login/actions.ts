
'use server';

import type { LoginFormState } from '@/components/auth/LoginForm';
import { z } from 'zod';
import { getUserByEmail } from '@/lib/data'; // Assuming mock data for now
import type { AuthUser } from '@/lib/types';

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
      user: null,
    };
  }

  const { email, password } = validatedFields.data;

  console.log("Attempting Unified Login:", { email });
  const existingUser = getUserByEmail(email);

  if (existingUser && existingUser.password === password) { // Password check (plain text for mock)
    console.log(`Login successful for ${email}. Admin: ${existingUser.isAdmin}`);
    const authUser: AuthUser = {
      id: existingUser.id,
      name: existingUser.name,
      email: existingUser.email,
      isAdmin: existingUser.isAdmin,
    };
    return { 
      message: `Login bem-sucedido para ${existingUser.name}! ${existingUser.isAdmin ? '(Admin)' : ''}`, 
      success: true,
      user: authUser,
    };
  } else {
    console.log("Login failed for:", { email });
    return { 
        message: "Credenciais inválidas.", 
        success: false,
        fields: { email, password: '' },
        user: null,
    };
  }
}
