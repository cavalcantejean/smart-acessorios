
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, LogIn } from "lucide-react";
import Link from "next/link";
import { useEffect, useActionState, startTransition, useRef, useState } from "react";
import { useAuth } from '@/hooks/useAuth';
import { useRouter, useSearchParams } from 'next/navigation';

const loginFormSchema = z.object({
  email: z.string().email({ message: "Por favor, insira um e-mail válido." }),
  password: z.string().min(1, { message: "A senha é obrigatória." }),
});

type LoginFormValues = z.infer<typeof loginFormSchema>;

export interface LoginFormState {
  message: string;
  success: boolean;
  issues?: Record<string, string[] | undefined>;
  fields?: {
    email?: string;
    password?: string;
  };
}

const initialState: LoginFormState = {
  message: "",
  success: false,
};

interface LoginFormProps {
  formAction: (prevState: LoginFormState, formData: FormData) => Promise<LoginFormState>;
  title: string;
  description: string;
  submitButtonText: string;
  linkToRegister?: { href: string; text: string; label: string; };
}

// SubmitButton agora é interno e usa o estado de pending local
function SubmitButtonInternal({ text, pending }: { text: string, pending: boolean }) {
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <LogIn className="mr-2 h-4 w-4" />
      )}
      {text}
    </Button>
  );
}

export default function LoginForm({ formAction, title, description, submitButtonText, linkToRegister }: LoginFormProps) {
  const [state, dispatch] = useActionState(formAction, initialState);
  const { toast } = useToast();
  const { isAuthenticated, isLoading: isAuthLoading, user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const formRef = useRef<HTMLFormElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);


  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: state?.fields?.email || "",
      password: "",
    },
  });

  useEffect(() => {
    console.log("LoginForm: useEffect[state] disparado. Estado da action:", state);
    if (state.message) {
      setIsSubmitting(false); // Reset local pending state
      if (state.success) {
        toast({
          title: "Login Bem-Sucedido!",
          description: state.message || "Aguarde, você será redirecionado.",
        });
        // Não redirecione aqui. Deixe o useEffect abaixo lidar com isso
        // com base na atualização do isAuthenticated do useAuth.
        // form.reset(); // Opcional: resetar o formulário aqui ou após o redirecionamento.
      } else {
        toast({
          title: "Erro de Login",
          description: state.message || "Verifique os dados e tente novamente.",
          variant: "destructive",
        });
        if (state.issues) {
          for (const [fieldName, errors] of Object.entries(state.issues)) {
            if (errors && errors.length > 0) {
              form.setError(fieldName as keyof LoginFormValues, { type: 'server', message: errors.join(', ') });
            }
          }
        }
        form.reset({ email: state.fields?.email || form.getValues('email'), password: '' });
      }
    }
  }, [state, toast, form]);

  useEffect(() => {
    console.log(`LoginForm: useEffect[isAuthenticated, isAuthLoading, user] disparado. isAuthenticated: ${isAuthenticated}, isAuthLoading: ${isAuthLoading}, User: ${user?.name}`);
    if (!isAuthLoading && isAuthenticated && user) { // Adicionada verificação de 'user'
      const redirectTo = searchParams.get('redirect') || (user.isAdmin ? '/admin/dashboard' : '/dashboard');
      console.log("LoginForm: Autenticado e não carregando. Redirecionando para:", redirectTo);
      router.replace(redirectTo);
    } else if (!isAuthLoading && !isAuthenticated) {
        console.log("LoginForm: Não autenticado e não carregando. Nenhuma ação de redirecionamento.");
    } else {
        console.log("LoginForm: Ainda carregando autenticação ou estado de usuário não totalmente definido.");
    }
  }, [isAuthenticated, isAuthLoading, user, router, searchParams]);


  const handleFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (formRef.current) {
      setIsSubmitting(true);
      const formData = new FormData(formRef.current);
      startTransition(() => {
        dispatch(formData);
      });
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl font-headline">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
        {searchParams.get('message') && (
          <p className="text-sm text-green-600 bg-green-50 p-3 rounded-md border border-green-200 mt-2">
            {searchParams.get('message')}
          </p>
        )}
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            ref={formRef}
            onSubmit={handleFormSubmit}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="seu@email.com" {...field} autoComplete="email" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Senha</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} autoComplete="current-password"/>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="text-sm text-right">
              <Link href="/forgot-password" className="font-medium text-primary hover:underline">
                Esqueceu a senha?
              </Link>
            </div>
            <SubmitButtonInternal text={submitButtonText} pending={isSubmitting} />
            {state && !state.success && state.message && Object.keys(form.formState.errors).length === 0 && (
              <p className="text-sm font-medium text-destructive text-center">{state.message}</p>
            )}
          </form>
        </Form>
        {linkToRegister && (
          <div className="mt-6 text-center text-sm">
            {linkToRegister.text}{" "}
            <Link href={linkToRegister.href} className="font-semibold text-primary hover:underline">
              {linkToRegister.label}
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
    