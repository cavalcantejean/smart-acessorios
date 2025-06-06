
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
import { useEffect } from "react";
import { useFormState, useFormStatus } from "react-dom";

const loginFormSchema = z.object({
  email: z.string().email({ message: "Por favor, insira um e-mail válido." }),
  password: z.string().min(1, { message: "A senha é obrigatória." }), // Min 1 for login
});

type LoginFormValues = z.infer<typeof loginFormSchema>;

export interface LoginFormState {
  message: string;
  success: boolean;
  issues?: Record<string, string[] | undefined>;
  fields?: Record<string, string>;
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
  const [state, dispatch] = useFormState(formAction, initialState);
  const { toast } = useToast();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: state?.fields?.email || "",
      password: state?.fields?.password || "",
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
      } else {
        toast({
          title: "Erro de Login",
          description: state.message || "Verifique os dados e tente novamente.",
          variant: "destructive",
        });
        // Set form errors if provided by the server action
        if (state.issues) {
          for (const [fieldName, errors] of Object.entries(state.issues)) {
            if (errors && errors.length > 0) {
              form.setError(fieldName as keyof LoginFormValues, { type: 'server', message: errors.join(', ') });
            }
          }
        }
      }
    }
  }, [state, toast, form]);

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
            onSubmit={form.handleSubmit(() => { // Ensure client-side validation runs
                const formData = new FormData();
                const values = form.getValues();
                formData.append('email', values.email);
                formData.append('password', values.password);
                dispatch(formData);
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
