
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { AccessoryFormSchema, type AccessoryFormValues } from "@/lib/schemas/accessory-schema";
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
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Save, Upload, Info } from "lucide-react";
import { useEffect, useState, useRef } from "react";
// import type { Accessory } from "@/lib/types"; // Accessory type not directly used here
// AccessoryActionResult type and useActionState/useFormStatus removed as server actions are disabled for static export
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useAuth } from "@/hooks/useAuth"; // Will be removed or used only for initial auth check if needed
// Client-side Firebase imports removed:
// import { db } from "@/lib/firebase";
// import { doc, updateDoc, collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useFormState as useActionFormState, useFormState, useFormStatus } from "react-dom"; // Added useActionFormState
import { addAccessoryAction, updateAccessoryAction, type AccessoryActionResult, generateDescriptionAction } from "@/app/admin/accessories/actions"; // Added generateDescriptionAction

interface AccessoryFormProps {
  initialData?: Partial<AccessoryFormValues & { id?: string }>;
  submitButtonText?: string;
  // isStaticExport prop is no longer needed
}

const processImageFile = (file: File, maxWidth: number = 800, maxHeight: number = 800, quality: number = 0.7): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = document.createElement('img');
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let { width, height } = img;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return reject(new Error('Could not get canvas context'));
        }
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
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

const isValidHttpUrl = (string: string | null | undefined): boolean => {
  if (!string) return false;
  let url;
  try {
    url = new URL(string);
  } catch (_) {
    return false;
  }
  return url.protocol === "http:" || url.protocol === "https:";
};

const isLikelyDataURL = (string: string | null | undefined): boolean => {
  if (!string) return false;
  return string.startsWith("data:image/");
}


export default function AccessoryForm({
  initialData,
  submitButtonText = "Salvar Acessório",
}: AccessoryFormProps) {
  const { toast } = useToast();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(initialData?.imageUrl || null);
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  // const [isSubmitting, setIsSubmitting] = useState(false); // Replaced by useFormStatus

  // useAuth might still be used for an initial client-side check if desired,
  // but actual authorization for the action happens on the server.
  const { user: authUser, isAuthenticated } = useAuth();

  const [formState, formAction] = useFormState(
    initialData?.id ? updateAccessoryAction.bind(null, initialData.id) : addAccessoryAction,
    undefined // Initial state for formState
  );

  // AI Description State
  const [aiDescState, aiDescAction] = useActionFormState(generateDescriptionAction, undefined);
  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);

  const form = useForm<AccessoryFormValues>({
    resolver: zodResolver(AccessoryFormSchema),
    defaultValues: initialData ? {
      ...initialData,
      price: String(initialData.price || ""), // Ensure price is a string for the input field
    } : {
      name: "",
      shortDescription: "",
      fullDescription: "",
      imageUrl: "", // This will be populated by handleImageUpload or initialData
      imageHint: "",
      affiliateLink: "",
      price: "", // Expects string e.g. "29,99" or "29.99"
      category: "",
      isDeal: false,
      aiSummary: "",
      embedHtml: "",
    },
  });

  useEffect(() => {
    if (initialData?.imageUrl) {
      setImagePreview(initialData.imageUrl);
      // No need to form.setValue for imageUrl here if it's part of defaultValues
      // and processImageFile sets it directly if a new one is uploaded.
    }
  }, [initialData?.imageUrl]);

  // Effect to handle toast messages and form reset/redirect based on formState
  useEffect(() => {
    if (formState?.success) {
      toast({ title: "Sucesso!", description: formState.message });
      if (formState.accessory && !initialData?.id) { // Successfully added new
        form.reset();
        setImagePreview(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        // Optional: redirect to edit page: router.push(`/admin/accessories/${formState.accessory.id}/edit`);
      } else if (initialData?.id) { // Successfully updated
        router.push("/admin/accessories");
      }
    } else if (formState?.error) {
      let errorMessage = "Ocorreu um erro.";
      if (typeof formState.error === 'string') {
        errorMessage = formState.error;
      } else if (typeof formState.error === 'object') {
        // Display first field error or a generic message
        const fieldErrors = Object.values(formState.error).flat();
        errorMessage = fieldErrors[0] || "Verifique os campos do formulário.";
      }
      toast({ title: "Erro ao Salvar", description: errorMessage, variant: "destructive" });
      // Populate form errors if field-specific errors are available
      if (typeof formState.error === 'object') {
        for (const [fieldName, errors] of Object.entries(formState.error)) {
          if (errors && errors.length > 0) {
            form.setError(fieldName as keyof AccessoryFormValues, { type: 'server', message: errors[0] });
          }
        }
      }
    }
  }, [formState, form, router, toast, initialData?.id]);

  // Effect to handle AI description results
  useEffect(() => {
    if (aiDescState?.success && aiDescState.description) {
      form.setValue("fullDescription", aiDescState.description, { shouldValidate: true });
      toast({ title: "Sucesso!", description: "Descrição gerada por IA e inserida no campo 'Descrição Completa'." });
    } else if (aiDescState?.error) {
      toast({ title: "Erro ao Gerar Descrição", description: aiDescState.error, variant: "destructive" });
    }
    if (aiDescState) setIsGeneratingDescription(false); // Reset loading state when aiDescState changes
  }, [aiDescState, form, toast]);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setIsProcessingImage(true);
      try {
        const compressedDataUrl = await processImageFile(file);
        setImagePreview(compressedDataUrl);
        form.setValue("imageUrl", compressedDataUrl, { shouldValidate: true });
        toast({ title: "Imagem Carregada", description: "Pré-visualização da imagem atualizada."});
      } catch (error) {
        console.error("Error processing image:", error);
        toast({ title: "Erro de Imagem", description: "Falha ao processar imagem.", variant: "destructive" });
        setImagePreview(initialData?.imageUrl || null);
        // form.setValue("imageUrl", initialData?.imageUrl || "", { shouldValidate: true }); // Ensure this is correct if image processing fails
        // If image processing fails, the form's "imageUrl" should ideally revert to the initialData.imageUrl or be empty if no initialData.
        // The current processFormData in actions.ts will use the "imageUrl" field from FormData.
        // If processImageFile fails, we should ensure "imageUrl" field is correctly set to the previous value.
        // The form.setValue to initialData.imageUrl on error is good.
        form.setValue("imageUrl", initialData?.imageUrl || form.getValues("imageUrl") || "", { shouldValidate: true });

      } finally {
        setIsProcessingImage(false);
      }
    }
  };

  // The handleSubmit function provided by react-hook-form will now pass data to the formAction
  // No separate handleSubmit function is strictly needed unless for pre-processing before formAction is called,
  // but standard HTML form submission with Server Actions handles FormData directly.

  const handleGenerateDescription = async () => {
    const productName = form.getValues("name");
    const shortDesc = form.getValues("shortDescription");
    const category = form.getValues("category");

    if (!productName && !shortDesc) {
      toast({
        title: "Faltam Informações",
        description: "Forneça pelo menos o nome ou a descrição curta para gerar a descrição completa.",
        variant: "warning",
      });
      return;
    }

    setIsGeneratingDescription(true);
    const formData = new FormData();
    formData.append("productInfo", `Nome: ${productName}, Categoria: ${category}, Detalhes: ${shortDesc}`);
    // @ts-ignore
    aiDescAction(formData);
  };
  
  const displayableImagePreview = imagePreview && (isValidHttpUrl(imagePreview) || isLikelyDataURL(imagePreview)) ? imagePreview : null;

  // Component to handle submit button pending state
  function SubmitButton({ buttonText }: { buttonText: string }) {
    const { pending } = useFormStatus();
    return (
      <Button type="submit" className="w-full sm:w-auto" disabled={pending || isProcessingImage}>
        {pending ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Save className="mr-2 h-4 w-4" />
        )}
        {buttonText}
      </Button>
    );
  }

  return (
    <Form {...form}>
      <form
        // The `action` prop is bound via useFormState.
        // RHF's handleSubmit will be used to trigger the submission process.
        // It will first validate, then run the function passed to it.
        // Inside that function, we manually create FormData and call the server action.
        onSubmit={form.handleSubmit(async (data) => {
          // Create FormData from RHF's validated data
          const formData = new FormData();
          for (const key in data) {
            const value = (data as any)[key];
            if (value !== undefined && value !== null) {
              if (typeof value === 'boolean') {
                formData.append(key, value ? 'true' : 'false');
              } else if (value instanceof FileList) {
                  // This case should not happen here as image is base64 string.
                  // If it were a file, you'd append fileList[0]
              } else {
                formData.append(key, String(value));
              }
            }
          }
          // Ensure imageUrl (potentially base64 from imagePreview) is included if not already in `data`
          // or if it needs to be explicitly taken from state.
          // form.getValues("imageUrl") should reflect the latest value set by handleImageUpload or initial.
          const currentImageUrl = form.getValues("imageUrl");
          if (currentImageUrl) {
            formData.set("imageUrl", currentImageUrl);
          } else if (imagePreview) {
            // Fallback if imageUrl field wasn't updated by RHF for some reason
            // but preview exists (e.g. pasted URL not yet in form state fully)
            formData.set("imageUrl", imagePreview);
          }


          // Directly call the formAction (obtained from useFormState)
          // This will trigger the server action.
          // @ts-ignore
          await formAction(formData);
        })}
        className="space-y-8"
      >
        {/* Removed isStaticExport related div */}
        {/* Display general form errors from server action if they exist and are not field specific */}
        {formState?.error && typeof formState.error === 'string' && (
          <div className="p-3 text-sm text-destructive bg-red-100 border border-destructive rounded-md">
            {formState.error}
          </div>
        )}

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome do Acessório</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Carregador Sem Fio Rápido" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="shortDescription"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição Curta</FormLabel>
              <FormControl>
                <Textarea placeholder="Uma breve descrição (aparece no card)" {...field} rows={2} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="fullDescription"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição Completa</FormLabel>
              <FormControl>
                <Textarea placeholder="Descrição detalhada do produto (aparece na página do acessório)" {...field} rows={5} />
              </FormControl>
              {/* Add button here */}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleGenerateDescription}
                disabled={isGeneratingDescription || !form.watch('name') && !form.watch('shortDescription')}
                className="mt-2"
              >
                {isGeneratingDescription ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Info className="mr-2 h-4 w-4" />
                )}
                Gerar Descrição com IA
              </Button>
              <FormDescription>
                Clique para gerar uma descrição completa usando Inteligência Artificial com base no nome, categoria e descrição curta.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="embedHtml"
          render={({ field }) => (
            <FormItem>
              <FormLabel>HTML de Embed (Opcional)</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Cole o código HTML de embed aqui (ex: vídeo do YouTube, mapa)" 
                  {...field} 
                  value={field.value || ""}
                  rows={4} 
                />
              </FormControl>
              <FormDescription>
                Insira o código HTML completo para incorporar conteúdo externo (ex: iframes).
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="space-y-4">
          <FormLabel>Imagem Principal</FormLabel>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
             <div className="space-y-2">
                <FormItem>
                  <FormLabel htmlFor="imageUpload" className="text-sm font-normal text-muted-foreground">Subir Imagem (Recomendado)</FormLabel>
                  <FormControl>
                    <Input 
                      id="imageUpload"
                      type="file" 
                      accept="image/*" 
                      ref={fileInputRef}
                      onChange={handleImageUpload}
                      className="cursor-pointer"
                      disabled={isProcessingImage} // || pending from useFormStatus
                    />
                  </FormControl>
                  <FormDescription>Selecione um arquivo de imagem (ex: JPG, PNG). Ele será redimensionado e comprimido.</FormDescription>
                  {isProcessingImage && <p className="text-sm text-muted-foreground flex items-center"><Loader2 className="mr-2 h-4 w-4 animate-spin"/> Processando imagem...</p>}
                  {/* FormMessage for file input can be tricky, usually handled by overall form error or specific validation message */}
                </FormItem>
                <FormField
                  control={form.control}
                  name="imageUrl" // This field will store the base64 string or external URL
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-normal text-muted-foreground">Ou Cole a URL da Imagem</FormLabel>
                      <FormControl>
                        <Input 
                          type="url" 
                          placeholder="https://exemplo.com/imagem.png" 
                          {...field} 
                          value={field.value || ""}
                          onChange={(e) => {
                            field.onChange(e);
                            setImagePreview(e.target.value); // Update preview when URL is pasted
                          }}
                        />
                      </FormControl>
                      <FormMessage /> {/* Shows validation messages for imageUrl field */}
                    </FormItem>
                  )}
                />
             </div>
             {displayableImagePreview && (
              <div className="space-y-2">
                <FormLabel className="text-sm font-normal text-muted-foreground">Pré-visualização</FormLabel>
                <div className="relative aspect-video w-full max-w-sm border rounded-md overflow-hidden bg-muted">
                  <Image
                    src={displayableImagePreview}
                    alt="Pré-visualização da imagem do acessório"
                    fill
                    style={{ objectFit: 'contain' }}
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </div>
              </div>
            )}
          </div>
           <p className="text-xs text-muted-foreground">
            Nota: As imagens enviadas são convertidas para um formato de dados (base64) e armazenadas. Para produção, considere um serviço de upload dedicado.
          </p>
        </div>

        <FormField
          control={form.control}
          name="imageHint"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Dica para IA da Imagem (1-2 palavras)</FormLabel>
              <FormControl>
                <Input placeholder="Ex: fone ouvido" {...field} value={field.value || ""} />
              </FormControl>
              <FormDescription>Usado para buscar imagens alternativas se necessário.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <FormField
            control={form.control}
            name="affiliateLink"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Link de Afiliado</FormLabel>
                <FormControl>
                  <Input type="url" placeholder="https://loja.com/produto?tag=seu-id" {...field} value={field.value || ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="price" // Field name should match schema
            render={({ field }) => (
              <FormItem>
                <FormLabel>Preço (Ex: 29,99)</FormLabel>
                <FormControl>
                  {/* Input type="text" is better for price to allow comma, then parse */}
                  <Input placeholder="29,99" {...field} value={field.value || ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Categoria</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: Carregadores, Fones de Ouvido" {...field} value={field.value || ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
           <FormField
            control={form.control}
            name="isDeal"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>É uma Oferta Especial?</FormLabel>
                <FormControl>
                  <div className="flex items-center space-x-2 h-10">
                    <Switch
                      id="isDealSwitch"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      // name={field.name} // RHF handles name via control
                      // ref={field.ref} // RHF handles ref
                      onBlur={field.onBlur} // RHF handles blur
                    />
                    <FormLabel htmlFor="isDealSwitch" className="cursor-pointer">
                      {field.value ? "Sim, é uma oferta" : "Não é uma oferta"}
                    </FormLabel>
                  </div>
                </FormControl>
                <FormDescription>Marque se este item deve aparecer na seção "Ofertas do Dia".</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="aiSummary"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Resumo Gerado por IA (Opcional)</FormLabel>
              <FormControl>
                <Textarea placeholder="Resumo conciso, pode ser gerado por IA depois." {...field} rows={3} value={field.value || ""} />
              </FormControl>
              <FormDescription>Se deixado em branco, o sistema pode tentar gerar um resumo automaticamente.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <SubmitButton buttonText={submitButtonText} />
      </form>
    </Form>
  );
}
