
"use server";

import { z } from 'zod';
import { SettingsFormSchema, type SettingsFormValues } from '@/lib/schemas/settings-schema';
import { getSiteSettings, updateSiteSettings } from '@/lib/data';
import type { SiteSettings } from '@/lib/types';
import { revalidatePath } from 'next/cache';

export interface SettingsActionResult {
  success: boolean;
  message?: string;
  error?: string;
  errors?: z.ZodIssue[];
  updatedSettings?: SiteSettings;
}

export async function updateSettingsAction(
  prevState: SettingsActionResult | null,
  formData: FormData
): Promise<SettingsActionResult> {
  const rawFormData: Record<string, any> = {
    siteTitle: formData.get('siteTitle'),
    siteDescription: formData.get('siteDescription'),
    socialLinks: [],
  };

  // Reconstruct socialLinks array from FormData
  // Assuming social links are submitted like: socialLinks[0].platform, socialLinks[0].label, socialLinks[0].url, etc.
  const baseSocialLinks = getSiteSettings().socialLinks; // Get base structure with IconComponent
  const submittedSocialLinks: Partial<SettingsFormValues['socialLinks'][0]>[] = [];

  baseSocialLinks.forEach((_, index) => {
    const platform = formData.get(`socialLinks[${index}].platform`) as string;
    const label = formData.get(`socialLinks[${index}].label`) as string;
    const url = formData.get(`socialLinks[${index}].url`) as string;
    // Only add if platform exists, as client sends all platforms
    if (platform) {
      submittedSocialLinks.push({ platform, label, url });
    }
  });
  rawFormData.socialLinks = submittedSocialLinks;

  const validatedFields = SettingsFormSchema.safeParse(rawFormData);

  if (!validatedFields.success) {
    console.error("Validation errors:", validatedFields.error.flatten().fieldErrors);
    return {
      success: false,
      message: "Falha na validação. Verifique os campos.",
      errors: validatedFields.error.errors,
      error: "Dados inválidos. Corrija os erros abaixo."
    };
  }

  try {
    const currentSettings = getSiteSettings();
    const updatedSocialLinks = currentSettings.socialLinks.map(currentLink => {
      const submittedLink = validatedFields.data.socialLinks.find(sl => sl.platform === currentLink.platform);
      return {
        ...currentLink, // Keep IconComponent and other base properties
        url: submittedLink?.url || '', // Update URL, default to empty string if not submitted or empty
      };
    });

    const newSettingsData: SiteSettings = {
      siteTitle: validatedFields.data.siteTitle,
      siteDescription: validatedFields.data.siteDescription,
      socialLinks: updatedSocialLinks,
    };
    
    const updatedSettings = updateSiteSettings(newSettingsData);

    revalidatePath('/admin/settings');
    revalidatePath('/'); // Revalidate homepage
    revalidatePath('/layout'); // To attempt revalidating metadata in RootLayout
    // Note: Revalidating layout.tsx directly for metadata changes can be tricky.
    // The best way is usually to revalidate pages that use the layout.

    return {
      success: true,
      message: "Configurações do site atualizadas com sucesso!",
      updatedSettings,
    };
  } catch (error) {
    console.error("Error in updateSettingsAction:", error);
    return { success: false, error: "Erro no servidor ao tentar atualizar as configurações." };
  }
}
