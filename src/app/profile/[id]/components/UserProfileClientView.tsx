
"use server";

import { useState, useEffect } from 'react';
import type { UserFirestoreData as User, Accessory } from '@/lib/types';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, UserCircle, Loader2, ExternalLinkIcon } from 'lucide-react';
import { AuthProviderClientComponent } from '@/components/AuthProviderClientComponent';
// Removed badge related imports: Award, getBadgeById, ShadBadge, Tooltip, TooltipContent, TooltipProvider, TooltipTrigger
// import { getUserById } from '@/lib/data';
import { Separator } from '@/components/ui/separator';
import { Timestamp } from 'firebase/firestore';

interface ClientUser extends Omit<User, 'createdAt' | 'updatedAt'> {
  createdAt?: string;
  updatedAt?: string;
}

interface UserProfileClientViewProps {
  profileUser: ClientUser;
}

export default function UserProfileClientView({ profileUser: initialProfileUser }: UserProfileClientViewProps) {
  const [profileUser, setProfileUser] = useState<ClientUser>(initialProfileUser);

  useEffect(() => {
    setProfileUser(initialProfileUser);
  }, [initialProfileUser]);

  return (
    <AuthProviderClientComponent>
      {({ user: currentUser, isAuthenticated }) => (
        <div className="max-w-3xl mx-auto py-8 px-4">
          <Card className="overflow-hidden shadow-xl">
            <CardHeader className="p-6 bg-muted/30 border-b text-center">
              <div className="relative w-32 h-32 mx-auto rounded-full overflow-hidden border-4 border-background shadow-lg mb-4">
                {profileUser.avatarUrl ? (
                  <Image
                    src={profileUser.avatarUrl}
                    alt={profileUser.name}
                    fill
                    style={{ objectFit: 'cover' }}
                    sizes="128px"
                    priority
                    data-ai-hint={profileUser.avatarHint || "user avatar"}
                  />
                ) : (
                  <div className="w-full h-full bg-secondary flex items-center justify-center">
                    <UserCircle className="h-20 w-20 text-muted-foreground" />
                  </div>
                )}
              </div>
              <CardTitle className="text-3xl font-headline">{profileUser.name}</CardTitle>
              {profileUser.isAdmin && (
                <p className="text-sm text-primary font-semibold">Administrador</p>
              )}
              {profileUser.bio && (
                <CardDescription className="mt-2 text-foreground/80 max-w-md mx-auto">{profileUser.bio}</CardDescription>
              )}
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {/* Badge Section Removed */}
            </CardContent>
            <CardFooter className="p-4 bg-secondary/20 border-t">
               <Button variant="outline" size="sm" asChild className="mx-auto"><Link href="/"><ArrowLeft className="mr-2 h-4 w-4" /> Voltar para a Página Inicial</Link></Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </AuthProviderClientComponent>
  );
}
