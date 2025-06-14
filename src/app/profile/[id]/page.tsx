
import { getUserById, getAllUsers } from '@/lib/data'; // Now async, added getAllUsers
import type { UserFirestoreData as User } from '@/lib/types'; // Use UserFirestoreData as User
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import UserProfileClientView from './components/UserProfileClientView';
import { Timestamp } from 'firebase/firestore';
import type { Metadata } from 'next';

export async function generateStaticParams() {
  const users = await getAllUsers();
  return users.map((user) => ({
    id: user.id,
  }));
}

export async function generateMetadata({ params }: { params: { id: string } }) {
  const user = await getUserById(params.id); // Await async call
  if (!user) {
    return {
      title: 'Perfil Não Encontrado',
    };
  }
  return {
    title: `${user.name} | Perfil SmartAcessorios`,
    description: `Veja o perfil de ${user.name}. ${user.bio || ''}`,
  };
}

// Client-safe User structure for the prop
interface ClientSafeUserForPage extends Omit<User, 'createdAt' | 'updatedAt'> {
  createdAt?: string;
  updatedAt?: string;
}

export default async function UserProfilePage({ params }: { params: { id: string } }) {
  const profileUserRaw: User | undefined = await getUserById(params.id); // Await async call

  if (!profileUserRaw) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Card className="w-full max-w-md p-8 text-center">
          <CardHeader>
            <CardTitle className="text-2xl font-headline">Perfil Não Encontrado</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-6">
              Não conseguimos encontrar o perfil que você estava procurando.
            </p>
            <Button asChild>
              <Link href="/">
                <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para a Página Inicial
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Prepare user data for client (convert Timestamps to strings)
  const profileUser: ClientSafeUserForPage = {
    ...profileUserRaw,
    createdAt: profileUserRaw.createdAt instanceof Timestamp ? profileUserRaw.createdAt.toDate().toISOString() : (profileUserRaw.createdAt as any),
    updatedAt: profileUserRaw.updatedAt instanceof Timestamp ? profileUserRaw.updatedAt.toDate().toISOString() : (profileUserRaw.updatedAt as any),
  };

  return <UserProfileClientView profileUser={profileUser as any} />;
}
