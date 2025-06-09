
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
import { Loader2, UserPlus } from "lucide-react";
import Link from "next/link";
import { useEffect, useActionState, startTransition } from "react"; // Added startTransition
import { useFormStatus } from "react-dom";
import type { AuthUser } from "@/lib/types";
// import { useAuth } from '@/hooks/useAuth'; // Uncomment if auto-login after register is desired

const registerFormSchema = z.object({
  name: z.string().min(2, { message: "O nome deve ter pelo menos 2 caracteres." }),
  email: z.string().email({ message: "Por favor, insira um e-mail válido." }),
  password: z.string().min(6, { message: "A senha deve ter pelo menos 6 caracteres." }),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas não coincidem.",
  path: ["confirmPassword"],
});

type RegisterFormValues = z.infer<typeof registerFormSchema>;

export interface RegisterFormState {
  message: string;
  success: boolean;
  issues?: Record<string, string[] | undefined>;
  fields?: {
    name?: string;
    email?: string;
  };
  user?: AuthUser | null; // To potentially hold created user data
}

const initialState: RegisterFormState = {
  message: "",
  success: false,
  user: null,
};

interface RegisterFormProps {
  formAction: (prevState: RegisterFormState, formData: FormData) => Promise<RegisterFormState>;
  title: string;
  description: string;
  submitButtonText: string;
  linkToLogin?: { href: string; text: string; label: string; };
}

function SubmitButton({ text }: { text: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <UserPlus className="mr-2 h-4 w-4" />
      )}
      {text}
    </Button>
  );
}

export default function RegisterForm({ formAction, title, description, submitButtonText, linkToLogin }: RegisterFormProps) {
  const [state, dispatch] = useActionState(formAction, initialState);
  const { toast } = useToast();
  // const { login: clientAuthLogin } = useAuth(); // Uncomment for auto-login

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: {
      name: state?.fields?.name || "",
      email: state?.fields?.email || "",
      password: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    if (state.message) {
      if (state.success) {
        toast({
          title: "Sucesso!",
          description: state.message,
        });
        form.reset();
        // Optional: Auto-login the user
        // if (state.user) {
        //   clientAuthLogin(state.user);
        //   // router.push('/'); // Redirect after auto-login
        // }
      } else {
        toast({
          title: "Erro de Cadastro",
          description: state.message || "Verifique os dados e tente novamente.",
          variant: "destructive",
        });
         if (state.issues) {
          for (const [fieldName, errors] of Object.entries(state.issues)) {
            if (errors && errors.length > 0) {
              form.setError(fieldName as keyof RegisterFormValues, { type: 'server', message: errors.join(', ') });
            }
          }
        }
        form.reset({
          name: form.getValues('name'),
          email: form.getValues('email'),
          password: '',
          confirmPassword: '',
        });
      }
    }
  }, [state, toast, form /*, clientAuthLogin */]);

  return (
    <Card className="w-full max-w-md mx-auto shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl font-headline">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            action={dispatch}
            className="space-y-6"
            onSubmit={form.handleSubmit(() => {
                const formData = new FormData();
                const values = form.getValues();
                formData.append('name', values.name);
                formData.append('email', values.email);
                formData.append('password', values.password);
                formData.append('confirmPassword', values.confirmPassword);
                startTransition(() => {
                  dispatch(formData);
                });
            })}
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome Completo</FormLabel>
                  <FormControl>
                    <Input placeholder="Seu Nome" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="seu@email.com" {...field} />
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
                    <Input type="password" placeholder="•••••••• (mínimo 6 caracteres)" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirmar Senha</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <SubmitButton text={submitButtonText} />
            {state && !state.success && state.message && Object.keys(form.formState.errors).length === 0 && (
                 <p className="text-sm font-medium text-destructive text-center">{state.message}</p>
            )}
          </form>
        </Form>
        {linkToLogin && (
          <div className="mt-6 text-center text-sm">
            {linkToLogin.text}{" "}
            <Link href={linkToLogin.href} className="font-semibold text-primary hover:underline">
              {linkToLogin.label}
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
