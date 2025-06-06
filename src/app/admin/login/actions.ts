
'use server';

import type { LoginFormState } from '@/components/auth/LoginForm';
import { z } from 'zod';

const AdminLoginSchema = z.object({
  email: z.string().email({ message: "E-mail inválido." }),
  password: z.string().min(1, { message: "Senha é obrigatória." }),
});

export async function loginAdminAction(
  prevState: LoginFormState,
  formData: FormData
): Promise<LoginFormState> {
  const validatedFields = AdminLoginSchema.safeParse(
    Object.fromEntries(formData.entries())
  );

  if (!validatedFields.success) {
    return {
      message: "Dados de login de admin inválidos. Verifique os campos.",
      success: false,
      issues: validatedFields.error.flatten().fieldErrors,
      fields: {
        email: formData.get('email')?.toString() || '',
        password: '',
      }
    };
  }

  const { email, password } = validatedFields.data;

  // --- Mock Admin Authentication Logic ---
  console.log("Attempting Admin Login:", { email });
  if (email === "admin@example.com" && password === "adminpassword") {
    console.log("Admin login successful (mocked)");
    // In a real app: create admin session, set cookie, redirect to admin panel
    // redirect('/admin/dashboard');
    return { message: `Login de administrador ${email} bem-sucedido! (Simulado)`, success: true };
  } else {
    console.log("Admin login failed (mocked)");
    return { 
        message: "Credenciais de administrador inválidas.", 
        success: false,
        fields: { email, password: '' }
    };
  }
  // --- End Mock Admin Authentication Logic ---
}
