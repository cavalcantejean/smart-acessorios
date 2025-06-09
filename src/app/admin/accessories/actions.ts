
"use server";

import { z } from 'zod';
import { AccessoryFormSchema, type AccessoryFormValues } from '@/lib/schemas/accessory-schema';
import { addAccessory, updateAccessory, deleteAccessory as deleteAccessoryData, getAccessoryById } from '@/lib/data';
import type { Accessory } from '@/lib/types';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export interface AccessoryActionResult {
  success: boolean;
  message?: string;
  error?: string; // General error message
  errors?: z.ZodIssue[]; // Specific field validation errors
  accessory?: Accessory;
}

export async function createAccessoryAction(
  prevState: AccessoryActionResult | null,
  formData: FormData
): Promise<AccessoryActionResult> {
  const rawFormData = Object.fromEntries(formData.entries());

  // Convert checkbox/switch value
  const dataToValidate = {
    ...rawFormData,
    isDeal: rawFormData.isDeal === 'on',
    price: rawFormData.price || undefined, // Ensure price is undefined if empty string for optional validation
    category: rawFormData.category || undefined,
    imageHint: rawFormData.imageHint || undefined,
    aiSummary: rawFormData.aiSummary || undefined,
  };

  const validatedFields = AccessoryFormSchema.safeParse(dataToValidate);

  if (!validatedFields.success) {
    console.log("Validation errors:", validatedFields.error.flatten().fieldErrors);
    return {
      success: false,
      message: "Falha na validação. Verifique os campos.",
      errors: validatedFields.error.errors, // Pass all ZodIssues
      error: "Dados inválidos. Corrija os erros abaixo."
    };
  }

  try {
    const newAccessory = addAccessory(validatedFields.data);
    if (newAccessory) {
      revalidatePath('/admin/accessories');
      revalidatePath('/products');
      revalidatePath('/');
      revalidatePath('/deals');
      // Instead of redirecting here, let the form component handle it based on success state
      // This allows the success toast to be shown before redirection.
      // redirect('/admin/accessories'); 
      return { 
        success: true, 
        message: `Acessório "${newAccessory.name}" criado com sucesso!`, 
        accessory: newAccessory 
      };
    } else {
      return { success: false, error: "Falha ao criar o acessório no sistema." };
    }
  } catch (error) {
    console.error("Error in createAccessoryAction:", error);
    return { success: false, error: "Erro no servidor ao tentar criar o acessório." };
  }
}

export async function updateAccessoryAction(
  accessoryId: string,
  prevState: AccessoryActionResult | null,
  formData: FormData
): Promise<AccessoryActionResult> {
  console.log(`updateAccessoryAction for ID ${accessoryId} called with formData:`, Object.fromEntries(formData.entries()));
  
  const rawFormData = Object.fromEntries(formData.entries());
  const dataToValidate = {
    ...rawFormData,
    isDeal: rawFormData.isDeal === 'on',
    price: rawFormData.price || undefined,
    category: rawFormData.category || undefined,
    imageHint: rawFormData.imageHint || undefined,
    aiSummary: rawFormData.aiSummary || undefined,
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
    const updatedAccessory = updateAccessory(accessoryId, validatedFields.data);
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
    const deleted = deleteAccessoryData(accessoryId);
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
