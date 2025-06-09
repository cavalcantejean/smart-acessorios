
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
import { Loader2, Save } from "lucide-react";
import { useActionState, useEffect, startTransition, useRef } from "react";
import { useFormStatus } from "react-dom";
import type { SettingsActionResult } from "../actions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getBaseSocialLinkSettings } from "@/lib/data"; // Import to get IconComponents
import type { SettingsFormDataForClient } from "../page"; // Import the specific type for initialData

// The initialData prop now uses SettingsFormDataForClient which doesn't include IconComponent
interface SettingsFormProps {
  formAction: (prevState: SettingsActionResult | null, formData: FormData) => Promise<SettingsActionResult>;
  initialData: SettingsFormDataForClient;
}

const initialState: SettingsActionResult = { success: false };

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

  // Full base settings including IconComponent, fetched on client
  const baseSocialLinksWithIcons = getBaseSocialLinkSettings();

  const initialFormValues: SettingsFormValues = {
    siteTitle: initialData.siteTitle,
    siteDescription: initialData.siteDescription,
    socialLinks: initialData.socialLinks.map(sl => ({
      platform: sl.platform,
      label: sl.label,
      url: sl.url,
      // placeholderUrl is part of baseSocialLinksWithIcons, not directly in form values but used for rendering
    })),
  };

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(SettingsFormSchema),
    defaultValues: initialFormValues,
  });

  const { fields: socialLinkFields } = useFieldArray({
    control: form.control,
    name: "socialLinks",
  });


  useEffect(() => {
    if (state?.message) {
      if (state.success) {
        toast({ title: "Sucesso!", description: state.message });
        if (state.updatedSettings) {
          form.reset({
            siteTitle: state.updatedSettings.siteTitle,
            siteDescription: state.updatedSettings.siteDescription,
            socialLinks: state.updatedSettings.socialLinks.map(sl => ({
              platform: sl.platform,
              label: sl.label,
              url: sl.url,
            })),
          });
        }
      } else {
        toast({
          title: "Erro",
          description: state.error || state.message || "Falha ao salvar configurações.",
          variant: "destructive",
        });
        state.errors?.forEach(issue => {
          const path = issue.path.join('.') as keyof SettingsFormValues | `socialLinks.${number}.url`;
          form.setError(path as any, { 
            type: "server",
            message: issue.message,
          });
        });
      }
    }
  }, [state, toast, form]);
  
  const onSubmit = (data: SettingsFormValues) => {
    const formData = new FormData();
    formData.append('siteTitle', data.siteTitle);
    formData.append('siteDescription', data.siteDescription);
    data.socialLinks.forEach((link, index) => {
      formData.append(`socialLinks[${index}].platform`, link.platform);
      formData.append(`socialLinks[${index}].label`, link.label); // label is now from form state
      formData.append(`socialLinks[${index}].url`, link.url || '');
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
            <CardTitle>Links de Redes Sociais</CardTitle>
            <CardDescription>Gerencie os links para suas redes sociais que aparecem no rodapé. Deixe a URL em branco para ocultar um ícone.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {socialLinkFields.map((formField, index) => {
              // Find the full base link data (which includes IconComponent) using platform from formField
              const baseLinkData = baseSocialLinksWithIcons.find(b => b.platform === formField.platform);
              const Icon = baseLinkData?.IconComponent;

              return (
                <FormField
                  key={formField.id} 
                  control={form.control}
                  name={`socialLinks.${index}.url`}
                  render={({ field: urlField }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        {Icon && <Icon className="h-5 w-5 text-muted-foreground" />}
                        {/* Use label from form's defaultValues (derived from initialData) or baseLinkData as fallback */}
                        {form.getValues(`socialLinks.${index}.label`) || baseLinkData?.label || formField.platform}
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="url"
                          placeholder={baseLinkData?.placeholderUrl || `https://exemplo.com/${formField.platform.toLowerCase()}`}
                          {...urlField}
                          value={urlField.value || ''}
                        />
                      </FormControl>
                      <input type="hidden" {...form.register(`socialLinks.${index}.platform`)} value={formField.platform} />
                      <input type="hidden" {...form.register(`socialLinks.${index}.label`)} value={form.getValues(`socialLinks.${index}.label`) || baseLinkData?.label || formField.platform} />
                      <FormMessage />
                    </FormItem>
                  )}
                />
              );
            })}
          </CardContent>
        </Card>

        <SubmitButton text="Salvar Configurações" pending={form.formState.isSubmitting || pending} />
         {state && !state.success && state.error && Object.keys(form.formState.errors).length === 0 && (
           <p className="text-sm font-medium text-destructive">{state.error}</p>
        )}
      </form>
    </Form>
  );
}
