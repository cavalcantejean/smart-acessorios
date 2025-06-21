'use server';

import { revalidatePath } from 'next/cache';
import { AccessoryFormSchema, type AccessoryFormValues } from '@/lib/schemas/accessory-schema';
import {
  addAccessoryWithAdmin,
  updateAccessory, // Renamed from updateAccessoryById in plan, using existing data-admin name
  deleteAccessory  // Renamed from deleteAccessoryById, using existing data-admin name
} from '@/lib/data-admin';
import type { Accessory } from '@/lib/types';
// Timestamp import might not be needed if data-admin handles all date conversions.
// For now, AccessoryFormSchema expects strings for dates, so conversion happens there or in component.
import { generateProductDescription } from '@/ai/flows/generate-product-description-flow';
import { GenerateDescriptionInputSchema, type GenerateDescriptionOutput } from '@/ai/flows/ai_schemas';

// Helper type for Server Action responses
export interface AccessoryActionResult {
  success: boolean;
  message?: string;
  error?: string | { [key: string]: string[] }; // Can be a general error or field-specific errors
  accessory?: Accessory | null; // Return the created/updated accessory
}

// Utility to convert FormData to a suitable object and prepare data
const processFormData = (formData: FormData): Record<string, any> => {
  const data: { [key: string]: any } = {};
  formData.forEach((value, key) => {
    if (key === 'isDeal') {
      data[key] = value === 'on' || value === 'true';
    } else if (key === 'price') {
      // Keep price as a string. Schema will validate it.
      // The schema expects a string like "29,99" or "29.99".
      // data-admin functions will handle final conversion to "xx.yy" for DB.
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
  try { // Outermost try
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

    // Inner try for the main logic (already exists, which is good)
    try {
      const dataForAdminFn = {
          ...validatedFields.data,
          price: String(validatedFields.data.price), // Convert price back to string for data-admin
      };

      const newAccessory = await addAccessoryWithAdmin(dataForAdminFn as Omit<Accessory, 'id' | 'createdAt' | 'updatedAt'>); // Type assertion

      revalidatePath('/admin/accessories');
      revalidatePath('/accessories'); // Public listing page

      return {
        success: true,
        message: 'Acessório adicionado com sucesso!',
        accessory: newAccessory,
      };
    } catch (e: any) { // Inner catch for logic errors
      console.error("Error in addAccessoryAction logic:", e);
      return {
        success: false,
        message: `Falha ao adicionar acessório: ${e.message || 'Erro desconhecido do servidor.'}`,
        error: e.message || 'Erro desconhecido do servidor.',
      };
    }
  } catch (e: any) { // Outermost catch for any unexpected errors
    console.error("Critical error in addAccessoryAction:", e);
    return {
      success: false,
      message: `Ocorreu um erro crítico no servidor: ${e.message || 'Erro desconhecido.'}`,
      error: e.message || 'Erro crítico desconhecido.',
    };
  }
}

export async function generateDescriptionAction(
  prevState: any, // Can be more specific if we define a state type
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
    // Ensure the AI flow is initialized if it's not already (e.g. by calling ai.init() in genkit.ts or similar)
    // For now, assuming it's initialized elsewhere or Genkit handles it.
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
    // Check if the error is from Genkit/AI flow specifically
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
    // updateAccessory from data-admin.ts should handle `updatedAt`
    // It also expects price as a string "xx.yy"
     const dataForAdminFn = {
        ...validatedFields.data,
        price: String(validatedFields.data.price), // Convert price back to string for data-admin
    };
    const updatedAccessory = await updateAccessory(accessoryId, dataForAdminFn as Partial<Omit<Accessory, 'id'>>); // Type assertion

    if (!updatedAccessory) {
        throw new Error("Falha ao atualizar o acessório no servidor.");
    }

    revalidatePath('/admin/accessories');
    revalidatePath(`/admin/accessories/${accessoryId}/edit`);
    revalidatePath('/accessories'); // Public listing
    if (updatedAccessory.slug) { // Assuming slug might exist for public path
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
  // prevState is not used here as it's a direct call, not typically via useFormState for simple deletes.
  // However, if it were wrapped in a form for progressive enhancement, prevState could be added.
): Promise<Omit<AccessoryActionResult, 'accessory'>> {
   if (!accessoryId) {
    return { success: false, message: "ID do acessório não fornecido para exclusão." };
  }

  // Note: Authentication/Authorization should be enforced in data-admin.ts or middleware.

  try {
    const success = await deleteAccessory(accessoryId);
    if (!success) {
        throw new Error("Falha ao excluir o acessório no servidor.");
    }

    revalidatePath('/admin/accessories');
    revalidatePath('/accessories'); // Public listing

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
