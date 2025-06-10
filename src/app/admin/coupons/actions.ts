
"use server";

import { z } from 'zod';
import { CouponFormSchema, type CouponFormValues } from '@/lib/schemas/coupon-schema';
import { addCoupon, updateCoupon, deleteCoupon as deleteCouponData, getCouponById } from '@/lib/data';
import type { Coupon } from '@/lib/types';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export interface CouponActionResult {
  success: boolean;
  message?: string;
  error?: string; 
  errors?: z.ZodIssue[]; 
  coupon?: Coupon;
}

export async function createCouponAction(
  prevState: CouponActionResult | null,
  formData: FormData
): Promise<CouponActionResult> {
  const rawFormData = Object.fromEntries(formData.entries());
  
  const dataToValidate = {
    ...rawFormData,
    expiryDate: rawFormData.expiryDate || undefined, 
    store: rawFormData.store || undefined,
    applyUrl: rawFormData.applyUrl || undefined,
  };

  const validatedFields = CouponFormSchema.safeParse(dataToValidate);

  if (!validatedFields.success) {
    return {
      success: false,
      message: "Falha na validação. Verifique os campos.",
      errors: validatedFields.error.errors,
      error: "Dados inválidos. Corrija os erros abaixo."
    };
  }

  try {
    const couponInputData = {
      ...validatedFields.data,
      expiryDate: validatedFields.data.expiryDate || undefined,
      store: validatedFields.data.store || undefined,
      applyUrl: validatedFields.data.applyUrl || undefined,
    };

    const newCoupon = addCoupon(couponInputData);
    if (newCoupon) {
      revalidatePath('/admin/coupons');
      revalidatePath('/coupons'); 
      revalidatePath('/'); 
      return { 
        success: true, 
        message: `Cupom "${newCoupon.code}" criado com sucesso!`, 
        coupon: newCoupon 
      };
    } else {
      return { success: false, error: "Falha ao criar o cupom no sistema." };
    }
  } catch (error) {
    console.error("Error in createCouponAction:", error);
    return { success: false, error: "Erro no servidor ao tentar criar o cupom." };
  }
}

export async function updateCouponAction(
  couponId: string,
  prevState: CouponActionResult | null,
  formData: FormData
): Promise<CouponActionResult> {
  const rawFormData = Object.fromEntries(formData.entries());
  const dataToValidate = {
    ...rawFormData,
    expiryDate: rawFormData.expiryDate || undefined,
    store: rawFormData.store || undefined,
    applyUrl: rawFormData.applyUrl || undefined,
  };
  
  const validatedFields = CouponFormSchema.safeParse(dataToValidate);

  if (!validatedFields.success) {
    return {
      success: false,
      message: "Falha na validação. Verifique os campos.",
      errors: validatedFields.error.errors,
      error: "Dados inválidos. Corrija os erros abaixo."
    };
  }

  try {
    const couponInputData = {
      ...validatedFields.data,
      expiryDate: validatedFields.data.expiryDate || undefined,
      store: validatedFields.data.store || undefined,
      applyUrl: validatedFields.data.applyUrl || undefined,
    };

    const updatedCoupon = updateCoupon(couponId, couponInputData);
    if (updatedCoupon) {
      revalidatePath('/admin/coupons');
      revalidatePath(`/admin/coupons/${couponId}/edit`);
      revalidatePath('/coupons');
      revalidatePath('/');
      return { 
        success: true, 
        message: `Cupom "${updatedCoupon.code}" atualizado com sucesso!`, 
        coupon: updatedCoupon 
      };
    } else {
      return { success: false, error: `Falha ao atualizar o cupom. ID ${couponId} não encontrado.` };
    }
  } catch (error) {
    console.error("Error in updateCouponAction:", error);
    return { success: false, error: "Erro no servidor ao tentar atualizar o cupom." };
  }
}

export async function deleteCouponAction(
  prevState: CouponActionResult | null,
  formData: FormData
): Promise<CouponActionResult> {
  const couponId = formData.get('couponId') as string;

  if (!couponId) {
    return { success: false, error: "ID do cupom ausente." };
  }

  try {
    const deleted = deleteCouponData(couponId);
    if (deleted) {
      revalidatePath('/admin/coupons');
      revalidatePath('/coupons');
      revalidatePath('/');
      return { success: true, message: "Cupom excluído com sucesso." };
    } else {
      return { success: false, error: "Falha ao excluir cupom. Não encontrado." };
    }
  } catch (error) {
    console.error("Error in deleteCouponAction:", error);
    return { success: false, error: "Erro no servidor ao excluir cupom." };
  }
}
