
"use server";

import { z } from 'zod';
import { AccessoryFormSchema } from '@/lib/schemas/accessory-schema';
import { addAccessory, updateAccessory, deleteAccessory as deleteAccessoryData } from '@/lib/data';
import type { Accessory } from '@/lib/types';
import { revalidatePath } from 'next/cache';
// import { redirect } from 'next/navigation'; // Not redirecting from action
import { generateProductDescription, type GenerateDescriptionInput, type GenerateDescriptionOutput } from '@/ai/flows/generate-product-description-flow';

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
  const dataToValidate = {
    ...rawFormData,
    isDeal: rawFormData.isDeal === 'on',
    price: rawFormData.price || undefined,
    category: rawFormData.category || undefined,
    imageHint: rawFormData.imageHint || undefined,
    aiSummary: rawFormData.aiSummary || undefined,
    embedHtml: rawFormData.embedHtml || undefined,
  };

  console.log("[Action:createAccessory] Data recebida do formulário para validação:", JSON.stringify(dataToValidate, null, 2));

  const validatedFields = AccessoryFormSchema.safeParse(dataToValidate);

  if (!validatedFields.success) {
    console.error("[Action:createAccessory] Falha na validação Zod:", JSON.stringify(validatedFields.error.flatten(), null, 2));
    return {
      success: false,
      message: "Falha na validação. Verifique os campos.",
      errors: validatedFields.error.errors,
      error: "Dados inválidos. Corrija os erros abaixo."
    };
  }

  console.log("[Action:createAccessory] Dados validados para enviar ao Firestore:", JSON.stringify(validatedFields.data, null, 2));

  try {
    // addAccessory is now async
    const newAccessory = await addAccessory(validatedFields.data);
    if (newAccessory) {
      revalidatePath('/admin/accessories');
      revalidatePath('/products');
      revalidatePath('/');
      revalidatePath('/deals');
      return {
        success: true,
        message: `Acessório "${newAccessory.name}" criado com sucesso!`,
        accessory: newAccessory
      };
    } else {
      console.error("[Action:createAccessory] addAccessory retornou um valor falso (null/undefined) sem lançar erro.");
      return { success: false, error: "Falha ao criar o acessório no sistema (retorno inesperado da função addAccessory)." };
    }
  } catch (error: any) {
    console.error("[Action:createAccessory] Erro DETALHADO no bloco catch:", error);
    let errorMessage = "Erro no servidor ao tentar criar o acessório.";
    if (error.code) { // Erros do Firebase frequentemente têm um código
        errorMessage += ` (Código Firebase: ${error.code})`;
    }
    if (error.message) { // E uma mensagem
        errorMessage += ` Mensagem: ${error.message}`;
    }
    // Para log mais verboso, se as mensagens acima não forem suficientes:
    // console.error("Objeto de erro completo (stringified):", JSON.stringify(error, Object.getOwnPropertyNames(error)));
    return { success: false, error: errorMessage };
  }
}

export async function updateAccessoryAction(
  accessoryId: string,
  prevState: AccessoryActionResult | null,
  formData: FormData
): Promise<AccessoryActionResult> {
  const rawFormData = Object.fromEntries(formData.entries());
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
    // updateAccessory is now async
    const updatedAccessory = await updateAccessory(accessoryId, validatedFields.data);
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

  if (!accessoryId) {
    return { success: false, error: "ID do acessório ausente." };
  }

  try {
    // deleteAccessoryData is now async
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
