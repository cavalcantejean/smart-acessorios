
"use server";

import { z } from 'zod';
import { toggleUserAdminStatus as toggleAdminData, getUserById, getAllUsers as getAllUsersData } from '@/lib/data'; // Now async
import type { UserFirestoreData as User } from '@/lib/types'; // Use UserFirestoreData as User
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

  // Prevent admin from revoking their own admin status if they are the only admin
  // This logic needs to be async now due to data fetching
  const targetUser = await getUserById(userId);
  if (targetUser?.isAdmin) {
      const allUsers = await getAllUsersData();
      const adminUsers = allUsers.filter(u => u.isAdmin);
      if (adminUsers.length === 1 && adminUsers[0].id === userId) {
           return { success: false, error: "Não é possível remover o status de administrador do único administrador." };
      }
  }

  try {
    const updatedUser = await toggleAdminData(userId); // Await async call
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
