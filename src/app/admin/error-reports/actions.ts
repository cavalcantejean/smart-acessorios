
"use server";

import { z } from 'zod';
import { updateErrorReportStatus as updateStatusData, getErrorReportById } from '@/lib/data';
import type { ErrorReport, ErrorReportStatus } from '@/lib/types';
import { revalidatePath } from 'next/cache';

const UpdateErrorStatusSchema = z.object({
  reportId: z.string().min(1, "ID do relatório é obrigatório."),
  newStatus: z.enum(['new', 'seen', 'resolved', 'ignored'], {
    errorMap: () => ({ message: "Status inválido." })
  }),
});

export interface ErrorReportActionResult {
  success: boolean;
  message?: string;
  error?: string;
  updatedReport?: ErrorReport;
}

export async function updateErrorStatusAction(
  prevState: ErrorReportActionResult | null,
  formData: FormData
): Promise<ErrorReportActionResult> {
  const rawFormData = {
    reportId: formData.get('reportId'),
    newStatus: formData.get('newStatus'),
  };

  const validatedFields = UpdateErrorStatusSchema.safeParse(rawFormData);

  if (!validatedFields.success) {
    console.error("Validation failed:", validatedFields.error.flatten().fieldErrors);
    return {
      success: false,
      error: "Dados inválidos para atualização de status: " + validatedFields.error.flatten().fieldErrors.newStatus?.join(', '),
    };
  }

  const { reportId, newStatus } = validatedFields.data;

  try {
    const updatedReport = updateStatusData(reportId, newStatus as ErrorReportStatus);

    if (!updatedReport) {
      return { success: false, error: `Falha ao atualizar status. Relatório de erro ${reportId} não encontrado.` };
    }

    revalidatePath('/admin/error-reports');

    return {
      success: true,
      message: `Status do relatório ${updatedReport.id} atualizado para "${newStatus}".`,
      updatedReport,
    };
  } catch (error) {
    console.error("Error in updateErrorStatusAction:", error);
    return {
      success: false,
      error: "Ocorreu um erro no servidor ao tentar atualizar o status do relatório.",
    };
  }
}
