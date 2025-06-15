'use server';

import { revalidatePath } from 'next/cache';
import { CouponFormSchema, type CouponFormValues } from '@/lib/schemas/coupon-schema';
import {
  addCoupon,
  updateCoupon,
  deleteCoupon
} from '@/lib/data-admin';
import type { Coupon } from '@/lib/types';

// Helper type for Server Action responses
export interface CouponActionResult {
  success: boolean;
  message?: string;
  error?: string | { [key: string]: string[] };
  coupon?: Coupon | null;
}

// Utility to convert FormData from CouponForm to a suitable object
const processCouponFormData = (formData: FormData): Record<string, any> => {
  const data: { [key: string]: any } = {};
  formData.forEach((value, key) => {
    // expiryDate will be a string like "YYYY-MM-DD" or ""
    // discount, code, description, store, applyUrl are strings
    data[key] = value;
  });
  // No complex type conversion needed here as schema expects strings,
  // and data-admin functions handle date string to Timestamp.
  return data;
};

export async function addCouponAction(
  prevState: CouponActionResult | undefined,
  formData: FormData
): Promise<CouponActionResult> {
  // Note: Authentication/Authorization should be enforced within data-admin functions.

  const rawData = processCouponFormData(formData);
  const validatedFields = CouponFormSchema.safeParse(rawData);

  if (!validatedFields.success) {
    console.error("Validation Error (Add Coupon):", validatedFields.error.flatten().fieldErrors);
    return {
      success: false,
      error: validatedFields.error.flatten().fieldErrors,
      message: "Erro de validação. Verifique os campos do cupom.",
    };
  }

  try {
    // addCoupon from data-admin.ts handles `createdAt`, `updatedAt`, and `expiryDate` conversion.
    const newCoupon = await addCoupon(validatedFields.data as Omit<Coupon, 'id' | 'createdAt' | 'updatedAt'>); // Type assertion

    revalidatePath('/admin/coupons');
    revalidatePath('/coupons'); // Public listing page, if any

    return {
      success: true,
      message: 'Cupom adicionado com sucesso!',
      coupon: newCoupon,
    };
  } catch (e: any) {
    console.error("Error in addCouponAction:", e);
    return {
      success: false,
      message: `Falha ao adicionar cupom: ${e.message || 'Erro desconhecido do servidor.'}`,
      error: e.message || 'Erro desconhecido do servidor.',
    };
  }
}

export async function updateCouponAction(
  couponId: string,
  prevState: CouponActionResult | undefined,
  formData: FormData
): Promise<CouponActionResult> {
  if (!couponId) {
    return { success: false, message: "ID do cupom não fornecido para atualização." };
  }

  const rawData = processCouponFormData(formData);
  const validatedFields = CouponFormSchema.safeParse(rawData);

  if (!validatedFields.success) {
    console.error("Validation Error (Update Coupon):", validatedFields.error.flatten().fieldErrors);
    return {
      success: false,
      error: validatedFields.error.flatten().fieldErrors,
      message: "Erro de validação. Verifique os campos do cupom.",
    };
  }

  try {
    // updateCoupon from data-admin.ts handles `updatedAt` and `expiryDate` conversion.
    const updatedData = validatedFields.data;
    if (updatedData.expiryDate === '') { // data-admin expects null for empty date
        (updatedData as any).expiryDate = null;
    }

    const updatedCoupon = await updateCoupon(couponId, updatedData as Partial<Omit<Coupon, 'id'>>); // Type assertion

    if (!updatedCoupon) {
        throw new Error("Falha ao atualizar o cupom no servidor.");
    }

    revalidatePath('/admin/coupons');
    revalidatePath(`/admin/coupons/${couponId}/edit`);
    revalidatePath('/coupons'); // Public listing

    return {
      success: true,
      message: 'Cupom atualizado com sucesso!',
      coupon: updatedCoupon,
    };
  } catch (e: any) {
    console.error("Error in updateCouponAction:", e);
    return {
      success: false,
      message: `Falha ao atualizar cupom: ${e.message || 'Erro desconhecido do servidor.'}`,
      error: e.message || 'Erro desconhecido do servidor.',
    };
  }
}

export async function deleteCouponAction(
  couponId: string,
): Promise<Omit<CouponActionResult, 'coupon'>> {
   if (!couponId) {
    return { success: false, message: "ID do cupom não fornecido para exclusão." };
  }

  // Note: Authentication/Authorization should be enforced in data-admin.ts.

  try {
    const success = await deleteCoupon(couponId);
    if (!success) {
        throw new Error("Falha ao excluir o cupom no servidor.");
    }

    revalidatePath('/admin/coupons');
    revalidatePath('/coupons');

    return {
      success: true,
      message: 'Cupom excluído com sucesso!',
    };
  } catch (e: any) {
    console.error("Error in deleteCouponAction:", e);
    return {
      success: false,
      message: `Falha ao excluir cupom: ${e.message || 'Erro desconhecido do servidor.'}`,
      error: e.message || 'Erro desconhecido do servidor.',
    };
  }
}
