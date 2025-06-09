
import { getUserById } from '@/lib/data';
import type { User } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import UserProfileClientView from './components/UserProfileClientView'; // Novo componente

export async function generateMetadata({ params }: { params: { id: string } }) {
  const user = getUserById(params.id);
  if (!user) {
    return {
      title: 'Perfil Não Encontrado',
    };
  }
  return {
    title: `${user.name} | Perfil SmartAcessorios`,
    description: `Veja o perfil de ${user.name}, seus seguidores e quem ele segue. ${user.bio || ''}`,
  };
}

export default async function UserProfilePage({ params }: { params: { id: string } }) {
  const profileUser: User | undefined = getUserById(params.id);

  if (!profileUser) {
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

  return <UserProfileClientView profileUser={profileUser} />;
}
