
"use server";

import { z } from 'zod';
import { SettingsFormSchema, type SettingsFormValues } from '@/lib/schemas/settings-schema';
import { getSiteSettingsAdmin, updateSiteSettingsAdmin } from '@/lib/data-admin'; // Use admin functions
import type { SiteSettings, SocialLinkSetting } from '@/lib/types';
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
    siteLogoUrl: formData.get('siteLogoUrl'),
    siteFaviconUrl: formData.get('siteFaviconUrl'),
    socialLinks: [], // This will be populated based on submitted form data
  };

  // Dynamically build socialLinks array from FormData
  const submittedSocialLinks: Array<Omit<SocialLinkSetting, 'IconComponent' | 'placeholderUrl'>> = [];
  let i = 0;
  while (formData.has(`socialLinks[${i}].platform`)) {
    const platform = formData.get(`socialLinks[${i}].platform`) as string;
    const label = formData.get(`socialLinks[${i}].label`) as string; // Label is submitted from form, though not directly editable by user
    const url = formData.get(`socialLinks[${i}].url`) as string;
    const customImageUrl = formData.get(`socialLinks[${i}].customImageUrl`) as string;
    
    // We only need to store what's editable or essential for re-fetching
    submittedSocialLinks.push({ 
        platform, 
        label, // Keep label to ensure consistency if it's part of the submitted form
        url: url || '', 
        customImageUrl: customImageUrl || '' 
    });
    i++;
  }
  rawFormData.socialLinks = submittedSocialLinks;

  const validatedFields = SettingsFormSchema.safeParse(rawFormData);

  if (!validatedFields.success) {
    console.error("Validation errors in updateSettingsAction:", validatedFields.error.flatten().fieldErrors);
    return {
      success: false,
      message: "Falha na validação. Verifique os campos.",
      errors: validatedFields.error.errors,
      error: "Dados inválidos. Corrija os erros abaixo."
    };
  }

  try {
    // The data sent to updateSiteSettingsAdmin should match SiteSettings type (without IconComponent)
    const settingsToUpdate: SiteSettings = {
        siteTitle: validatedFields.data.siteTitle,
        siteDescription: validatedFields.data.siteDescription,
        siteLogoUrl: validatedFields.data.siteLogoUrl || '',
        siteFaviconUrl: validatedFields.data.siteFaviconUrl || '',
        socialLinks: validatedFields.data.socialLinks.map(sl => ({
            platform: sl.platform,
            label: sl.label, // label comes from validatedFields which should be from default structure
            url: sl.url || '',
            customImageUrl: sl.customImageUrl || '',
            // placeholderUrl is not stored, it's part of the default structure
        })) as Array<Omit<SocialLinkSetting, 'IconComponent' | 'placeholderUrl'>>,
    };
    
    const updatedSettings = await updateSiteSettingsAdmin(settingsToUpdate);

    revalidatePath('/admin/settings');
    revalidatePath('/', 'layout'); // Revalidate the root layout to pick up new metadata/footer settings

    return {
      success: true,
      message: "Configurações do site atualizadas com sucesso!",
      updatedSettings, // This will include the full structure with placeholders merged in getSiteSettingsAdmin
    };
  } catch (error) {
    console.error("Error in updateSettingsAction:", error);
    return { success: false, error: "Erro no servidor ao tentar atualizar as configurações." };
  }
}
