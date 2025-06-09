
"use server";

import { z } from 'zod';
import { toggleFollowUser as toggleFollowUserData, getUserById, checkAndAwardBadges } from '@/lib/data';
import type { User } from '@/lib/types';

const ToggleFollowSchema = z.object({
  currentUserId: z.string().min(1, "Current user ID is required."),
  targetUserId: z.string().min(1, "Target user ID is required."),
});

interface ToggleFollowActionResult {
  success: boolean;
  isFollowing?: boolean;
  followersCount?: number;
  message?: string;
  error?: string;
}

export async function toggleFollowAction(
  prevState: ToggleFollowActionResult | null,
  formData: FormData
): Promise<ToggleFollowActionResult> {
  const rawFormData = {
    currentUserId: formData.get('currentUserId'),
    targetUserId: formData.get('targetUserId'),
  };

  const validatedFields = ToggleFollowSchema.safeParse(rawFormData);

  if (!validatedFields.success) {
    return {
      success: false,
      error: "Invalid input: " + validatedFields.error.flatten().fieldErrors,
    };
  }

  const { currentUserId, targetUserId } = validatedFields.data;

  if (currentUserId === targetUserId) {
    return { success: false, error: "Você não pode seguir a si mesmo." };
  }

  try {
    const result = toggleFollowUserData(currentUserId, targetUserId);
    if (!result) {
      return { success: false, error: "Falha ao seguir/deixar de seguir o usuário. Usuário não encontrado." };
    }
    
    const targetUser = getUserById(targetUserId); 

    // Check for badges for both users (already handled in toggleFollowUserData)
    // checkAndAwardBadges(currentUserId);
    // checkAndAwardBadges(targetUserId);
    
    return {
      success: true,
      isFollowing: result.isFollowing,
      followersCount: targetUser?.followers.length ?? 0, 
      message: result.isFollowing ? "Agora seguindo!" : "Deixou de seguir.",
    };
  } catch (error) {
    console.error("Error in toggleFollowAction:", error);
    return { success: false, error: "Ocorreu um erro no servidor." };
  }
}
