
"use server";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { PostFormSchema, type PostFormValues } from "@/lib/schemas/post-schema";
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
import { useEffect, useState, useRef } from "react";
// import type { Post } from "@/lib/types"; // Not directly used if actions return typed results
import { useRouter } from "next/navigation";
import Image from "next/image";
// import { useAuth } from "@/hooks/useAuth"; // Auth check will be server-side primarily
// Firebase client imports removed
// import { db } from "@/lib/firebase";
// import { doc, updateDoc, collection, addDoc, serverTimestamp, Timestamp } from "firebase/firestore";
import { useFormState, useFormStatus } from "react-dom"; // Added
import { addPostAction, updatePostAction, type PostActionResult } from "@/app/admin/blog-posts/actions"; // Added

interface PostFormProps {
  initialData?: Partial<PostFormValues & { id?: string; tags?: string[] | string }>; // Allow tags to be string from initialData
  submitButtonText?: string;
  // isStaticExport prop removed
}

const processImageFile = (file: File, maxWidth: number = 1200, maxHeight: number = 675, quality: number = 0.75): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = document.createElement('img');
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let { width, height } = img;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
        
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject(new Error('Could not get canvas context'));
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = reject;
      if (event.target?.result) img.src = event.target.result as string;
      else reject(new Error('Failed to read image file.'));
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export default function PostForm({
  initialData,
  submitButtonText = "Salvar Post",
}: PostFormProps) {
  const { toast } = useToast();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(initialData?.imageUrl || null);
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  // const [isSubmitting, setIsSubmitting] = useState(false); // Removed this line
  // const { user: authUser, isAuthenticated } = useAuth(); // Server actions handle auth

  const [formState, formAction] = useFormState(
    initialData?.id ? updatePostAction.bind(null, initialData.id) : addPostAction,
    undefined // Initial state for formState
  );

  const defaultPublishedAtDate = initialData?.publishedAt
                                ? new Date(initialData.publishedAt)
                                : new Date();
  const formattedDefaultPublishedAt = defaultPublishedAtDate.toISOString().split('T')[0];

  // Ensure tags are a string for the form input
  const initialTagsString = Array.isArray(initialData?.tags)
    ? initialData.tags.join(", ")
    : typeof initialData?.tags === 'string'
    ? initialData.tags
    : "";

  const form = useForm<PostFormValues>({
    resolver: zodResolver(PostFormSchema),
    defaultValues: {
      title: initialData?.title || "",
      slug: initialData?.slug || "",
      excerpt: initialData?.excerpt || "",
      content: initialData?.content || "",
      imageUrl: initialData?.imageUrl || "",
      imageHint: initialData?.imageHint || "",
      authorName: initialData?.authorName || "Equipe SmartAcessorios", // Default author name
      authorAvatarUrl: initialData?.authorAvatarUrl || "",
      authorAvatarHint: initialData?.authorAvatarHint || "",
      category: initialData?.category || "",
      tags: initialTagsString,
      publishedAt: formattedDefaultPublishedAt,
      embedHtml: initialData?.embedHtml || "", 
    },
  });

  useEffect(() => {
    if (initialData?.imageUrl) {
      setImagePreview(initialData.imageUrl);
    }
  }, [initialData?.imageUrl]);

  // Effect to handle toast messages and form reset/redirect based on formState
  useEffect(() => {
    if (!formState) return;

    if (formState.success) {
      toast({ title: "Sucesso!", description: formState.message });
      if (formState.post && !initialData?.id) { // Successfully added new
        form.reset({
            title: "", slug: "", excerpt: "", content: "", imageUrl: "", imageHint: "",
            authorName: "Equipe SmartAcessorios", authorAvatarUrl: "", authorAvatarHint: "",
            category: "", tags: "", publishedAt: new Date().toISOString().split('T')[0], embedHtml: ""
        });
        setImagePreview(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        // Optional: router.push(`/admin/blog-posts/${formState.post.id}/edit`);
      } else if (initialData?.id) { // Successfully updated
        router.push("/admin/blog-posts");
      }
    } else if (formState.error) {
      let errorMessage = "Ocorreu um erro.";
      if (typeof formState.error === 'string') {
        errorMessage = formState.error;
      } else if (typeof formState.error === 'object') {
        const fieldErrors = Object.values(formState.error).flat();
        errorMessage = fieldErrors[0] || "Verifique os campos do formulário.";
      }
      toast({ title: "Erro ao Salvar", description: errorMessage, variant: "destructive" });
      if (typeof formState.error === 'object') {
        for (const [fieldName, errors] of Object.entries(formState.error)) {
          if (errors && errors.length > 0) {
            form.setError(fieldName as keyof PostFormValues, { type: 'server', message: errors[0] });
          }
        }
      }
    }
  }, [formState, form, router, toast, initialData?.id]);


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
        form.setValue("imageUrl", initialData?.imageUrl || form.getValues("imageUrl") || "", { shouldValidate: true });
      } finally {
        setIsProcessingImage(false);
      }
    }
  };
  
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
        action={formAction}
        onSubmit={form.handleSubmit(async (data) => {
          const formData = new FormData();
          for (const key in data) {
            const value = (data as any)[key];
            if (value !== undefined && value !== null) {
              if (key === 'tags' && Array.isArray(value)) { // RHF might give array if parsed by schema
                formData.append(key, value.join(','));
              } else {
                formData.append(key, String(value));
              }
            }
          }
           // Ensure imageUrl from RHF (which might be updated by handleImageUpload) is on FormData
          const currentImageUrl = form.getValues("imageUrl");
          if (currentImageUrl) {
            formData.set("imageUrl", currentImageUrl);
          } else if (imagePreview) { // Fallback if RHF state not updated but preview exists
             formData.set("imageUrl", imagePreview);
          }

          // @ts-ignore
          await formAction(formData);
        })}
        className="space-y-8"
      >
        {/* isStaticExport message div removed */}
        {formState?.error && typeof formState.error === 'string' && (
          <div className="p-3 text-sm text-destructive bg-red-100 border border-destructive rounded-md">
            {formState.error}
          </div>
        )}
        <FormField control={form.control} name="title" render={({ field }) => (
            <FormItem>
              <FormLabel>Título do Post</FormLabel>
              <FormControl><Input placeholder="Ex: As Melhores Capas para iPhone 15" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField control={form.control} name="slug" render={({ field }) => (
            <FormItem>
              <FormLabel>Slug (URL Amigável)</FormLabel>
              <FormControl><Input placeholder="ex: melhores-capas-iphone-15" {...field} /></FormControl>
              <FormDescription>Use letras minúsculas, números e hífens. Será usado na URL do post.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField control={form.control} name="excerpt" render={({ field }) => (
            <FormItem>
              <FormLabel>Resumo (Excerpt)</FormLabel>
              <FormControl><Textarea placeholder="Um breve resumo que aparecerá nas listagens do blog." {...field} rows={3} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField control={form.control} name="content" render={({ field }) => (
            <FormItem>
              <FormLabel>Conteúdo Principal do Post</FormLabel>
              <FormControl><Textarea placeholder="Escreva o conteúdo completo do seu post aqui..." {...field} rows={15} /></FormControl>
              <FormDescription>
                Use HTML para formatação (ex: &lt;p&gt;parágrafo&lt;/p&gt;, &lt;strong&gt;negrito&lt;/strong&gt;, &lt;br&gt; para quebra de linha, &lt;ul&gt;&lt;li&gt;lista&lt;/li&gt;&lt;/ul&gt;). Um editor rico será adicionado no futuro.
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
          <FormLabel>Imagem Principal do Post</FormLabel>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
             <div className="space-y-2">
                <FormItem>
                  <FormLabel htmlFor="imageUpload" className="text-sm font-normal text-muted-foreground">Subir Imagem</FormLabel>
                  <FormControl>
                    <Input id="imageUpload" type="file" accept="image/*" ref={fileInputRef} onChange={handleImageUpload} className="cursor-pointer" disabled={isProcessingImage}/>
                  </FormControl>
                  <FormDescription>Selecione uma imagem. Ela será redimensionada e comprimida.</FormDescription>
                  {isProcessingImage && <p className="text-sm text-muted-foreground flex items-center"><Loader2 className="mr-2 h-4 w-4 animate-spin"/> Processando imagem...</p>}
                </FormItem>
                <FormField control={form.control} name="imageUrl" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-normal text-muted-foreground">Ou Cole a URL da Imagem</FormLabel>
                      <FormControl>
                        <Input type="url" placeholder="https://exemplo.com/imagem.png" {...field} value={field.value || ""} onChange={(e) => { field.onChange(e); setImagePreview(e.target.value); }} />
                      </FormControl>
                    </FormItem>
                  )}
                />
             </div>
             {imagePreview && (
              <div className="space-y-2">
                <FormLabel className="text-sm font-normal text-muted-foreground">Pré-visualização</FormLabel>
                <div className="relative aspect-video w-full max-w-sm border rounded-md overflow-hidden bg-muted">
                  <Image src={imagePreview} alt="Pré-visualização da imagem do post" fill style={{ objectFit: 'contain' }} sizes="(max-width: 768px) 100vw, 50vw" />
                </div>
              </div>
            )}
          </div>
           <FormMessage>{form.formState.errors.imageUrl?.message}</FormMessage>
        </div>

        <FormField control={form.control} name="imageHint" render={({ field }) => (
            <FormItem>
              <FormLabel>Dica para IA da Imagem (1-2 palavras)</FormLabel>
              <FormControl><Input placeholder="Ex: smartphone review" {...field} value={field.value || ""} /></FormControl>
              <FormDescription>Usado para buscar imagens alternativas se necessário.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <FormField control={form.control} name="authorName" render={({ field }) => (
                <FormItem>
                    <FormLabel>Nome do Autor</FormLabel>
                    <FormControl><Input placeholder="Ex: João Silva" {...field} /></FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />
            <FormField control={form.control} name="authorAvatarUrl" render={({ field }) => (
                <FormItem>
                    <FormLabel>URL do Avatar do Autor (Opcional)</FormLabel>
                    <FormControl><Input type="url" placeholder="https://exemplo.com/avatar.png" {...field} value={field.value || ""} /></FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />
        </div>
         <FormField control={form.control} name="authorAvatarHint" render={({ field }) => (
            <FormItem>
              <FormLabel>Dica para IA do Avatar do Autor (Opcional)</FormLabel>
              <FormControl><Input placeholder="Ex: homem sorrindo" {...field} value={field.value || ""} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <FormField control={form.control} name="category" render={({ field }) => (
                <FormItem>
                    <FormLabel>Categoria (Opcional)</FormLabel>
                    <FormControl><Input placeholder="Ex: Reviews, Dicas, Notícias" {...field} value={field.value || ""} /></FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />
            <FormField control={form.control} name="tags" render={({ field }) => (
                <FormItem>
                    <FormLabel>Tags (Opcional)</FormLabel>
                    <FormControl><Input placeholder="Ex: tech, smartphones, android, ios" {...field} value={field.value || ""} /></FormControl>
                    <FormDescription>Separe as tags por vírgula.</FormDescription>
                    <FormMessage />
                </FormItem>
                )}
            />
        </div>
        <FormField control={form.control} name="publishedAt" render={({ field }) => (
            <FormItem>
                <FormLabel>Data de Publicação</FormLabel>
                <FormControl><Input type="date" {...field} /></FormControl>
                <FormDescription>Selecione a data de publicação ou deixe para usar a data atual.</FormDescription>
                <FormMessage />
            </FormItem>
        )} />

        <SubmitButton buttonText={submitButtonText} />
      </form>
    </Form>
  );
}
