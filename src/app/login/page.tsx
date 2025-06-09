
import LoginForm from "@/components/auth/LoginForm";
import { loginUserAction } from "./actions"; // This is now the unified login action

export default function LoginPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-12rem)] py-12">
      <LoginForm
        formAction={loginUserAction} // Use the unified action
        title="Acessar Conta" // More generic title
        description="Entre com suas credenciais para continuar."
        submitButtonText="Entrar"
        linkToRegister={{ 
          href: "/register", 
          text: "Não tem uma conta?",
          label: "Cadastre-se" 
        }}
      />
    </div>
  );
}
