
import LoginForm from "@/components/auth/LoginForm";
import { Suspense } from 'react';
import { Loader2 } from 'lucide-react'; // For a more visual fallback
import { Card, CardContent, CardHeader } from '@/components/ui/card'; // For styling fallback

// A simple loading skeleton or a message for the fallback
function LoginFormLoadingFallback() {
  return (
    <Card className="w-full max-w-md mx-auto shadow-xl">
      <CardHeader className="text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mb-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
         <div className="h-6 bg-muted rounded w-3/4 mx-auto mb-2"></div>
         <div className="h-4 bg-muted rounded w-1/2 mx-auto"></div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
            <div className="h-4 bg-muted rounded w-1/4"></div>
            <div className="h-10 bg-muted rounded w-full"></div>
        </div>
        <div className="space-y-2">
            <div className="h-4 bg-muted rounded w-1/4"></div>
            <div className="h-10 bg-muted rounded w-full"></div>
        </div>
        <div className="h-10 bg-primary/50 rounded w-full mt-6"></div>
         <div className="mt-6 text-center text-sm">
            <div className="h-4 bg-muted rounded w-3/4 mx-auto"></div>
          </div>
      </CardContent>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-12rem)] py-12">
      <Suspense fallback={<LoginFormLoadingFallback />}>
        <LoginForm
          title="Acessar Conta"
          description="Entre com suas credenciais para continuar."
          submitButtonText="Entrar"
          linkToRegister={{
            href: "/register",
            text: "Não tem uma conta?",
            label: "Cadastre-se"
          }}
        />
      </Suspense>
    </div>
  );
}
