
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { CouponFormSchema, type CouponFormValues } from "@/lib/schemas/coupon-schema";
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
import { Loader2, Save, Calendar as CalendarIcon, Link as LinkIcon } from "lucide-react";
import { useActionState, useEffect, startTransition, useRef } from "react";
import { useFormStatus } from "react-dom";
import type { Coupon } from "@/lib/types";
import type { CouponActionResult } from "../actions";
import { useRouter } from "next/navigation";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";


interface CouponFormProps {
  formAction: (prevState: CouponActionResult | null, formData: FormData) => Promise<CouponActionResult>;
  initialData?: Partial<CouponFormValues & { id?: string }>;
  submitButtonText?: string;
}

const initialState: CouponActionResult = { success: false };

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

export default function CouponForm({
  formAction,
  initialData,
  submitButtonText = "Salvar Cupom",
}: CouponFormProps) {
  const [state, dispatch] = useActionState(formAction, initialState);
  const { toast } = useToast();
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const { pending } = useFormStatus();

  const defaultExpiryDate = initialData?.expiryDate 
    ? (initialData.expiryDate.includes("T") ? initialData.expiryDate.split("T")[0] : initialData.expiryDate) 
    : "";


  const form = useForm<CouponFormValues>({
    resolver: zodResolver(CouponFormSchema),
    defaultValues: {
      code: initialData?.code || "",
      description: initialData?.description || "",
      discount: initialData?.discount || "",
      expiryDate: defaultExpiryDate,
      store: initialData?.store || "",
      applyUrl: initialData?.applyUrl || "",
    },
  });

  useEffect(() => {
    if (state?.message) {
      if (state.success) {
        toast({ title: "Sucesso!", description: state.message });
        if (state.coupon && !initialData) { 
          console.log("CouponForm: Create success, attempting redirect to /admin/coupons");
          router.push('/admin/coupons');
          form.reset({ code: "", description: "", discount: "", expiryDate: "", store: "", applyUrl: "" });
        } else if (state.coupon && initialData) {
          // Update, no redirect
        }
      } else {
        toast({
          title: "Erro",
          description: state.error || state.message || "Falha ao salvar cupom.",
          variant: "destructive",
        });
        state.errors?.forEach(issue => {
          const path = issue.path.join('.') as keyof CouponFormValues;
          form.setError(path as any, { type: "server", message: issue.message });
        });
      }
    }
  }, [state, toast, form, router, initialData]);

  const processForm = (data: CouponFormValues) => {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, String(value));
      }
    });
    startTransition(() => {
      dispatch(formData);
    });
  };

  return (
    <Form {...form}>
      <form ref={formRef} action={dispatch} onSubmit={form.handleSubmit(processForm)} className="space-y-8">
        <FormField
          control={form.control}
          name="code"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Código do Cupom</FormLabel>
              <FormControl><Input placeholder="EX: PROMO25" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="discount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Valor/Tipo do Desconto</FormLabel>
              <FormControl><Input placeholder="Ex: 25% OFF, R$10, Frete Grátis" {...field} /></FormControl>
              <FormDescription>O que o usuário ganha ao usar o cupom.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição</FormLabel>
              <FormControl><Textarea placeholder="Descreva as condições ou produtos aplicáveis ao cupom." {...field} rows={3} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <FormField
            control={form.control}
            name="expiryDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Data de Validade (Opcional)</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(parseISO(field.value), "PPP", { locale: ptBR })
                        ) : (
                          <span>Escolha uma data</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value ? parseISO(field.value) : undefined}
                      onSelect={(date) => field.onChange(date ? format(date, "yyyy-MM-dd") : "")}
                      disabled={(date) => {
                        const today = new Date();
                        today.setHours(0,0,0,0);
                        return date < today;
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormDescription>Deixe em branco se o cupom não expirar.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="store"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Loja/Marca (Opcional)</FormLabel>
                <FormControl><Input placeholder="Ex: Loja XYZ, MarcaABC" {...field} value={field.value || ""} /></FormControl>
                <FormDescription>Onde o cupom pode ser usado.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
            control={form.control}
            name="applyUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>URL de Aplicação (Opcional)</FormLabel>
                <div className="flex items-center gap-2">
                   <LinkIcon className="h-5 w-5 text-muted-foreground" />
                    <FormControl className="flex-grow">
                        <Input type="url" placeholder="https://loja.com/carrinho?cupom=CODIGO" {...field} value={field.value || ""} />
                    </FormControl>
                </div>
                <FormDescription>Link direto para a página onde o cupom pode ser aplicado (ex: página do produto ou carrinho).</FormDescription>
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

    