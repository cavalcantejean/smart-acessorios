
"use server";

import { z } from 'zod';
import { AccessoryFormSchema } from '@/lib/schemas/accessory-schema';
import { addAccessoryWithAdmin, updateAccessory, deleteAccessory as deleteAccessoryData } from '@/lib/data-admin';
import type { Accessory } from '@/lib/types';
import { revalidatePath } from 'next/cache';
// import { generateProductDescription, type GenerateDescriptionInput, type GenerateDescriptionOutput } from '@/ai/flows/generate-product-description-flow'; // AI Action Removed
import { adminDb } from '@/lib/firebase-admin';

interface ClientSafeAccessory extends Omit<Accessory, 'createdAt' | 'updatedAt' | 'price' | 'comments'> {
  id: string;
  name: string;
  shortDescription: string;
  fullDescription: string;
  imageUrl: string;
  imageHint?: string;
  affiliateLink: string;
  price?: string;
  category?: string;
  isDeal?: boolean;
  aiSummary?: string;
  embedHtml?: string;
  createdAt?: string; // ISO string
  updatedAt?: string; // ISO string
}

export interface AccessoryActionResult {
  success: boolean;
  message?: string;
  error?: string;
  errors?: z.ZodIssue[];
  accessory?: ClientSafeAccessory;
}

function serializeAccessoryForClient(accessoryData: any): ClientSafeAccessory | undefined {
  if (!accessoryData) return undefined;

  const createdAtTimestamp = accessoryData.createdAt;
  const updatedAtTimestamp = accessoryData.updatedAt;

  return {
    id: accessoryData.id,
    name: accessoryData.name,
    shortDescription: accessoryData.shortDescription,
    fullDescription: accessoryData.fullDescription,
    imageUrl: accessoryData.imageUrl,
    imageHint: accessoryData.imageHint,
    affiliateLink: accessoryData.affiliateLink,
    price: accessoryData.price, 
    category: accessoryData.category,
    isDeal: accessoryData.isDeal,
    aiSummary: accessoryData.aiSummary,
    embedHtml: accessoryData.embedHtml,
    createdAt: createdAtTimestamp?.toDate?.().toISOString(),
    updatedAt: updatedAtTimestamp?.toDate?.().toISOString(),
  };
}


export async function createAccessoryAction(
  prevState: AccessoryActionResult | null,
  formData: FormData
): Promise<AccessoryActionResult> {
  const rawFormData = Object.fromEntries(formData.entries());
  const callingUserId = rawFormData.userId as string;

  console.log("[Action:createAccessory] Raw form data received:", JSON.stringify(rawFormData, null, 2));

  if (!callingUserId) {
    console.error("[Action:createAccessory] User ID from form is missing.");
    return { success: false, error: "ID do usuário chamador não fornecido. Ação não autorizada." };
  }

  if (!adminDb) {
    console.error("[Action:createAccessory] Firebase Admin SDK (adminDb) is not initialized. Cannot verify admin status.");
    return { success: false, error: "Erro crítico na configuração do servidor (Admin SDK). Não é possível verificar o status de administrador." };
  }
  try {
    console.log(`[Action:createAccessory] Verifying admin status for userId: ${callingUserId}`);
    const userDocRef = adminDb.collection('usuarios').doc(callingUserId);
    const userDoc = await userDocRef.get();

    if (!userDoc.exists || !userDoc.data()?.isAdmin) {
      console.warn(`[Action:createAccessory] User ${callingUserId} is not an admin or does not exist. isAdmin: ${userDoc.data()?.isAdmin}`);
      return { success: false, error: "Apenas administradores podem criar acessórios." };
    }
    console.log(`[Action:createAccessory] User ${callingUserId} confirmed as admin.`);
  } catch (adminCheckError) {
    console.error("[Action:createAccessory] Error verifying admin status:", adminCheckError);
    return { success: false, error: "Erro ao verificar permissões de administrador." };
  }

  const dataToValidate = {
    ...rawFormData,
    isDeal: rawFormData.isDeal === 'on',
    price: rawFormData.price || undefined,
    category: rawFormData.category || undefined,
    imageHint: rawFormData.imageHint || undefined,
    aiSummary: rawFormData.aiSummary || undefined,
    embedHtml: rawFormData.embedHtml || undefined,
  };

  console.log("[Action:createAccessory] Data for Zod validation:", JSON.stringify(dataToValidate, null, 2));

  const validatedFields = AccessoryFormSchema.safeParse(dataToValidate);

  if (!validatedFields.success) {
    console.error("[Action:createAccessory] Zod validation failed:", JSON.stringify(validatedFields.error.flatten(), null, 2));
    return {
      success: false,
      message: "Falha na validação. Verifique os campos.",
      errors: validatedFields.error.errors,
      error: "Dados inválidos. Corrija os erros abaixo."
    };
  }

  console.log("[Action:createAccessory] Validated data for Firestore (via Admin SDK):", JSON.stringify(validatedFields.data, null, 2));

  try {
    const tempAccessoryDataFromAdd = await addAccessoryWithAdmin(validatedFields.data as Omit<Accessory, 'id' | 'createdAt' | 'updatedAt' | 'comments'>);

    const docRef = adminDb.collection('acessorios').doc(tempAccessoryDataFromAdd.id);
    const newDocSnap = await docRef.get();
    const createdAccessoryDbData = newDocSnap.data();

    if (createdAccessoryDbData) {
      const accessoryToSerialize = { id: newDocSnap.id, ...createdAccessoryDbData };
      
      revalidatePath('/admin/accessories');
      revalidatePath('/products');
      revalidatePath('/');
      revalidatePath('/deals');
      return {
        success: true,
        message: `Acessório "${accessoryToSerialize.name}" criado com sucesso!`,
        accessory: serializeAccessoryForClient(accessoryToSerialize),
      };
    } else {
      console.error("[Action:createAccessory] Failed to fetch newly created accessory document.");
      return { success: false, error: "Falha ao buscar o acessório recém-criado." };
    }
  } catch (error: any) {
    console.error("[Action:createAccessory] Detailed error in catch block:", error);
    let errorMessage = "Erro no servidor ao tentar criar o acessório.";
    if (error.code) {
        errorMessage += ` (Código Firebase: ${error.code})`;
    }
    if (error.message) {
        errorMessage += ` Mensagem: ${error.message}`;
    }
    return { success: false, error: errorMessage };
  }
}

export async function updateAccessoryAction(
  accessoryId: string,
  prevState: AccessoryActionResult | null,
  formData: FormData
): Promise<AccessoryActionResult> {
  const rawFormData = Object.fromEntries(formData.entries());
  const callingUserId = rawFormData.userId as string;

  if (!callingUserId) {
    return { success: false, error: "ID do usuário chamador não fornecido. Ação não autorizada." };
  }

  if (!adminDb) {
    console.error("[Action:updateAccessory] Firebase Admin SDK (adminDb) is not initialized.");
    return { success: false, error: "Erro crítico na configuração do servidor (Admin SDK)." };
  }
  try {
    const userDocRef = adminDb.collection('usuarios').doc(callingUserId);
    const userDoc = await userDocRef.get();
    if (!userDoc.exists || !userDoc.data()?.isAdmin) {
      return { success: false, error: "Apenas administradores podem atualizar acessórios." };
    }
  } catch (adminCheckError) {
    console.error("[Action:updateAccessory] Error verifying admin status:", adminCheckError);
    return { success: false, error: "Erro ao verificar permissões de administrador." };
  }

  const dataToValidate = {
    ...rawFormData,
    isDeal: rawFormData.isDeal === 'on',
    price: rawFormData.price || undefined,
    category: rawFormData.category || undefined,
    imageHint: rawFormData.imageHint || undefined,
    aiSummary: rawFormData.aiSummary || undefined,
    embedHtml: rawFormData.embedHtml || undefined,
  };

  const validatedFields = AccessoryFormSchema.safeParse(dataToValidate);

  if (!validatedFields.success) {
    return {
      success: false,
      message: "Falha na validação. Verifique os campos.",
      errors: validatedFields.error.errors,
      error: "Dados inválidos. Corrija os erros abaixo."
    };
  }

  try {
    const updatedAccessoryFromDb = await updateAccessory(accessoryId, validatedFields.data as Partial<Omit<Accessory, 'id'>>);
    if (updatedAccessoryFromDb) {
      revalidatePath('/admin/accessories');
      revalidatePath(`/admin/accessories/${accessoryId}/edit`);
      revalidatePath(`/accessory/${accessoryId}`);
      revalidatePath('/products');
      revalidatePath('/');
      revalidatePath('/deals');
      return {
        success: true,
        message: `Acessório "${updatedAccessoryFromDb.name}" atualizado com sucesso!`,
        accessory: serializeAccessoryForClient(updatedAccessoryFromDb)
      };
    } else {
      return { success: false, error: `Falha ao atualizar o acessório. ID ${accessoryId} não encontrado.` };
    }
  } catch (error) {
    console.error("Error in updateAccessoryAction:", error);
    return { success: false, error: "Erro no servidor ao tentar atualizar o acessório." };
  }
}

export async function deleteAccessoryAction(
  prevState: AccessoryActionResult | null,
  formData: FormData
): Promise<AccessoryActionResult> {
  const accessoryId = formData.get('accessoryId') as string;
  const callingUserId = formData.get('userId') as string;

  if (!callingUserId) {
    return { success: false, error: "ID do usuário chamador não fornecido. Ação não autorizada." };
  }
   if (!adminDb) {
    console.error("[Action:deleteAccessory] Firebase Admin SDK (adminDb) is not initialized.");
    return { success: false, error: "Erro crítico na configuração do servidor (Admin SDK)." };
  }
  try {
    const userDocRef = adminDb.collection('usuarios').doc(callingUserId);
    const userDoc = await userDocRef.get();
    if (!userDoc.exists || !userDoc.data()?.isAdmin) {
      return { success: false, error: "Apenas administradores podem excluir acessórios." };
    }
  } catch (adminCheckError) {
    console.error("[Action:deleteAccessory] Error verifying admin status:", adminCheckError);
    return { success: false, error: "Erro ao verificar permissões de administrador." };
  }

  if (!accessoryId) {
    return { success: false, error: "ID do acessório ausente." };
  }

  try {
    const deleted = await deleteAccessoryData(accessoryId);
    if (deleted) {
      revalidatePath('/admin/accessories');
      revalidatePath('/products');
      revalidatePath('/');
      revalidatePath('/deals');
      return { success: true, message: "Acessório excluído com sucesso." };
    } else {
      return { success: false, error: "Falha ao excluir acessório. Não encontrado." };
    }
  } catch (error) {
    console.error("Error in deleteAccessoryAction:", error);
    return { success: false, error: "Erro no servidor ao excluir acessório." };
  }
}

// AI Action and Schema Removed for static export compatibility
// const GenerateDescriptionAISchema = z.object({
//   productInfo: z.string().min(5, "Product information must be at least 5 characters."),
// });
// interface GenerateDescriptionAIResult {
//   success: boolean;
//   description?: string;
//   error?: string;
// }
// export async function generateDescriptionWithAIAction(
//   productInfo: string
// ): Promise<GenerateDescriptionAIResult> { ... }
    
