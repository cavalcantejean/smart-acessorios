
import { getUserByIdAdmin, getAllUsersAdmin } from '@/lib/data-admin'; // Now async, added getAllUsersAdmin
import type { UserFirestoreData as User } from '@/lib/types'; // Use UserFirestoreData as User
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import UserProfileClientView from './components/UserProfileClientView';
// import { Timestamp } from 'firebase/firestore'; // No longer needed
import type { Metadata } from 'next';

export async function generateStaticParams() {
  const users = await getAllUsersAdmin();
  return users.map((user) => ({
    id: user.id,
  }));
}

export async function generateMetadata({ params }: { params: { id: string } }) {
  const user = await getUserByIdAdmin(params.id); // Await async call
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
  const profileUserRaw: User | undefined = await getUserByIdAdmin(params.id); // Await async call

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
  const convertToISO = (dateField: Date | string | undefined): string | undefined => {
    if (!dateField) return undefined;
    if (typeof dateField === 'string') return dateField; // Assume already ISO string
    if (dateField instanceof Date) return dateField.toISOString();
    // Fallback for any other unexpected type
    return String(dateField);
  };

  const profileUser: ClientSafeUserForPage = {
    ...profileUserRaw,
    createdAt: convertToISO(profileUserRaw.createdAt),
    updatedAt: convertToISO(profileUserRaw.updatedAt),
  };

  return <UserProfileClientView profileUser={profileUser as any} />;
}
