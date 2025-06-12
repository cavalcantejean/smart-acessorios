
"use server";

import { z } from 'zod';
import { CouponFormSchema } from '@/lib/schemas/coupon-schema';
import { addCoupon, updateCoupon, deleteCoupon as deleteCouponData } from '@/lib/data-admin'; // Importar de data-admin.ts
import type { Coupon } from '@/lib/types';
import { revalidatePath } from 'next/cache';
import { adminDb } from '@/lib/firebase-admin';
import type { Timestamp as AdminTimestamp } from 'firebase-admin/firestore';

// Helper type for client-safe coupon, mirroring Coupon type but with string dates
interface ClientSafeCoupon extends Omit<Coupon, 'createdAt' | 'updatedAt' | 'expiryDate'> {
  id: string; // Ensure id is present
  code: string;
  description: string;
  discount: string;
  expiryDate?: string; // YYYY-MM-DD or ISO string
  store?: string;
  applyUrl?: string;
  createdAt?: string; // ISO string
  updatedAt?: string; // ISO string
}

// Update CouponActionResult to use this type
export interface CouponActionResult {
  success: boolean;
  message?: string;
  error?: string;
  errors?: z.ZodIssue[];
  coupon?: ClientSafeCoupon; // Use the client-safe type
}

// Helper function to serialize a coupon for client
function serializeCouponForClient(coupon: Coupon | null | undefined): ClientSafeCoupon | undefined {
  if (!coupon) return undefined;

  const adminCreatedAt = coupon.createdAt as unknown as AdminTimestamp | undefined;
  const adminUpdatedAt = coupon.updatedAt as unknown as AdminTimestamp | undefined;
  const adminExpiryDate = coupon.expiryDate as unknown as AdminTimestamp | undefined;

  return {
    id: coupon.id,
    code: coupon.code,
    description: coupon.description,
    discount: coupon.discount,
    expiryDate: adminExpiryDate?.toDate?.().toISOString().split('T')[0], // Format as YYYY-MM-DD
    store: coupon.store || "",
    applyUrl: coupon.applyUrl || "",
    createdAt: adminCreatedAt?.toDate?.().toISOString(),
    updatedAt: adminUpdatedAt?.toDate?.().toISOString(),
  };
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
    };
    // addCoupon returns data with FieldValue for timestamps initially
    const tempCouponData = await addCoupon(couponInputData as any); // Usa addCoupon de data-admin.ts

    // Fetch the actual document to get resolved Timestamps
    const docRef = adminDb.collection('cupons').doc(tempCouponData.id);
    const newDocSnap = await docRef.get();
    const createdCouponDb = newDocSnap.data();

    if (createdCouponDb) {
        const createdCoupon = { id: newDocSnap.id, ...createdCouponDb } as Coupon; // Cast to base type

        revalidatePath('/admin/coupons');
        revalidatePath('/coupons');
        revalidatePath('/');
        return {
            success: true,
            message: `Cupom "${createdCoupon.code}" criado com sucesso!`,
            coupon: serializeCouponForClient(createdCoupon)
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
    const updatedCouponFromDb = await updateCoupon(couponId, couponInputData as any); // Usa updateCoupon de data-admin.ts
    if (updatedCouponFromDb) {
      revalidatePath('/admin/coupons');
      revalidatePath(`/admin/coupons/${couponId}/edit`);
      revalidatePath('/coupons');
      revalidatePath('/');
      return {
        success: true,
        message: `Cupom "${updatedCouponFromDb.code}" atualizado com sucesso!`,
        coupon: serializeCouponForClient(updatedCouponFromDb)
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
    const deleted = await deleteCouponData(couponId); // Usa deleteCouponData de data-admin.ts
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
    
