'use server';

import { revalidatePath } from 'next/cache';
import {
  toggleUserAdminStatus as toggleUserAdminStatusInDb,
  deleteUserCompletely
} from '@/lib/data-admin';
import type { UserFirestoreData } from '@/lib/types';

// Helper type for Server Action responses for admin toggle
export interface UserAdminActionResult {
  success: boolean;
  message?: string;
  error?: string;
  user?: UserFirestoreData | null;
}

// Helper type for Server Action responses for delete
export interface UserDeleteActionResult {
  success: boolean;
  message?: string;
  error?: string;
}

export async function toggleAdminStatusAction(
  userId: string,
  currentAdminId: string // For potential future server-side checks, though data-admin should be robust
): Promise<UserAdminActionResult> {
  if (!userId || !currentAdminId) {
    return {
      success: false,
      message: "IDs de usuário inválidos.", // "Invalid user IDs."
      error: "User ID or Current Admin ID not provided.",
    };
  }

  // Note: The `toggleUserAdminStatusInDb` function in `data-admin.ts` should contain
  // the critical logic to prevent a user from removing their own admin status if they are the sole admin.
  // This server action is an additional layer but relies on the data layer's integrity.
  // Passing `currentAdminId` allows for future checks here if needed, e.g.,
  // if (userId === currentAdminId && /* logic to check if last admin */) { ... }
  // However, for now, we assume data-admin's `toggleUserAdminStatus` handles this.

  try {
    const updatedUser = await toggleUserAdminStatusInDb(userId);

    if (!updatedUser) {
      // This might happen if the user doesn't exist, or if toggleUserAdminStatusInDb itself prevents the action (e.g., last admin)
      // and returns null without throwing an error.
      throw new Error("Falha ao alternar status de administrador ou usuário não encontrado.");
    }

    revalidatePath('/admin/users');

    return {
      success: true,
      message: `Status de administrador para ${updatedUser.name || userId} alterado com sucesso.`,
      user: updatedUser,
    };
  } catch (e: any) {
    console.error("Error in toggleAdminStatusAction:", e);
    // Check if the error message indicates the specific "last admin" scenario, if possible
    if (e.message && e.message.includes("Cannot remove admin status from the sole admin")) { // Example check
        return {
            success: false,
            message: "Não é possível remover o status de administrador do único administrador.",
            error: e.message,
        };
    }
    return {
      success: false,
      message: `Falha ao alternar status de administrador: ${e.message || 'Erro desconhecido do servidor.'}`,
      error: e.message || 'Erro desconhecido do servidor.',
    };
  }
}

export async function deleteUserAction(
  userIdToDelete: string,
  currentAdminId: string
): Promise<UserDeleteActionResult> {
  if (!userIdToDelete || !currentAdminId) {
    return {
      success: false,
      message: "IDs de usuário inválidos para exclusão.",
      error: "User ID to delete or Current Admin ID not provided.",
    };
  }

  // The `deleteUserCompletely` function in `data-admin.ts` already checks for self-deletion.
  // Additional business logic (e.g., preventing deletion of the last admin) should be in `deleteUserCompletely`.

  try {
    const result = await deleteUserCompletely(userIdToDelete, currentAdminId);

    if (result.success) {
      revalidatePath('/admin/users');
    }

    return result; // Contains { success: boolean; message: string }

  } catch (e: any) { // Should not happen if deleteUserCompletely catches its own errors
    console.error("Unexpected error in deleteUserAction:", e);
    return {
      success: false,
      message: `Falha inesperada ao excluir usuário: ${e.message || 'Erro desconhecido do servidor.'}`,
      error: e.message || 'Erro desconhecido do servidor.',
    };
  }
}
