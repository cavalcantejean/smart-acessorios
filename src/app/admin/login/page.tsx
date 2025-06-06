
import LoginForm from "@/components/auth/LoginForm";
import { loginAdminAction } from "./actions";

export default function AdminLoginPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-12rem)] py-12">
      <LoginForm
        formAction={loginAdminAction}
        title="Login de Administrador"
        description="Acesse o painel de administração."
        submitButtonText="Entrar como Admin"
        // No link to register for admin login by default, can be added if needed
        // linkToRegister={{ 
        //   href: "/admin/register", 
        //   text: "Não tem uma conta de admin?",
        //   label: "Registre-se como Admin" 
        // }}
      />
    </div>
  );
}
