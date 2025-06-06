
import LoginForm from "@/components/auth/LoginForm";
import { loginUserAction } from "./actions";

export default function LoginPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-12rem)] py-12">
      <LoginForm
        formAction={loginUserAction}
        title="Login de Usuário"
        description="Acesse sua conta para encontrar os melhores acessórios."
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
