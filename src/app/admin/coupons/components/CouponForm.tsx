
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
import { useEffect, useState, useRef } from "react";
// import type { Coupon } from "@/lib/types"; // Not directly used if actions return typed results
import { useRouter } from "next/navigation";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
// import { useAuth } from "@/hooks/useAuth"; // Auth check will be server-side primarily
// Firebase client imports removed
// import { db } from "@/lib/firebase";
// import { doc, updateDoc, collection, addDoc, serverTimestamp, Timestamp } from "firebase/firestore";
import { useFormState, useFormStatus } from "react-dom"; // Added
import { addCouponAction, updateCouponAction, type CouponActionResult } from "@/app/admin/coupons/actions"; // Added
import { Calendar } from "@/components/ui/calendar";
import { format, parseISO, isValid } from "date-fns"; // Added isValid
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";


interface CouponFormProps {
  // formAction prop removed
  initialData?: Partial<CouponFormValues & { id?: string }>;
  submitButtonText?: string;
  // isStaticExport prop removed
}

function SubmitButton({ buttonText }: { buttonText: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full sm:w-auto" disabled={pending}>
      {pending ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Save className="mr-2 h-4 w-4" />
      )}
      {buttonText}
    </Button>
  );
}

export default function CouponForm({
  initialData,
  submitButtonText = "Salvar Cupom",
}: CouponFormProps) {
  const { toast } = useToast();
  const router = useRouter();
  // const { user: authUser, isAuthenticated } = useAuth(); // Server actions handle auth

  // Prepare initial form state for useFormState
  const [formState, formAction] = useFormState(
    initialData?.id ? updateCouponAction.bind(null, initialData.id) : addCouponAction,
    undefined // Initial state for formState
  );

  const parsedDate = initialData?.expiryDate ? parseISO(initialData.expiryDate) : null;
  const validInitialDate = parsedDate && isValid(parsedDate) ? format(parsedDate, "yyyy-MM-dd") : "";

  const form = useForm<CouponFormValues>({
    resolver: zodResolver(CouponFormSchema),
    defaultValues: {
      code: initialData?.code || "",
      description: initialData?.description || "",
      discount: initialData?.discount || "",
      expiryDate: validInitialDate,
      store: initialData?.store || "",
      applyUrl: initialData?.applyUrl || "",
    },
  });

  // Effect to handle toast messages and form reset/redirect based on formState
  useEffect(() => {
    if (!formState) return;

    if (formState.success) {
      toast({ title: "Sucesso!", description: formState.message });
      if (formState.coupon && !initialData?.id) { // Successfully added new
        form.reset({ code: "", description: "", discount: "", expiryDate: "", store: "", applyUrl: "" });
      } else if (initialData?.id) { // Successfully updated
        router.push("/admin/coupons");
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
            form.setError(fieldName as keyof CouponFormValues, { type: 'server', message: errors[0] });
          }
        }
      }
    }
  }, [formState, form, router, toast, initialData?.id]);


  return (
    <Form {...form}>
      <form
        action={formAction}
        onSubmit={form.handleSubmit(async (data) => {
          const formData = new FormData();
          for (const key in data) {
            const value = (data as any)[key];
            if (value !== undefined && value !== null) {
               formData.append(key, String(value));
            }
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
        <SubmitButton buttonText={submitButtonText} />
      </form>
    </Form>
  );
}
