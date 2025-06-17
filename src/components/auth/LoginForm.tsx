
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
import { Loader2, KeyRound } from "lucide-react"; 
import Link from "next/link";
import { useEffect, useState } from "react"; // Removed useActionState and startTransition
import { useAuth } from '@/hooks/useAuth';
import { useRouter, useSearchParams } from 'next/navigation';
import { auth } from '@/lib/firebase-client';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { Separator } from "@/components/ui/separator";


const loginFormSchema = z.object({
  email: z.string().email({ message: "Por favor, insira um e-mail válido." }),
  password: z.string().min(1, { message: "A senha é obrigatória." }),
});

type LoginFormValues = z.infer<typeof loginFormSchema>;

// This local state is for client-side form submission (Firebase Auth)
interface LocalFormState {
  message: string;
  success: boolean;
  isLoading: boolean;
}

const initialLocalState: LocalFormState = {
  message: "",
  success: false,
  isLoading: false,
};

interface LoginFormProps {
  // formAction prop and related types removed
  title: string;
  description: string;
  submitButtonText: string;
  linkToRegister?: { href: string; text: string; label: string; };
}

function SubmitButtonInternal({ text, pending }: { text: string, pending: boolean }) {
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <KeyRound className="mr-2 h-4 w-4" />
      )}
      {text}
    </Button>
  );
}

export default function LoginForm({ title, description, submitButtonText, linkToRegister }: LoginFormProps) {
  const [localFormState, setLocalFormState] = useState<LocalFormState>(initialLocalState);
  const { toast } = useToast();
  const { isAuthenticated, isLoading: isAuthLoading, user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  useEffect(() => {
    // console.log(`LoginForm: useEffect[isAuthenticated, isAuthLoading, user] disparado. isAuthenticated: ${isAuthenticated}, isAuthLoading: ${isAuthLoading}, User: ${user?.name}`);
    if (!isAuthLoading && isAuthenticated && user) {
      const redirectTo = searchParams.get('redirect') || (user.isAdmin ? '/admin/dashboard' : '/dashboard');
      // console.log("LoginForm: Autenticado e não carregando. Redirecionando para:", redirectTo);
      router.replace(redirectTo);
    } else if (!isAuthLoading && !isAuthenticated) {
      // console.log("LoginForm: Não autenticado e não carregando. Nenhuma ação de redirecionamento.");
    } else {
      // console.log("LoginForm: Ainda carregando autenticação ou estado de usuário não totalmente definido.");
    }
  }, [isAuthenticated, isAuthLoading, user, router, searchParams]);

  const handleEmailPasswordSubmit = async (values: LoginFormValues) => {
    // console.log("LoginForm: handleEmailPasswordSubmit iniciado com valores:", values);
    setLocalFormState(prev => ({ ...prev, message: "", success: false, isLoading: true }));

    try {
      const lowercasedEmail = values.email.toLowerCase();
      // console.log("LoginForm: Chamando signInWithEmailAndPassword no CLIENTE para:", lowercasedEmail);
      await signInWithEmailAndPassword(auth, lowercasedEmail, values.password);
      
      // console.log("LoginForm: signInWithEmailAndPassword NO CLIENTE bem-sucedido.");
      toast({
        title: "Login Bem-Sucedido!",
        description: "Sincronizando seus dados...",
      });
      // isLoading will be set to false by the useEffect that handles redirection or by error handling
    } catch (error: any) {
      // console.error("LoginForm: Erro no signInWithEmailAndPassword NO CLIENTE:", error);
      let errorMessage = "Credenciais inválidas ou erro ao fazer login.";
      if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        errorMessage = "E-mail ou senha incorretos.";
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = "Muitas tentativas de login falhadas. Tente novamente mais tarde."
      } else if (error.code === 'auth/user-disabled') {
        errorMessage = "Esta conta de usuário foi desabilitada.";
      }
      
      toast({
        title: "Erro de Login",
        description: errorMessage,
        variant: "destructive",
      });
      setLocalFormState(prev => ({ ...prev, message: errorMessage, success: false, isLoading: false }));
      form.reset({ email: values.email, password: '' });
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl font-headline">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
        {searchParams.get('message') && (
          <p className="text-sm text-green-600 bg-green-50 p-3 rounded-md border border-green-200 mt-2">
            {decodeURIComponent(searchParams.get('message')!)}
          </p>
        )}
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleEmailPasswordSubmit)} // No action prop needed here
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
            <SubmitButtonInternal text={submitButtonText} pending={localFormState.isLoading} />
            {localFormState.message && !localFormState.success && !form.formState.isSubmitted && !localFormState.isLoading && (
              <p className="text-sm font-medium text-destructive text-center">{localFormState.message}</p>
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
