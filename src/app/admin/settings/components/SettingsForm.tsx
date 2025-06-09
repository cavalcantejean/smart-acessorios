
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
import { Loader2, Save, Upload, Image as ImageIcon, Settings2 } from "lucide-react";
import { useActionState, useEffect, startTransition, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import type { SettingsActionResult } from "../actions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getBaseSocialLinkSettings } from "@/lib/data"; 
import type { SettingsFormDataForClient } from "../page"; // Use updated type from page
import Image from "next/image"; 

interface SettingsFormProps {
  formAction: (prevState: SettingsActionResult | null, formData: FormData) => Promise<SettingsActionResult>;
  initialData: SettingsFormDataForClient;
}

const initialState: SettingsActionResult = { success: false };

const processImageFile = (file: File, maxWidth: number = 64, maxHeight: number = 64, quality: number = 0.8, type: 'image/png' | 'image/jpeg' = 'image/png'): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = document.createElement('img');
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let { width, height } = img;

        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return reject(new Error('Could not get canvas context'));
        }
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL(type, quality)); 
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

  const [siteLogoPreview, setSiteLogoPreview] = useState<string | null>(initialData.siteLogoUrl || null);
  const [siteFaviconPreview, setSiteFaviconPreview] = useState<string | null>(initialData.siteFaviconUrl || null);
  const [isProcessingLogo, setIsProcessingLogo] = useState(false);
  const [isProcessingFavicon, setIsProcessingFavicon] = useState(false);

  const [imagePreviews, setImagePreviews] = useState<Record<string, string | null>>(
    initialData.socialLinks.reduce((acc, link) => {
      acc[link.platform] = link.customImageUrl || null;
      return acc;
    }, {} as Record<string, string | null>)
  );
  const [isProcessingSocialImage, setIsProcessingSocialImage] = useState<Record<string, boolean>>({});

  const baseSocialLinksWithIcons = getBaseSocialLinkSettings();

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(SettingsFormSchema),
    defaultValues: {
      siteTitle: initialData.siteTitle,
      siteDescription: initialData.siteDescription,
      siteLogoUrl: initialData.siteLogoUrl || '',
      siteFaviconUrl: initialData.siteFaviconUrl || '',
      socialLinks: initialData.socialLinks.map(sl => ({
        platform: sl.platform,
        label: sl.label,
        url: sl.url || '',
        customImageUrl: sl.customImageUrl || '',
      })),
    },
  });

  const { fields: socialLinkFields, update: updateSocialLinkField } = useFieldArray({
    control: form.control,
    name: "socialLinks",
  });

  useEffect(() => {
    if (state?.message) {
      if (state.success) {
        toast({ title: "Sucesso!", description: state.message });
        if (state.updatedSettings) {
          const newSocialPreviews: Record<string, string | null> = {};
          const formSocialLinks = state.updatedSettings.socialLinks.map(sl => {
            newSocialPreviews[sl.platform] = sl.customImageUrl || null;
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
            siteLogoUrl: state.updatedSettings.siteLogoUrl || '',
            siteFaviconUrl: state.updatedSettings.siteFaviconUrl || '',
            socialLinks: formSocialLinks,
          });
          setImagePreviews(newSocialPreviews);
          setSiteLogoPreview(state.updatedSettings.siteLogoUrl || null);
          setSiteFaviconPreview(state.updatedSettings.siteFaviconUrl || null);
        }
      } else {
        toast({
          title: "Erro",
          description: state.error || state.message || "Falha ao salvar configurações.",
          variant: "destructive",
        });
        state.errors?.forEach(issue => {
          const path = issue.path.join('.') as keyof SettingsFormValues | `socialLinks.${number}.url` | `socialLinks.${number}.customImageUrl` | 'siteLogoUrl' | 'siteFaviconUrl';
          form.setError(path as any, {
            type: "server",
            message: issue.message,
          });
        });
      }
    }
  }, [state, toast, form]);

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
    setImagePreviewState: React.Dispatch<React.SetStateAction<string | null>>,
    setProcessingState: React.Dispatch<React.SetStateAction<boolean>>,
    formFieldName: "siteLogoUrl" | "siteFaviconUrl",
    maxWidth: number,
    maxHeight: number,
    imageType: 'image/png' | 'image/jpeg' = 'image/png' 
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      setProcessingState(true);
      try {
        const compressedDataUrl = await processImageFile(file, maxWidth, maxHeight, 0.8, imageType);
        setImagePreviewState(compressedDataUrl);
        form.setValue(formFieldName, compressedDataUrl, { shouldValidate: true });
        toast({ title: "Imagem Carregada", description: `Pré-visualização de ${formFieldName === 'siteLogoUrl' ? 'Logo' : 'Favicon'} atualizada.` });
      } catch (error) {
        console.error("Error processing image:", error);
        toast({ title: "Erro de Imagem", description: `Falha ao processar ${formFieldName === 'siteLogoUrl' ? 'Logo' : 'Favicon'}.`, variant: "destructive" });
        setImagePreviewState(initialData[formFieldName] || null);
      } finally {
        setProcessingState(false);
      }
    }
  };

  const handleSocialImageUpload = async (event: React.ChangeEvent<HTMLInputElement>, index: number, platform: string) => {
    const file = event.target.files?.[0];
    if (file) {
      setIsProcessingSocialImage(prev => ({ ...prev, [platform]: true }));
      try {
        const compressedDataUrl = await processImageFile(file, 64, 64, 0.8, 'image/png');
        setImagePreviews(prev => ({ ...prev, [platform]: compressedDataUrl }));
        const currentLink = socialLinkFields[index];
        updateSocialLinkField(index, { ...currentLink, customImageUrl: compressedDataUrl });
        form.setValue(`socialLinks.${index}.customImageUrl`, compressedDataUrl, { shouldValidate: true });
        toast({ title: "Imagem Carregada", description: `Ícone para ${platform} atualizado.` });
      } catch (error) {
        console.error("Error processing image:", error);
        toast({ title: "Erro de Imagem", description: `Falha ao processar imagem para ${platform}.`, variant: "destructive" });
        setImagePreviews(prev => ({ ...prev, [platform]: form.getValues(`socialLinks.${index}.customImageUrl`) || null }));
      } finally {
        setIsProcessingSocialImage(prev => ({ ...prev, [platform]: false }));
      }
    }
  };

  const onSubmit = (data: SettingsFormValues) => {
    const formData = new FormData();
    formData.append('siteTitle', data.siteTitle);
    formData.append('siteDescription', data.siteDescription);
    formData.append('siteLogoUrl', data.siteLogoUrl || '');
    formData.append('siteFaviconUrl', data.siteFaviconUrl || '');

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
            <CardTitle className="flex items-center gap-2"><Settings2 className="h-5 w-5"/>Configurações Gerais do Site</CardTitle>
            <CardDescription>Ajuste o título, a descrição, o logo e o favicon do seu site.</CardDescription>
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
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              <FormField
                control={form.control}
                name="siteLogoUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Logo do Site (PNG, JPG, SVG)</FormLabel>
                    <FormControl>
                       <Input 
                        type="file" 
                        accept="image/png, image/jpeg, image/svg+xml" 
                        className="cursor-pointer"
                        onChange={(e) => handleImageUpload(e, setSiteLogoPreview, setIsProcessingLogo, "siteLogoUrl", 240, 60, 'image/png')}
                        disabled={isProcessingLogo}
                       />
                    </FormControl>
                     <input type="hidden" {...form.register("siteLogoUrl")} />
                    {isProcessingLogo && <p className="text-xs text-muted-foreground flex items-center"><Loader2 className="mr-1 h-3 w-3 animate-spin"/> Processando logo...</p>}
                    <FormDescription>Envie a imagem do logo. Recomendado: fundo transparente (PNG), máx 240x60px.</FormDescription>
                    <FormMessage />
                    {siteLogoPreview && (
                      <div className="mt-2 p-2 border rounded-md inline-block bg-muted">
                        <Image src={siteLogoPreview} alt="Pré-visualização do Logo" width={120} height={30} style={{objectFit: "contain", maxHeight: "30px"}}/>
                      </div>
                    )}
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="siteFaviconUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Favicon do Site (PNG, ICO)</FormLabel>
                    <FormControl>
                       <Input 
                        type="file" 
                        accept="image/png, image/x-icon, image/vnd.microsoft.icon" 
                        className="cursor-pointer"
                        onChange={(e) => handleImageUpload(e, setSiteFaviconPreview, setIsProcessingFavicon, "siteFaviconUrl", 64, 64, 'image/png')}
                        disabled={isProcessingFavicon}
                        />
                    </FormControl>
                    <input type="hidden" {...form.register("siteFaviconUrl")} />
                    {isProcessingFavicon && <p className="text-xs text-muted-foreground flex items-center"><Loader2 className="mr-1 h-3 w-3 animate-spin"/> Processando favicon...</p>}
                    <FormDescription>Envie a imagem do favicon. Recomendado: PNG quadrado (32x32px ou 64x64px).</FormDescription>
                    <FormMessage />
                     {siteFaviconPreview && (
                      <div className="mt-2 p-1 border rounded-md inline-block bg-muted">
                        <Image src={siteFaviconPreview} alt="Pré-visualização do Favicon" width={32} height={32} />
                      </div>
                    )}
                  </FormItem>
                )}
              />
            </div>


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
                    render={() => ( 
                      <FormItem>
                        <FormLabel>Imagem Customizada do Ícone (Opcional)</FormLabel>
                        <FormControl>
                          <Input
                            type="file"
                            accept="image/png, image/jpeg, image/svg+xml, image/gif"
                            className="cursor-pointer"
                            onChange={(e) => handleSocialImageUpload(e, index, formField.platform)}
                            disabled={isProcessingSocialImage[formField.platform]}
                          />
                        </FormControl>
                        {isProcessingSocialImage[formField.platform] && <p className="text-xs text-muted-foreground flex items-center"><Loader2 className="mr-1 h-3 w-3 animate-spin"/> Processando...</p>}
                        <FormDescription>Envie uma imagem (PNG, JPG, SVG, GIF - max 64x64px recomendado). Se não enviar, o ícone padrão será usado.</FormDescription>
                        <input type="hidden" {...form.register(`socialLinks.${index}.customImageUrl`)} />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <input type="hidden" {...form.register(`socialLinks.${index}.platform`)} value={formField.platform} />
                  <input type="hidden" {...form.register(`socialLinks.${index}.label`)} value={formField.label} />
                </div>
              );
            })}
          </CardContent>
        </Card>

        <SubmitButton text="Salvar Configurações" pending={form.formState.isSubmitting || pending || isProcessingLogo || isProcessingFavicon || Object.values(isProcessingSocialImage).some(v => v)} />
         {state && !state.success && state.error && Object.keys(form.formState.errors).length === 0 && (
           <p className="text-sm font-medium text-destructive">{state.error}</p>
        )}
      </form>
    </Form>
  );
}
