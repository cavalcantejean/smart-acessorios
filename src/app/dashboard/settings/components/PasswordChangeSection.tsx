
"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { PasswordChangeSchema, type PasswordChangeFormValues } from '@/lib/schemas/user-settings-schema';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { Loader2, Save } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { EmailAuthProvider, reauthenticateWithCredential, updatePassword } from 'firebase/auth';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from 'lucide-react';

export default function PasswordChangeSection() {
  const { firebaseUser, logout } = useAuth(); // firebaseUser é o User do Firebase Auth
  const { toast } = useToast();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const form = useForm<PasswordChangeFormValues>({
    resolver: zodResolver(PasswordChangeSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmNewPassword: '',
    },
  });

  const onSubmit = async (values: PasswordChangeFormValues) => {
    if (!firebaseUser || !firebaseUser.email) {
      toast({
        title: "Erro",
        description: "Usuário não autenticado ou e-mail não encontrado.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setFormError(null);

    try {
      // 1. Criar credencial com a senha atual
      const credential = EmailAuthProvider.credential(firebaseUser.email, values.currentPassword);

      // 2. Reautenticar o usuário
      await reauthenticateWithCredential(firebaseUser, credential);
      toast({ title: "Reautenticação bem-sucedida", description: "Agora atualizando sua senha..." });

      // 3. Atualizar a senha
      await updatePassword(firebaseUser, values.newPassword);

      toast({
        title: "Senha Alterada com Sucesso!",
        description: "Sua senha foi atualizada. Por favor, faça login novamente.",
      });
      form.reset();
      
      // Deslogar e redirecionar para login é uma boa prática de segurança aqui
      await logout(); // A função logout já redireciona para a home
      router.push('/login?message=Senha%20alterada.%20Faça%20login%20novamente.');


    } catch (error: any) {
      console.error("Erro ao alterar senha:", error);
      let errorMessage = "Ocorreu um erro ao tentar alterar sua senha. Tente novamente.";
      if (error.code === 'auth/wrong-password') {
        errorMessage = "A senha atual fornecida está incorreta.";
        form.setError("currentPassword", { type: "manual", message: errorMessage });
      } else if (error.code === 'auth/requires-recent-login') {
        errorMessage = "Esta operação é sensível e requer autenticação recente. Por favor, faça login novamente e tente outra vez.";
        // Poderia forçar logout aqui ou pedir para o usuário deslogar e logar
      } else if (error.code === 'auth/weak-password') {
        errorMessage = "A nova senha é muito fraca. Escolha uma senha mais forte.";
        form.setError("newPassword", { type: "manual", message: errorMessage });
      }
      setFormError(errorMessage); // Define o erro geral do formulário
      toast({
        title: "Erro ao Alterar Senha",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!firebaseUser) {
    // Idealmente, esta página seria protegida por um layout que já redireciona se não estiver autenticado
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Acesso Negado</AlertTitle>
        <AlertDescription>
          Você precisa estar logado para acessar as configurações da conta.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {formError && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Erro</AlertTitle>
            <AlertDescription>{formError}</AlertDescription>
          </Alert>
        )}
        <FormField
          control={form.control}
          name="currentPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Senha Atual</FormLabel>
              <FormControl>
                <Input type="password" placeholder="Sua senha atual" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="newPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nova Senha</FormLabel>
              <FormControl>
                <Input type="password" placeholder="Pelo menos 6 caracteres" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="confirmNewPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirmar Nova Senha</FormLabel>
              <FormControl>
                <Input type="password" placeholder="Repita a nova senha" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          Salvar Nova Senha
        </Button>
      </form>
    </Form>
  );
}

    