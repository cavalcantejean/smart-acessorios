
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { ArrowLeft, Settings as SettingsIcon, KeyRound } from 'lucide-react';
import PasswordChangeSection from './components/PasswordChangeSection';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Configurações da Conta | SmartAcessorios',
  description: 'Gerencie suas configurações de conta, como alteração de senha.',
};

export default function UserSettingsPage() {
  // Client-side auth check will be handled by PasswordChangeSection or useAuth in a layout
  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-headline flex items-center gap-2">
            <SettingsIcon className="h-7 w-7 text-primary" />
            Configurações da Conta
          </h1>
          <p className="text-muted-foreground">Gerencie seus dados e preferências.</p>
        </div>
        <Button variant="outline" asChild size="sm">
          <Link href="/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar ao Painel
          </Link>
        </Button>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <KeyRound className="h-5 w-5 text-primary" />
            Alterar Senha
          </CardTitle>
          <CardDescription>
            Para sua segurança, recomendamos o uso de uma senha forte e única.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PasswordChangeSection />
        </CardContent>
      </Card>

      {/* Adicionar mais seções de configuração aqui no futuro */}
      {/* Ex:
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Atualizar Perfil</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Em breve...</p>
        </CardContent>
      </Card>
      */}
    </div>
  );
}

    