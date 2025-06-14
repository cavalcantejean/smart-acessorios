
"use server";

import { z } from 'zod';
import { CouponFormSchema } from '@/lib/schemas/coupon-schema';
import { addCoupon, updateCoupon, deleteCoupon as deleteCouponData } from '@/lib/data-admin';
import type { Coupon } from '@/lib/types';
import { revalidatePath } from 'next/cache';
import { adminDb } from '@/lib/firebase-admin';
// AdminTimestamp type is not explicitly needed here if we use duck-typing for .toDate()

interface ClientSafeCoupon extends Omit<Coupon, 'createdAt' | 'updatedAt' | 'expiryDate'> {
  id: string;
  code: string;
  description: string;
  discount: string;
  expiryDate?: string; // YYYY-MM-DD or ISO string
  store?: string;
  applyUrl?: string;
  createdAt?: string; // ISO string
  updatedAt?: string; // ISO string
}

export interface CouponActionResult {
  success: boolean;
  message?: string;
  error?: string;
  errors?: z.ZodIssue[];
  coupon?: ClientSafeCoupon;
}

// Changed couponData type to `any` to handle raw data from adminDb
function serializeCouponForClient(couponData: any): ClientSafeCoupon | undefined {
  if (!couponData) return undefined;

  const createdAtTimestamp = couponData.createdAt;
  const updatedAtTimestamp = couponData.updatedAt;
  const expiryDateTimestamp = couponData.expiryDate;

  return {
    id: couponData.id,
    code: couponData.code,
    description: couponData.description,
    discount: couponData.discount,
    expiryDate: expiryDateTimestamp?.toDate?.().toISOString().split('T')[0], // Format as YYYY-MM-DD
    store: couponData.store || "",
    applyUrl: couponData.applyUrl || "",
    createdAt: createdAtTimestamp?.toDate?.().toISOString(),
    updatedAt: updatedAtTimestamp?.toDate?.().toISOString(),
  };
}


export async function createCouponAction(
  prevState: CouponActionResult | null,
  formData: FormData
): Promise<CouponActionResult> {
  if (!adminDb) {
    console.error("[Action:createCoupon] Firebase Admin SDK (adminDb) is not initialized.");
    return { success: false, error: "Erro crítico na configuração do servidor (Admin SDK)." };
  }
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
    };
    // addCoupon in data-admin.ts returns data with AdminTimestamps
    const tempCouponDataFromAdd = await addCoupon(couponInputData as any);

    // Re-fetch to ensure we have the final data structure from DB with AdminTimestamps
    const docRef = adminDb.collection('cupons').doc(tempCouponDataFromAdd.id);
    const newDocSnap = await docRef.get();
    const createdCouponDbData = newDocSnap.data();

    if (createdCouponDbData) {
        const couponToSerialize = { id: newDocSnap.id, ...createdCouponDbData };
        // couponToSerialize has AdminTimestamps here

        revalidatePath('/admin/coupons');
        revalidatePath('/coupons');
        revalidatePath('/');
        return {
            success: true,
            message: `Cupom "${couponToSerialize.code}" criado com sucesso!`,
            coupon: serializeCouponForClient(couponToSerialize)
        };
    } else {
        console.error("[Action:createCoupon] Failed to fetch newly created coupon document.");
        return { success: false, error: "Falha ao buscar o cupom recém-criado." };
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
  if (!adminDb) {
    console.error("[Action:updateCoupon] Firebase Admin SDK (adminDb) is not initialized.");
    return { success: false, error: "Erro crítico na configuração do servidor (Admin SDK)." };
  }
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
    };
    // updateCoupon in data-admin.ts should return data with AdminTimestamps
    const updatedCouponFromDbAdmin = await updateCoupon(couponId, couponInputData as any);
    if (updatedCouponFromDbAdmin) {
      // updatedCouponFromDbAdmin has AdminTimestamps
      revalidatePath('/admin/coupons');
      revalidatePath(`/admin/coupons/${couponId}/edit`);
      revalidatePath('/coupons');
      revalidatePath('/');
      return {
        success: true,
        message: `Cupom "${updatedCouponFromDbAdmin.code}" atualizado com sucesso!`,
        coupon: serializeCouponForClient(updatedCouponFromDbAdmin)
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
  if (!adminDb) {
    console.error("[Action:deleteCoupon] Firebase Admin SDK (adminDb) is not initialized.");
    return { success: false, error: "Erro crítico na configuração do servidor (Admin SDK)." };
  }
  const couponId = formData.get('couponId') as string;

  if (!couponId) {
    return { success: false, error: "ID do cupom ausente." };
  }

  try {
    const deleted = await deleteCouponData(couponId);
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
    
    