
import { getAllUsers } from '@/lib/data'; 
import type { UserFirestoreData as User } from '@/lib/types'; 
import UsersTable from './components/UsersTable';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, UsersIcon } from 'lucide-react';
import type { Metadata } from 'next';
import { Timestamp } from 'firebase/firestore';


export const metadata: Metadata = {
  title: 'Gerenciar Usuários | Admin SmartAcessorios',
  description: 'Visualize e gerencie todos os usuários da plataforma.',
};

const prepareUserForClient = (user: User): User => {
  const convertDate = (dateValue: any): string | undefined => {
    if (dateValue instanceof Timestamp) {
      return dateValue.toDate().toISOString();
    }
    if (dateValue instanceof Date) {
      return dateValue.toISOString();
    }
    if (typeof dateValue === 'string') {
      // Optionally, validate if it's an ISO string, but for now, assume it is.
      // Could also attempt to parse and re-format to ensure consistency:
      // try { return new Date(dateValue).toISOString(); } catch { return undefined; }
      return dateValue;
    }
    // If it's null, undefined, or any other type, return undefined or handle as error
    return undefined;
  };

  return {
    ...user,
    createdAt: convertDate(user.createdAt),
    updatedAt: convertDate(user.updatedAt),
  } as User; // Keep 'as User' but the date fields are now more reliably string | undefined
};


export default async function ManageUsersPage() {
  const rawUsers: User[] = await getAllUsers(); 
  const users = rawUsers.map(prepareUserForClient);


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
            <UsersTable initialUsers={users} isStaticExport={false} />
          ) : (
            <p className="text-muted-foreground text-center py-8">Nenhum usuário encontrado.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
