
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
import { Loader2, LogIn, KeyRound } from "lucide-react"; // Import KeyRound or Google icon
import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from '@/hooks/useAuth';
import { useRouter, useSearchParams } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { Separator } from "@/components/ui/separator";

// Google Icon SVG as a React Component
const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" width="20" height="20" {...props}>
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      fill="#EA4335"
    />
    <path d="M1 1h22v22H1z" fill="none" />
  </svg>
);


const loginFormSchema = z.object({
  email: z.string().email({ message: "Por favor, insira um e-mail válido." }),
  password: z.string().min(1, { message: "A senha é obrigatória." }),
});

type LoginFormValues = z.infer<typeof loginFormSchema>;

interface LocalFormState {
  message: string;
  success: boolean;
  isLoading: boolean;
  isGoogleLoading: boolean; // Para o botão do Google
}

const initialLocalState: LocalFormState = {
  message: "",
  success: false,
  isLoading: false,
  isGoogleLoading: false,
};

interface LoginFormProps {
  formAction?: (prevState: any, formData: FormData) => Promise<any>;
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
        <KeyRound className="mr-2 h-4 w-4" /> // Mudei para KeyRound para ser genérico
      )}
      {text}
    </Button>
  );
}

export default function LoginForm({ title, description, submitButtonText, linkToRegister }: LoginFormProps) {
  const [localFormState, setLocalFormState] = useState<LocalFormState>(initialLocalState);
  const { toast } = useToast();
  const { isAuthenticated, isLoading: isAuthLoading, user, signInWithGoogle } = useAuth();
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
    console.log(`LoginForm: useEffect[isAuthenticated, isAuthLoading, user] disparado. isAuthenticated: ${isAuthenticated}, isAuthLoading: ${isAuthLoading}, User: ${user?.name}`);
    if (!isAuthLoading && isAuthenticated && user) {
      const redirectTo = searchParams.get('redirect') || (user.isAdmin ? '/admin/dashboard' : '/dashboard');
      console.log("LoginForm: Autenticado e não carregando. Redirecionando para:", redirectTo);
      router.replace(redirectTo);
    } else if (!isAuthLoading && !isAuthenticated) {
      console.log("LoginForm: Não autenticado e não carregando. Nenhuma ação de redirecionamento.");
    } else {
      console.log("LoginForm: Ainda carregando autenticação ou estado de usuário não totalmente definido.");
    }
  }, [isAuthenticated, isAuthLoading, user, router, searchParams]);

  const handleEmailPasswordSubmit = async (values: LoginFormValues) => {
    console.log("LoginForm: handleEmailPasswordSubmit iniciado com valores:", values);
    setLocalFormState(prev => ({ ...prev, message: "", success: false, isLoading: true }));

    try {
      const lowercasedEmail = values.email.toLowerCase();
      console.log("LoginForm: Chamando signInWithEmailAndPassword no CLIENTE para:", lowercasedEmail);
      await signInWithEmailAndPassword(auth, lowercasedEmail, values.password);
      
      console.log("LoginForm: signInWithEmailAndPassword NO CLIENTE bem-sucedido.");
      toast({
        title: "Login Bem-Sucedido!",
        description: "Sincronizando seus dados...",
      });
      // Não precisa definir isLoading: false aqui, o useEffect[isAuthenticated] cuidará do redirecionamento
      // setLocalFormState(prev => ({ ...prev, message: "Login bem-sucedido! Sincronizando...", success: true, isLoading: false }));
    } catch (error: any) {
      console.error("LoginForm: Erro no signInWithEmailAndPassword NO CLIENTE:", error);
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

  const handleGoogleSignIn = async () => {
    console.log("LoginForm: handleGoogleSignIn chamado.");
    setLocalFormState(prev => ({ ...prev, message: "", success: false, isGoogleLoading: true }));
    try {
      const result = await signInWithGoogle();
      if (result && result.user) {
        console.log("LoginForm: Google Sign-In bem-sucedido. Usuário:", result.user.uid);
        toast({
          title: "Login com Google Bem-Sucedido!",
          description: `Bem-vindo(a), ${result.user.displayName || 'Usuário'}! Sincronizando...`,
        });
        // O useEffect[isAuthenticated] cuidará do redirecionamento.
      } else {
        // Isso pode acontecer se o popup for fechado, por exemplo.
        // signInWithGoogle no useAuth já lida com alguns desses logs.
        console.log("LoginForm: Google Sign-In não resultou em um usuário ou foi cancelado.");
        // Não mostrar erro aqui se o popup foi apenas fechado. Erros específicos são logados em useAuth.
      }
    } catch (error) { // Erros já são tratados em signInWithGoogle, mas um catch geral é bom.
      console.error("LoginForm: Erro inesperado durante Google Sign-In:", error);
      toast({
        title: "Erro no Login com Google",
        description: "Não foi possível fazer login com o Google. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLocalFormState(prev => ({ ...prev, isGoogleLoading: false }));
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
            onSubmit={form.handleSubmit(handleEmailPasswordSubmit)}
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

        <Separator className="my-6">
          <span className="px-2 text-xs text-muted-foreground bg-background">OU</span>
        </Separator>

        <Button
          variant="outline"
          className="w-full"
          onClick={handleGoogleSignIn}
          disabled={localFormState.isGoogleLoading || localFormState.isLoading}
        >
          {localFormState.isGoogleLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <GoogleIcon className="mr-2" />
          )}
          Entrar com Google
        </Button>

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
