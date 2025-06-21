'use server';

import { revalidatePath } from 'next/cache';
import { AccessoryFormSchema, type AccessoryFormValues } from '@/lib/schemas/accessory-schema';
import {
  addAccessoryWithAdmin,
  updateAccessory,
  deleteAccessory
} from '@/lib/data-admin';

// ===== IMPORTAÇÕES CORRIGIDAS =====
import type { Accessory } from '@/lib/types';
import { generateProductDescription } from '@/ai/flows/generate-product-description-flow';
import { GenerateDescriptionInputSchema, type GenerateDescriptionOutput } from '@/ai/flows/ai_schemas';
// ==================================

// Helper type for Server Action responses
export interface AccessoryActionResult {
  success: boolean;
  message?: string;
  error?: string | { [key: string]: string[] };
  accessory?: Accessory | null;
}

// Utility to convert FormData to a suitable object and prepare data
const processFormData = (formData: FormData): Record<string, any> => {
  const data: { [key: string]: any } = {};
  formData.forEach((value, key) => {
    if (key === 'isDeal') {
      data[key] = value === 'on' || value === 'true';
    } else if (key === 'price') {
      data[key] = String(value);
    } else {
      data[key] = value;
    }
  });
  return data;
};

export async function addAccessoryAction(
  prevState: AccessoryActionResult | undefined,
  formData: FormData
): Promise<AccessoryActionResult> {
  try {
    const rawData = processFormData(formData);
    const validatedFields = AccessoryFormSchema.safeParse(rawData);

    if (!validatedFields.success) {
      console.error("Validation Error (Add Accessory):", validatedFields.error.flatten().fieldErrors);
      return {
        success: false,
        error: validatedFields.error.flatten().fieldErrors,
        message: "Erro de validação. Verifique os campos do acessório.",
      };
    }

    try {
      const dataForAdminFn = {
          ...validatedFields.data,
          price: String(validatedFields.data.price),
      };

      const newAccessory = await addAccessoryWithAdmin(dataForAdminFn as Omit<Accessory, 'id' | 'createdAt' | 'updatedAt'>);

      revalidatePath('/admin/accessories');
      revalidatePath('/accessories');

      return {
        success: true,
        message: 'Acessório adicionado com sucesso!',
        accessory: newAccessory,
      };
    } catch (e: any) {
      console.error("Error in addAccessoryAction logic:", e);
      return {
        success: false,
        message: `Falha ao adicionar acessório: ${e.message || 'Erro desconhecido do servidor.'}`,
        error: e.message || 'Erro desconhecido do servidor.',
      };
    }
  } catch (e: any) {
    console.error("Critical error in addAccessoryAction:", e);
    return {
      success: false,
      message: `Ocorreu um erro crítico no servidor: ${e.message || 'Erro desconhecido.'}`,
      error: e.message || 'Erro crítico desconhecido.',
    };
  }
}

export async function generateDescriptionAction(
  prevState: any,
  formData: FormData
): Promise<{ success: boolean; description?: string; error?: string }> {

  const rawData = {
    productInfo: formData.get('productInfo')
  };

  const validatedInput = GenerateDescriptionInputSchema.safeParse(rawData);

  if (!validatedInput.success) {
    console.error("Validation Error (Generate Description Input):", validatedInput.error.flatten().fieldErrors);
    return {
      success: false,
      error: "Informações inválidas para gerar descrição: " + validatedInput.error.flatten().fieldErrors.productInfo?.join(', '),
    };
  }

  try {
    console.log("[Action:generateDescriptionAction] Calling generateProductDescription with input:", validatedInput.data);
    const result: GenerateDescriptionOutput = await generateProductDescription(validatedInput.data);
    console.log("[Action:generateDescriptionAction] Received result from flow:", result);

    if (result && result.generatedDescription) {
      return {
        success: true,
        description: result.generatedDescription,
      };
    } else {
      return {
        success: false,
        error: "A IA não conseguiu gerar uma descrição válida.",
      };
    }
  } catch (e: any) {
    console.error("Error in generateDescriptionAction:", e);
    let errorMessage = "Falha ao gerar descrição com IA.";
    if (e.message) {
        errorMessage += ` Detalhe: ${e.message}`;
    }
    if (e.cause && typeof e.cause === 'string' && e.cause.includes('configureApiKey')) {
        errorMessage = "Erro de configuração da API Genkit. Verifique a chave de API.";
    }
    return {
      success: false,
      error: errorMessage,
    };
  }
}

export async function updateAccessoryAction(
  accessoryId: string,
  prevState: AccessoryActionResult | undefined,
  formData: FormData
): Promise<AccessoryActionResult> {
  if (!accessoryId) {
    return { success: false, message: "ID do acessório não fornecido para atualização." };
  }

  const rawData = processFormData(formData);
  const validatedFields = AccessoryFormSchema.safeParse(rawData);

  if (!validatedFields.success) {
    console.error("Validation Error (Update Accessory):", validatedFields.error.flatten().fieldErrors);
    return {
      success: false,
      error: validatedFields.error.flatten().fieldErrors,
      message: "Erro de validação. Verifique os campos do acessório.",
    };
  }

  try {
     const dataForAdminFn = {
        ...validatedFields.data,
        price: String(validatedFields.data.price),
    };
    const updatedAccessory = await updateAccessory(accessoryId, dataForAdminFn as Partial<Omit<Accessory, 'id'>>);

    if (!updatedAccessory) {
        throw new Error("Falha ao atualizar o acessório no servidor.");
    }

    revalidatePath('/admin/accessories');
    revalidatePath(`/admin/accessories/${accessoryId}/edit`);
    revalidatePath('/accessories');
    if (updatedAccessory.slug) {
        revalidatePath(`/accessory/${updatedAccessory.slug}`);
    }

    return {
      success: true,
      message: 'Acessório atualizado com sucesso!',
      accessory: updatedAccessory,
    };
  } catch (e: any) {
    console.error("Error in updateAccessoryAction:", e);
    return {
      success: false,
      message: `Falha ao atualizar acessório: ${e.message || 'Erro desconhecido do servidor.'}`,
      error: e.message || 'Erro desconhecido do servidor.',
    };
  }
}

export async function deleteAccessoryAction(
  accessoryId: string,
): Promise<Omit<AccessoryActionResult, 'accessory'>> {
   if (!accessoryId) {
    return { success: false, message: "ID do acessório não fornecido para exclusão." };
  }

  try {
    const success = await deleteAccessory(accessoryId);
    if (!success) {
        throw new Error("Falha ao excluir o acessório no servidor.");
    }

    revalidatePath('/admin/accessories');
    revalidatePath('/accessories');

    return {
      success: true,
      message: 'Acessório excluído com sucesso!',
    };
  } catch (e: any) {
    console.error("Error in deleteAccessoryAction:", e);
    return {
      success: false,
      message: `Falha ao excluir acessório: ${e.message || 'Erro desconhecido do servidor.'}`,
      error: e.message || 'Erro desconhecido do servidor.',
    };
  }
}