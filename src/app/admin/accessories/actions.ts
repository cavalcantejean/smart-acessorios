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
      // Convert price from "29,99" to number 29.99 for validation
      const priceStr = String(value).replace(',', '.');
      const priceNum = parseFloat(priceStr);
      data[key] = isNaN(priceNum) ? undefined : priceNum; // let schema handle if undefined
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
  // Note: Authentication/Authorization should ideally be enforced within data-admin functions
  // or via a middleware pattern for Server Actions if available/applicable.

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
    // addAccessoryWithAdmin from data-admin.ts should handle `createdAt` and `updatedAt`
    // It also expects price as a string "xx.yy"
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
  } catch (e: any) {
    console.error("Error in addAccessoryAction:", e);
    return {
      success: false,
      message: `Falha ao adicionar acessório: ${e.message || 'Erro desconhecido do servidor.'}`,
      error: e.message || 'Erro desconhecido do servidor.',
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
