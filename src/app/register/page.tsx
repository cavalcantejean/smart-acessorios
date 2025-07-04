
import RegisterForm from "@/components/auth/RegisterForm";
// registerUserAction removed

export default function RegisterPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-12rem)] py-12">
      <RegisterForm
        // formAction prop removed
        title="Crie sua Conta"
        description="Cadastre-se para salvar seus acessórios favoritos e mais."
        submitButtonText="Criar Conta"
        linkToLogin={{
          href: "/login",
          text: "Já tem uma conta?",
          label: "Faça login"
        }}
      />
    </div>
  );
}
