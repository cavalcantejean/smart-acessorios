
'use server';

import type { RegisterFormState } from '@/components/auth/RegisterForm';
import { z } from 'zod';

const AdminRegisterSchema = z.object({
  name: z.string().min(2, { message: "O nome deve ter pelo menos 2 caracteres." }),
  email: z.string().email({ message: "Por favor, insira um e-mail válido." }),
  password: z.string().min(8, { message: "A senha de admin deve ter pelo menos 8 caracteres." }), // Stronger password for admin
  confirmPassword: z.string(),
  adminSecretKey: z.string().min(1, { message: "Chave secreta de admin é obrigatória."}), // Example of a simple gate for admin registration
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas não coincidem.",
  path: ["confirmPassword"],
});

export async function registerAdminAction(
  prevState: RegisterFormState,
  formData: FormData
): Promise<RegisterFormState> {
  const validatedFields = AdminRegisterSchema.safeParse(
    Object.fromEntries(formData.entries())
  );

  if (!validatedFields.success) {
    const fieldErrors = validatedFields.error.flatten().fieldErrors;
    // Remove adminSecretKey from issues shown to user for security
    if (fieldErrors.adminSecretKey) delete fieldErrors.adminSecretKey;

    return {
      message: "Dados de cadastro de admin inválidos. Verifique os campos.",
      success: false,
      issues: fieldErrors,
      fields: {
        name: formData.get('name')?.toString() || '',
        email: formData.get('email')?.toString() || '',
      }
    };
  }

  const { name, email, password, adminSecretKey } = validatedFields.data;

  // --- Mock Admin Registration Logic ---
  console.log("Attempting Admin Registration:", { name, email });

  // Example: Check admin secret key (THIS IS VERY BASIC, NOT FOR PRODUCTION)
  if (adminSecretKey !== "SUPER_SECRET_ADMIN_KEY") {
    return {
        message: "Chave secreta de administrador inválida.",
        success: false,
        fields: { name, email }
    };
  }

  // Simulate checking if admin already exists
  if (email === "existingadmin@example.com") {
    return {
      message: "Este e-mail de administrador já está cadastrado.",
      success: false,
      issues: { email: ["Este e-mail de administrador já está cadastrado."] },
      fields: { name, email }
    };
  }

  console.log("Admin registration successful (mocked):", { name, email });
  // In a real app: save admin to database, potentially with specific roles/permissions
  return { message: `Cadastro de administrador ${name} realizado com sucesso! (Simulado)`, success: true };
  // --- End Mock Admin Registration Logic ---
}
