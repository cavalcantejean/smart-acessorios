
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
import { SettingsFormSchema, type SettingsFormValues } from "@/lib/schemas/settings-schema";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Save, Upload, Image as ImageIcon } from "lucide-react";
import { useActionState, useEffect, startTransition, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import type { SettingsActionResult } from "../actions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getBaseSocialLinkSettings } from "@/lib/data"; // Used for fallback IconComponent
import type { SettingsFormDataForClient, SocialLinkFormData } from "../page";
import Image from "next/image"; // Next.js Image component

interface SettingsFormProps {
  formAction: (prevState: SettingsActionResult | null, formData: FormData) => Promise<SettingsActionResult>;
  initialData: SettingsFormDataForClient;
}

const initialState: SettingsActionResult = { success: false };

// Helper function to resize and compress image to JPEG data URI
const processImageFile = (file: File, maxWidth: number = 64, maxHeight: number = 64, quality: number = 0.8): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = document.createElement('img');
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let { width, height } = img;

        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width *= ratio;
          height *= ratio;
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return reject(new Error('Could not get canvas context'));
        }
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/png', quality)); // Use PNG for icons to preserve transparency
      };
      img.onerror = reject;
      if (event.target?.result) {
        img.src = event.target.result as string;
      } else {
        reject(new Error('Failed to read image file.'));
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};


function SubmitButton({ text, pending }: { text: string; pending: boolean }) {
  return (
    <Button type="submit" className="w-full sm:w-auto" disabled={pending}>
      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
      {text}
    </Button>
  );
}

export default function SettingsForm({ formAction, initialData }: SettingsFormProps) {
  const [state, dispatch] = useActionState(formAction, initialState);
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const { pending } = useFormStatus();

  // State for image previews, one for each social link
  const [imagePreviews, setImagePreviews] = useState<Record<string, string | null>>(
    initialData.socialLinks.reduce((acc, link) => {
      acc[link.platform] = link.customImageUrl || null;
      return acc;
    }, {} as Record<string, string | null>)
  );
  const [isProcessingImage, setIsProcessingImage] = useState<Record<string, boolean>>({});

  // Full base settings including IconComponent, fetched on client for fallback display
  const baseSocialLinksWithIcons = getBaseSocialLinkSettings();

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(SettingsFormSchema),
    defaultValues: {
      siteTitle: initialData.siteTitle,
      siteDescription: initialData.siteDescription,
      socialLinks: initialData.socialLinks.map(sl => ({
        platform: sl.platform,
        label: sl.label,
        url: sl.url || '',
        customImageUrl: sl.customImageUrl || '',
      })),
    },
  });

  const { fields: socialLinkFields, update } = useFieldArray({
    control: form.control,
    name: "socialLinks",
  });

  useEffect(() => {
    if (state?.message) {
      if (state.success) {
        toast({ title: "Sucesso!", description: state.message });
        if (state.updatedSettings) {
          const newPreviews: Record<string, string | null> = {};
          const formSocialLinks = state.updatedSettings.socialLinks.map(sl => {
            newPreviews[sl.platform] = sl.customImageUrl || null;
            return {
              platform: sl.platform,
              label: sl.label,
              url: sl.url || '',
              customImageUrl: sl.customImageUrl || '',
            };
          });
          form.reset({
            siteTitle: state.updatedSettings.siteTitle,
            siteDescription: state.updatedSettings.siteDescription,
            socialLinks: formSocialLinks,
          });
          setImagePreviews(newPreviews);
        }
      } else {
        toast({
          title: "Erro",
          description: state.error || state.message || "Falha ao salvar configurações.",
          variant: "destructive",
        });
        state.errors?.forEach(issue => {
          const path = issue.path.join('.') as keyof SettingsFormValues | `socialLinks.${number}.url` | `socialLinks.${number}.customImageUrl`;
          form.setError(path as any, {
            type: "server",
            message: issue.message,
          });
        });
      }
    }
  }, [state, toast, form]);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>, index: number, platform: string) => {
    const file = event.target.files?.[0];
    if (file) {
      setIsProcessingImage(prev => ({ ...prev, [platform]: true }));
      try {
        const compressedDataUrl = await processImageFile(file);
        setImagePreviews(prev => ({ ...prev, [platform]: compressedDataUrl }));
        // Use `update` from `useFieldArray` to set value correctly for the specific item
        const currentLink = socialLinkFields[index];
        update(index, { ...currentLink, customImageUrl: compressedDataUrl });
        // Also use form.setValue if direct field update is more reliable for react-hook-form state
        form.setValue(`socialLinks.${index}.customImageUrl`, compressedDataUrl, { shouldValidate: true });

        toast({ title: "Imagem Carregada", description: `Ícone para ${platform} atualizado.` });
      } catch (error) {
        console.error("Error processing image:", error);
        toast({ title: "Erro de Imagem", description: `Falha ao processar imagem para ${platform}.`, variant: "destructive" });
        // Revert to previous preview if available
        setImagePreviews(prev => ({ ...prev, [platform]: form.getValues(`socialLinks.${index}.customImageUrl`) || null }));
      } finally {
        setIsProcessingImage(prev => ({ ...prev, [platform]: false }));
      }
    }
  };

  const onSubmit = (data: SettingsFormValues) => {
    const formData = new FormData();
    formData.append('siteTitle', data.siteTitle);
    formData.append('siteDescription', data.siteDescription);
    data.socialLinks.forEach((link, index) => {
      formData.append(`socialLinks[${index}].platform`, link.platform);
      formData.append(`socialLinks[${index}].label`, link.label);
      formData.append(`socialLinks[${index}].url`, link.url || '');
      formData.append(`socialLinks[${index}].customImageUrl`, link.customImageUrl || '');
    });
    startTransition(() => {
      dispatch(formData);
    });
  };

  return (
    <Form {...form}>
      <form
        ref={formRef}
        action={dispatch}
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-8"
      >
        <Card>
          <CardHeader>
            <CardTitle>Configurações Gerais do Site</CardTitle>
            <CardDescription>Ajuste o título e a descrição padrão do seu site.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="siteTitle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título do Site</FormLabel>
                  <FormControl>
                    <Input placeholder="Nome do Seu Site Incrível" {...field} />
                  </FormControl>
                  <FormDescription>Usado nas abas do navegador e resultados de busca.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="siteDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição do Site</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Descreva brevemente sobre o que é o seu site." {...field} rows={3} />
                  </FormControl>
                  <FormDescription>Um breve resumo para SEO e compartilhamento social.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Links e Ícones de Redes Sociais</CardTitle>
            <CardDescription>Gerencie os links para suas redes sociais e personalize os ícones. Deixe a URL em branco para ocultar um link. Ícones customizados substituirão os padrões.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            {socialLinkFields.map((formField, index) => {
              const baseLinkData = baseSocialLinksWithIcons.find(b => b.platform === formField.platform);
              const FallbackIcon = baseLinkData?.IconComponent;
              const currentCustomImageUrl = imagePreviews[formField.platform];

              return (
                <div key={formField.id} className="space-y-3 p-4 border rounded-md">
                  <div className="flex items-center gap-3 mb-2">
                    {currentCustomImageUrl ? (
                      <Image src={currentCustomImageUrl} alt={`${formField.label} icon`} width={24} height={24} className="rounded"/>
                    ) : FallbackIcon ? (
                      <FallbackIcon className="h-6 w-6 text-muted-foreground" />
                    ) : (
                      <ImageIcon className="h-6 w-6 text-muted-foreground" />
                    )}
                    <h4 className="text-md font-semibold">{formField.label}</h4>
                  </div>

                  <FormField
                    control={form.control}
                    name={`socialLinks.${index}.url`}
                    render={({ field: urlField }) => (
                      <FormItem>
                        <FormLabel>URL</FormLabel>
                        <FormControl>
                          <Input
                            type="url"
                            placeholder={baseLinkData?.placeholderUrl || `https://exemplo.com/${formField.platform.toLowerCase()}`}
                            {...urlField}
                            value={urlField.value || ''}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`socialLinks.${index}.customImageUrl`}
                    render={({ field: customImageField }) => ( // field is for the hidden input storing data URI
                      <FormItem>
                        <FormLabel>Imagem Customizada do Ícone (Opcional)</FormLabel>
                        <FormControl>
                          <Input
                            type="file"
                            accept="image/png, image/jpeg, image/svg+xml, image/gif"
                            className="cursor-pointer"
                            onChange={(e) => handleImageUpload(e, index, formField.platform)}
                            disabled={isProcessingImage[formField.platform]}
                          />
                        </FormControl>
                        {isProcessingImage[formField.platform] && <p className="text-xs text-muted-foreground flex items-center"><Loader2 className="mr-1 h-3 w-3 animate-spin"/> Processando...</p>}
                        <FormDescription>Envie uma imagem (PNG, JPG, SVG, GIF - max 64x64px recomendado). Se não enviar, o ícone padrão será usado.</FormDescription>
                        {/* Hidden input to store the actual customImageUrl (data URI) value */}
                        <input type="hidden" {...form.register(`socialLinks.${index}.customImageUrl`)} />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {/* Hidden inputs for platform and label to ensure they are submitted */}
                  <input type="hidden" {...form.register(`socialLinks.${index}.platform`)} value={formField.platform} />
                  <input type="hidden" {...form.register(`socialLinks.${index}.label`)} value={formField.label} />
                </div>
              );
            })}
          </CardContent>
        </Card>

        <SubmitButton text="Salvar Configurações" pending={form.formState.isSubmitting || pending || Object.values(isProcessingImage).some(v => v)} />
         {state && !state.success && state.error && Object.keys(form.formState.errors).length === 0 && (
           <p className="text-sm font-medium text-destructive">{state.error}</p>
        )}
      </form>
    </Form>
  );
}
