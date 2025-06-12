
"use server";

import { z } from 'zod';
import { toggleUserAdminStatus as toggleAdminData } from '@/lib/data-admin'; // Importar de data-admin.ts
import { getUserById, getAllUsers as getAllUsersData } from '@/lib/data'; // Funções de leitura podem vir de data.ts (client SDK)
import type { UserFirestoreData as User } from '@/lib/types';
import { revalidatePath } from 'next/cache';

const ToggleAdminStatusSchema = z.object({
  userId: z.string().min(1, "User ID is required."),
});

interface ToggleAdminStatusActionResult {
  success: boolean;
  user?: User | null;
  message?: string;
  error?: string;
}

export async function toggleAdminStatusAction(
  prevState: ToggleAdminStatusActionResult | null,
  formData: FormData
): Promise<ToggleAdminStatusActionResult> {
  const rawFormData = {
    userId: formData.get('userId'),
  };

  const validatedFields = ToggleAdminStatusSchema.safeParse(rawFormData);

  if (!validatedFields.success) {
    return {
      success: false,
      error: "Invalid input: " + JSON.stringify(validatedFields.error.flatten().fieldErrors),
    };
  }

  const { userId } = validatedFields.data;

  const targetUser = await getUserById(userId); // Leitura pode usar client SDK se as regras permitirem
  if (targetUser?.isAdmin) {
      const allUsers = await getAllUsersData(); // Leitura pode usar client SDK
      const adminUsers = allUsers.filter(u => u.isAdmin);
      if (adminUsers.length === 1 && adminUsers[0].id === userId) {
           return { success: false, error: "Não é possível remover o status de administrador do único administrador." };
      }
  }

  try {
    const updatedUser = await toggleAdminData(userId); // Escrita usa data-admin.ts
    if (!updatedUser) {
      return { success: false, error: `Falha ao alterar o status de admin. Usuário ${userId} não encontrado.` };
    }

    revalidatePath('/admin/users');

    return {
      success: true,
      user: updatedUser,
      message: `Status de administrador para ${updatedUser.name} foi ${updatedUser.isAdmin ? 'concedido' : 'removido'}.`,
    };
  } catch (error) {
    console.error("Error in toggleAdminStatusAction:", error);
    return { success: false, error: "Ocorreu um erro no servidor ao tentar alterar o status de administrador." };
  }
}
    