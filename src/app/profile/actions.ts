
"use server";

import { z } from 'zod';
import { toggleFollowUser as toggleFollowUserData, checkAndAwardBadges } from '@/lib/data'; // Now async
// getUserById is also async, but usually not needed directly in action if data.ts handles counts

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
      error: "Invalid input: " + JSON.stringify(validatedFields.error.flatten().fieldErrors),
    };
  }

  const { currentUserId, targetUserId } = validatedFields.data;

  if (currentUserId === targetUserId) {
    return { success: false, error: "Você não pode seguir a si mesmo." };
  }

  try {
    const result = await toggleFollowUserData(currentUserId, targetUserId); // Await async
    if (!result) {
      return { success: false, error: "Falha ao seguir/deixar de seguir o usuário. Usuário não encontrado." };
    }

    // Badge checking is now handled within toggleFollowUserData via checkAndAwardBadges
    return {
      success: true,
      isFollowing: result.isFollowing,
      followersCount: result.targetFollowersCount,
      message: result.isFollowing ? "Agora seguindo!" : "Deixou de seguir.",
    };
  } catch (error) {
    console.error("Error in toggleFollowAction:", error);
    return { success: false, error: "Ocorreu um erro no servidor." };
  }
}
