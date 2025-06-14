
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
import { Loader2, Save, Upload } from "lucide-react"; 
import { useEffect, useState, useRef } from "react";
// import type { Accessory } from "@/lib/types"; // Accessory type not directly used here
// AccessoryActionResult type and useActionState/useFormStatus removed as server actions are disabled for static export
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useAuth } from "@/hooks/useAuth";

interface AccessoryFormProps {
  // formAction prop removed as Server Actions are not used for static export
  initialData?: Partial<AccessoryFormValues>;
  submitButtonText?: string;
  isStaticExport?: boolean; // Flag to indicate static export mode
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
  isStaticExport = true, // Default to true, disabling form submissions
}: AccessoryFormProps) {
  const { toast } = useToast();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(initialData?.imageUrl || null);
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false); // Local submitting state
  
  const { user: authUser, isAuthenticated } = useAuth();


  const form = useForm<AccessoryFormValues>({
    resolver: zodResolver(AccessoryFormSchema),
    defaultValues: initialData || {
      name: "",
      shortDescription: "",
      fullDescription: "",
      imageUrl: "",
      imageHint: "",
      affiliateLink: "",
      price: "",
      category: "",
      isDeal: false,
      aiSummary: "",
      embedHtml: "",
    },
  });

  useEffect(() => {
    if (initialData?.imageUrl) {
      setImagePreview(initialData.imageUrl);
    }
  }, [initialData?.imageUrl]);


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
        form.setValue("imageUrl", initialData?.imageUrl || "", { shouldValidate: true });
      } finally {
        setIsProcessingImage(false);
      }
    }
  };

  const handleSubmit = async (data: AccessoryFormValues) => {
    if (isStaticExport) {
      toast({
        title: "Funcionalidade Indisponível",
        description: "O salvamento de dados não é suportado na exportação estática. Esta ação é apenas demonstrativa.",
        variant: "destructive",
      });
      return;
    }

    if (!isAuthenticated || !authUser?.id) {
      toast({ title: "Não autenticado", description: "Você precisa estar logado como administrador.", variant: "destructive" });
      return;
    }
    
    setIsSubmitting(true);
    // Here you would implement client-side Firebase SDK calls if not using static export
    // For static export, this logic is effectively disabled by the isStaticExport check.
    console.log("Form data submitted (client-side):", data);
    toast({ title: "Simulação de Envio", description: "Dados do formulário registrados no console (cliente)." });
    
    // Simulate a delay and success/failure for UI feedback
    setTimeout(() => {
      setIsSubmitting(false);
      // Example: router.push('/admin/accessories');
      // form.reset();
    }, 1000);
  };
  
  const displayableImagePreview = imagePreview && (isValidHttpUrl(imagePreview) || isLikelyDataURL(imagePreview)) ? imagePreview : null;

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)} // Changed to local handleSubmit
        className="space-y-8"
      >
        {isStaticExport && (
           <div className="p-3 text-sm text-orange-700 bg-orange-100 border border-orange-300 rounded-md">
             <strong>Modo de Demonstração Estática:</strong> As modificações de dados estão desativadas.
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
                      disabled={isProcessingImage}
                    />
                  </FormControl>
                  <FormDescription>Selecione um arquivo de imagem (ex: JPG, PNG). Ele será redimensionado e comprimido.</FormDescription>
                  {isProcessingImage && <p className="text-sm text-muted-foreground flex items-center"><Loader2 className="mr-2 h-4 w-4 animate-spin"/> Processando imagem...</p>}
                  <FormMessage />
                </FormItem>
                <FormField
                  control={form.control}
                  name="imageUrl"
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
                            setImagePreview(e.target.value);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
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
            Nota: As imagens enviadas são convertidas para um formato de dados (base64) e armazenadas nos dados mock. Para aplicações reais, use um serviço de armazenamento de arquivos.
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
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Preço (Ex: 29,99 ou 29.99)</FormLabel>
                <FormControl>
                  <Input placeholder="29,99" {...field} value={field.value || ""}/>
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
                      name={field.name}
                      ref={field.ref}
                      onBlur={field.onBlur}
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
        
        <Button type="submit" className="w-full sm:w-auto" disabled={isSubmitting || isProcessingImage || isStaticExport}>
          {isSubmitting ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          {submitButtonText}
        </Button>
      </form>
    </Form>
  );
}
