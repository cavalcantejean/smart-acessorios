
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
import { Loader2, Save } from "lucide-react";
import { useActionState, useEffect, startTransition, useRef } from "react";
import { useFormStatus } from "react-dom";
import type { Accessory } from "@/lib/types";
import type { AccessoryActionResult } from "@/app/admin/accessories/actions";
import { useRouter } from "next/navigation";

interface AccessoryFormProps {
  formAction: (prevState: AccessoryActionResult | null, formData: FormData) => Promise<AccessoryActionResult>;
  initialData?: Partial<AccessoryFormValues>; // For edit form
  submitButtonText?: string;
  formTitle?: string;
  formDescription?: string;
}

const initialState: AccessoryActionResult = { success: false };

function SubmitButton({ text, pending }: { text: string; pending: boolean }) {
  return (
    <Button type="submit" className="w-full sm:w-auto" disabled={pending}>
      {pending ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Save className="mr-2 h-4 w-4" />
      )}
      {text}
    </Button>
  );
}

export default function AccessoryForm({
  formAction,
  initialData,
  submitButtonText = "Salvar Acessório",
}: AccessoryFormProps) {
  const [state, dispatch] = useActionState(formAction, initialState);
  const { toast } = useToast();
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const { pending } = useFormStatus(); // This hook should be used in a component rendered by the form

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
    },
  });

  useEffect(() => {
    if (state?.message) {
      if (state.success) {
        toast({
          title: "Sucesso!",
          description: state.message,
        });
        if (state.accessory && !initialData) { // Only redirect on create
          router.push('/admin/accessories');
        }
        if (!initialData) form.reset(); // Reset form on successful creation
      } else {
        toast({
          title: "Erro",
          description: state.error || state.message || "Falha ao salvar acessório.",
          variant: "destructive",
        });
        state.errors?.forEach(issue => {
          form.setError(issue.path[0] as keyof AccessoryFormValues, {
            type: "server",
            message: issue.message,
          });
        });
      }
    }
  }, [state, toast, form, router, initialData]);

  const processForm = (data: AccessoryFormValues) => {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (typeof value === 'boolean') {
          formData.append(key, value ? 'on' : ''); // 'on' for true, empty for false (or not present for false)
        } else {
          formData.append(key, String(value));
        }
      }
    });
    startTransition(() => {
      dispatch(formData);
    });
  };


  return (
    <Form {...form}>
      <form
        ref={formRef}
        action={dispatch} // For progressive enhancement if JS fails (less relevant with useActionState)
        onSubmit={form.handleSubmit(processForm)}
        className="space-y-8"
      >
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <FormField
            control={form.control}
            name="imageUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>URL da Imagem Principal</FormLabel>
                <FormControl>
                  <Input type="url" placeholder="https://exemplo.com/imagem.png" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="imageHint"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Dica para IA da Imagem (1-2 palavras)</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: fone ouvido" {...field} />
                </FormControl>
                <FormDescription>Usado para buscar imagens alternativas se necessário.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <FormField
            control={form.control}
            name="affiliateLink"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Link de Afiliado</FormLabel>
                <FormControl>
                  <Input type="url" placeholder="https://loja.com/produto?tag=seu-id" {...field} />
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
                  <Input placeholder="29,99" {...field} />
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
                  <Input placeholder="Ex: Carregadores, Fones de Ouvido" {...field} />
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
                      id="isDeal"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                    <FormLabel htmlFor="isDeal" className="cursor-pointer">
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
                <Textarea placeholder="Resumo conciso, pode ser gerado por IA depois." {...field} rows={3} />
              </FormControl>
              <FormDescription>Se deixado em branco, o sistema pode tentar gerar um resumo automaticamente.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <SubmitButton text={submitButtonText} pending={form.formState.isSubmitting || pending} />

         {state && !state.success && state.error && Object.keys(form.formState.errors).length === 0 && (
           <p className="text-sm font-medium text-destructive">{state.error}</p>
        )}
      </form>
    </Form>
  );
}

