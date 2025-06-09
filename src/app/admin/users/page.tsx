
import { getAllUsers } from '@/lib/data';
import type { User } from '@/lib/types';
import UsersTable from './components/UsersTable';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, UsersIcon } from 'lucide-react';
import type { Metadata } from 'next';

// Note: Auth checks for admin pages are typically handled in a layout or higher-order component,
// or via middleware. For this page, we'll assume the admin layout handles redirection if not admin.
// Alternatively, add explicit checks using useAuth if this page were a client component,
// or server-side session checks.

export const metadata: Metadata = {
  title: 'Gerenciar Usuários | Admin SmartAcessorios',
  description: 'Visualize e gerencie todos os usuários da plataforma.',
};


export default async function ManageUsersPage() {
  const users: User[] = getAllUsers();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-headline flex items-center gap-2">
            <UsersIcon className="h-8 w-8 text-primary" />
            Gerenciar Usuários
          </h1>
          <p className="text-muted-foreground">Visualize e gerencie todos os usuários da plataforma.</p>
        </div>
        <Button variant="outline" asChild size="sm">
          <Link href="/admin/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar ao Painel Admin
          </Link>
        </Button>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Lista de Usuários</CardTitle>
          <CardDescription>
            Total de usuários cadastrados: {users.length}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {users.length > 0 ? (
            <UsersTable initialUsers={users} />
          ) : (
            <p className="text-muted-foreground text-center py-8">Nenhum usuário encontrado.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
