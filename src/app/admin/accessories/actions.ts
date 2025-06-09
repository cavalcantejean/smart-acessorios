
"use server";

import { z } from 'zod';
import { addAccessory, updateAccessory, deleteAccessory as deleteAccessoryData, getAccessoryById } from '@/lib/data';
import type { Accessory } from '@/lib/types';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

// Schema for validating accessory form data
export const AccessoryFormSchema = z.object({
  name: z.string().min(3, "O nome deve ter pelo menos 3 caracteres."),
  shortDescription: z.string().min(10, "A descrição curta deve ter pelo menos 10 caracteres."),
  fullDescription: z.string().min(20, "A descrição completa deve ter pelo menos 20 caracteres."),
  imageUrl: z.string().url("URL da imagem inválida.").min(1, "URL da imagem é obrigatória."),
  imageHint: z.string().optional(),
  affiliateLink: z.string().url("Link de afiliado inválido.").min(1, "Link de afiliado é obrigatório."),
  price: z.string().optional().refine(val => !val || /^\d+(,\d{1,2})?$/.test(val) || /^\d+(\.\d{1,2})?$/.test(val), {
    message: "Preço inválido. Use formato como 12,99 ou 12.99"
  }),
  category: z.string().optional(),
  isDeal: z.boolean().optional().default(false),
  aiSummary: z.string().optional(),
});
export type AccessoryFormValues = z.infer<typeof AccessoryFormSchema>;


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
  // This action will be fully implemented in the next step with the form.
  // For now, it's a placeholder.
  console.log("createAccessoryAction called with formData:", Object.fromEntries(formData.entries()));
  await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate delay
  
  // Placeholder: return success for now to allow navigation setup
  // In reality, you would parse, validate, and call addAccessory here
  // For a real implementation:
  // const validatedFields = AccessoryFormSchema.safeParse(Object.fromEntries(formData.entries()));
  // if (!validatedFields.success) { /* handle errors */ }
  // const newAccessory = addAccessory(validatedFields.data);
  // if (newAccessory) { revalidatePath('/admin/accessories'); return { success: true, message: 'Acessório criado!', accessory: newAccessory }; }
  
  return { success: false, error: "Criação de acessório ainda não implementada completamente." };
}

export async function updateAccessoryAction(
  accessoryId: string,
  prevState: AccessoryActionResult | null,
  formData: FormData
): Promise<AccessoryActionResult> {
  // This action will be fully implemented in the next step with the form.
  // For now, it's a placeholder.
  console.log(`updateAccessoryAction for ID ${accessoryId} called with formData:`, Object.fromEntries(formData.entries()));
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Placeholder: return success for now to allow navigation setup
  return { success: false, error: "Atualização de acessório ainda não implementada completamente." };
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
      revalidatePath('/products'); // Revalidate public products page
      revalidatePath('/'); // Revalidate homepage if deals/etc. might change
      return { success: true, message: "Acessório excluído com sucesso." };
    } else {
      return { success: false, error: "Falha ao excluir acessório. Não encontrado." };
    }
  } catch (error) {
    console.error("Error in deleteAccessoryAction:", error);
    return { success: false, error: "Erro no servidor ao excluir acessório." };
  }
}
