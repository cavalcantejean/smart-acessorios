
"use server";

import { z } from 'zod';
import { AccessoryFormSchema } from '@/lib/schemas/accessory-schema';
// Importar o addAccessory que usa o Admin SDK
import { addAccessoryWithAdmin, updateAccessory, deleteAccessory as deleteAccessoryData } from '@/lib/data'; 
import type { Accessory } from '@/lib/types';
import { revalidatePath } from 'next/cache';
import { generateProductDescription, type GenerateDescriptionInput, type GenerateDescriptionOutput } from '@/ai/flows/generate-product-description-flow';
import { adminDb } from '@/lib/firebase-admin'; // Importar adminDb para verificar permissão

export interface AccessoryActionResult {
  success: boolean;
  message?: string;
  error?: string;
  errors?: z.ZodIssue[];
  accessory?: Accessory;
}

export async function createAccessoryAction(
  prevState: AccessoryActionResult | null,
  formData: FormData
): Promise<AccessoryActionResult> {
  const rawFormData = Object.fromEntries(formData.entries());
  const callingUserId = rawFormData.userId as string; // userId é adicionado pelo formulário

  console.log("[Action:createAccessory] Raw form data received:", JSON.stringify(rawFormData, null, 2));

  if (!callingUserId) {
    console.error("[Action:createAccessory] User ID from form is missing.");
    return { success: false, error: "ID do usuário chamador não fornecido. Ação não autorizada." };
  }

  // Verificar se o usuário é admin usando o Admin SDK
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
    // Usar a função que utiliza o Admin SDK para adicionar o acessório
    const newAccessory = await addAccessoryWithAdmin(validatedFields.data);
    if (newAccessory) {
      revalidatePath('/admin/accessories');
      revalidatePath('/products');
      revalidatePath('/');
      revalidatePath('/deals');
      return {
        success: true,
        message: `Acessório "${newAccessory.name}" criado com sucesso!`,
        accessory: newAccessory as Accessory // Cast para o tipo correto se necessário
      };
    } else {
      console.error("[Action:createAccessory] addAccessoryWithAdmin returned a falsy value without throwing an error.");
      return { success: false, error: "Falha ao criar o acessório no sistema (retorno inesperado de addAccessoryWithAdmin)." };
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
    // updateAccessory deve ser adaptado para usar Admin SDK ou ser chamado após verificação de admin
    const updatedAccessory = await updateAccessory(accessoryId, validatedFields.data); // Esta função precisa ser verificada/adaptada
    if (updatedAccessory) {
      revalidatePath('/admin/accessories');
      revalidatePath(`/admin/accessories/${accessoryId}/edit`);
      revalidatePath(`/accessory/${accessoryId}`);
      revalidatePath('/products');
      revalidatePath('/');
      revalidatePath('/deals');
      return {
        success: true,
        message: `Acessório "${updatedAccessory.name}" atualizado com sucesso!`,
        accessory: updatedAccessory
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
  const callingUserId = formData.get('userId') as string; // Assumindo que o ID do usuário também será enviado

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
    // deleteAccessoryData deve ser adaptado para usar Admin SDK ou ser chamado após verificação de admin
    const deleted = await deleteAccessoryData(accessoryId); // Esta função precisa ser verificada/adaptada
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

const GenerateDescriptionAISchema = z.object({
  productInfo: z.string().min(5, "Product information must be at least 5 characters."),
});

interface GenerateDescriptionAIResult {
  success: boolean;
  description?: string;
  error?: string;
}

export async function generateDescriptionWithAIAction(
  productInfo: string
): Promise<GenerateDescriptionAIResult> {
  const validationResult = GenerateDescriptionAISchema.safeParse({ productInfo });
  if (!validationResult.success) {
    return { success: false, error: validationResult.error.errors.map(e => e.message).join(', ') };
  }

  try {
    const result: GenerateDescriptionOutput = await generateProductDescription({ productInfo: validationResult.data.productInfo });
    if (result.generatedDescription) {
      return { success: true, description: result.generatedDescription };
    } else {
      return { success: false, error: "AI não conseguiu gerar uma descrição." };
    }
  } catch (error) {
    console.error("Error in generateDescriptionWithAIAction:", error);
    return { success: false, error: "Falha ao gerar descrição com IA. Tente novamente." };
  }
}
