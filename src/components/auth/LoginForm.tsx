
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
import { useEffect, useActionState, startTransition } from "react";
import { useFormStatus } from "react-dom";
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation'; // For redirection

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
    password?: string; // Keep for re-filling on error
  };
  // user?: AuthUser | null; // No longer need to pass user from action
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

function SubmitButton({ text }: { text: string }) {
  const { pending } = useFormStatus();
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
  const { isAuthenticated, isLoading } = useAuth(); // Get auth state
  const router = useRouter();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: state?.fields?.email || "",
      password: "", // Always clear password field for security
    },
  });

  useEffect(() => {
    if (state.message) {
      if (state.success) {
        toast({
          title: "Sucesso!",
          description: state.message,
        });
        // Redirection will be handled by the main auth state listener (useAuth)
        // or you can explicitly redirect here after a short delay if onAuthStateChanged is too slow.
        // For now, let's assume useAuth handles it.
        form.reset({ email: '', password: ''});
        // router.push('/dashboard'); // Or let useAuth redirect
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
        // Re-fill email, clear password
        form.reset({ email: state.fields?.email || form.getValues('email'), password: '' });
      }
    }
  }, [state, toast, form]);

  // Redirect if user becomes authenticated (e.g., after successful login action)
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      const searchParams = new URLSearchParams(window.location.search);
      const redirectTo = searchParams.get('redirect') || '/dashboard';
      router.replace(redirectTo);
    }
  }, [isAuthenticated, isLoading, router]);


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
            className="space-y-4" 
            onSubmit={form.handleSubmit(() => {
                const formData = new FormData();
                const values = form.getValues();
                formData.append('email', values.email);
                formData.append('password', values.password);
                startTransition(() => {
                  dispatch(formData);
                });
            })}
          >
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
                    <Input type="password" placeholder="••••••••" {...field} />
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
            <SubmitButton text={submitButtonText} />
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
