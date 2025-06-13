
import { getAllUsers } from '@/lib/data'; // Now async
import type { UserFirestoreData as User } from '@/lib/types'; // Use UserFirestoreData as User
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

// Helper to prepare user data for client (convert Timestamps)
const prepareUserForClient = (user: User): User => {
  return {
    ...user,
    createdAt: user.createdAt instanceof Timestamp ? user.createdAt.toDate().toISOString() : (user.createdAt as any),
    updatedAt: user.updatedAt instanceof Timestamp ? user.updatedAt.toDate().toISOString() : (user.updatedAt as any),
    followers: Array.isArray(user.followers) ? user.followers : [],
    following: Array.isArray(user.following) ? user.following : [],
    badges: Array.isArray(user.badges) ? user.badges : [],
  } as User;
};


export default async function ManageUsersPage() {
  const rawUsers: User[] = await getAllUsers(); // Await async call
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
            <UsersTable initialUsers={users} />
          ) : (
            <p className="text-muted-foreground text-center py-8">Nenhum usuário encontrado.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
