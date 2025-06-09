
"use server";

import { z } from 'zod';
import { toggleUserAdminStatus as toggleAdminData, getUserById } from '@/lib/data';
import type { User } from '@/lib/types';
import { revalidatePath } from 'next/cache';

const ToggleAdminStatusSchema = z.object({
  userId: z.string().min(1, "User ID is required."),
});

interface ToggleAdminStatusActionResult {
  success: boolean;
  user?: User | null; // Return the updated user or null if not found
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
      error: "Invalid input: " + validatedFields.error.flatten().fieldErrors,
    };
  }

  const { userId } = validatedFields.data;

  // Prevent admin from revoking their own admin status if they are the only admin
  // This is a simplified check. A real app might have more complex logic.
  const currentUserPerformingAction = getUserById('admin-1'); // Assuming 'admin-1' is a fixed superadmin or retrieve dynamically
  if (currentUserPerformingAction?.id === userId) {
    const allUsers = getUserById(userId); // Re-fetch to ensure current data
    if (allUsers?.isAdmin) { // Check if target user is currently admin
        const adminUsers = getAllUsers().filter(u => u.isAdmin);
        if (adminUsers.length === 1 && adminUsers[0].id === userId) {
             return { success: false, error: "Não é possível remover o status de administrador do único administrador." };
        }
    }
  }


  try {
    const updatedUser = toggleAdminData(userId);
    if (!updatedUser) {
      return { success: false, error: `Falha ao alterar o status de admin. Usuário ${userId} não encontrado.` };
    }
    
    revalidatePath('/admin/users'); // Revalidate the users page to show updated data

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

// Helper function, assuming it's okay to be in this "use server" file
// or it would be imported from data.ts if it's more general
function getAllUsers(): User[] {
  // In a real app, this would fetch from your data source
  // For now, assuming it's available or you'd import it from data.ts
  const data = require('@/lib/data');
  return data.getAllUsers();
}
