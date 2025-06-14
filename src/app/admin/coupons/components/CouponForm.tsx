
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
// CouponActionResult type and useActionState/useFormStatus removed for static export
import type { Coupon } from "@/lib/types";
import { useRouter } from "next/navigation";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";


interface CouponFormProps {
  // formAction prop removed
  initialData?: Partial<CouponFormValues & { id?: string }>;
  submitButtonText?: string;
  isStaticExport?: boolean;
}

export default function CouponForm({
  initialData,
  submitButtonText = "Salvar Cupom",
  isStaticExport = true,
}: CouponFormProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleSubmit = async (data: CouponFormValues) => {
    if (isStaticExport) {
      toast({
        title: "Funcionalidade Indisponível",
        description: "O salvamento de cupons não é suportado na exportação estática.",
        variant: "destructive",
      });
      return;
    }
    setIsSubmitting(true);
    console.log("Coupon data submitted (client-side):", data);
    toast({ title: "Simulação de Envio", description: "Dados do cupom registrados no console." });
    setTimeout(() => {
      setIsSubmitting(false);
      // router.push('/admin/coupons');
    }, 1000);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
        {isStaticExport && (
           <div className="p-3 text-sm text-orange-700 bg-orange-100 border border-orange-300 rounded-md">
             <strong>Modo de Demonstração Estática:</strong> As modificações de dados estão desativadas.
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
        <Button type="submit" className="w-full sm:w-auto" disabled={isSubmitting || isStaticExport}>
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
