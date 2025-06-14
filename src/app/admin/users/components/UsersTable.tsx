
"use client";

import { useState, useEffect } from 'react'; // useActionState, startTransition removed
import type { UserFirestoreData as User } from '@/lib/types'; 
// toggleAdminStatusAction removed
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CheckCircle, XCircle, Eye, UserCog, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth'; 

interface UsersTableProps {
  initialUsers: User[];
  isStaticExport?: boolean;
}

// ToggleAdminResult and initialActionState removed

export default function UsersTable({ initialUsers, isStaticExport = true }: UsersTableProps) {
  const [users, setUsers] = useState<User[]>(initialUsers);
  // adminActionState, handleToggleAdmin, isAdminTogglePending removed
  const [isTogglingAdmin, setIsTogglingAdmin] = useState<string | null>(null); // Local state for UI feedback
  const { toast } = useToast();
  const { user: currentAdminUser, isLoading: isAuthLoading } = useAuth(); 

  useEffect(() => {
    setUsers(initialUsers);
  }, [initialUsers]);

  const onToggleAdmin = (userId: string) => {
    if (isStaticExport) {
      toast({
        title: "Funcionalidade Indisponível",
        description: "A alteração de status de administrador não é suportada na exportação estática.",
        variant: "destructive",
      });
      return;
    }

    setIsTogglingAdmin(userId);
    // Client-side Firebase logic would go here for dynamic deployment
    console.log(`Attempting to toggle admin for user ${userId} (client-side simulation)`);
    toast({ title: "Simulação", description: `Tentativa de alterar admin para ${userId}.` });
    
    // Simulate API call and update UI
    setTimeout(() => {
      // This would be replaced by actual Firebase update and re-fetch or state update based on response
      const targetUser = users.find(u => u.id === userId);
      if (targetUser) {
        // Simulate check if this user is the only admin
        if (targetUser.isAdmin && users.filter(u => u.isAdmin).length === 1 && targetUser.id === currentAdminUser?.id) {
            toast({ title: "Erro", description: "Não é possível remover o status de administrador do único administrador.", variant: "destructive" });
        } else {
            setUsers(prevUsers =>
                prevUsers.map(u => u.id === userId ? { ...u, isAdmin: !u.isAdmin } : u)
            );
            toast({ title: "Sucesso (Simulado)", description: `Status de admin para ${targetUser.name} alterado.` });
        }
      }
      setIsTogglingAdmin(null);
    }, 1000);
  };

  const currentAdminId = currentAdminUser?.id;

  return (
    <div className="overflow-x-auto">
      {isStaticExport && (
        <div className="p-3 mb-4 text-sm text-orange-700 bg-orange-100 border border-orange-300 rounded-md">
            <strong>Modo de Demonstração Estática:</strong> Ações de gerenciamento de usuários estão desativadas.
        </div>
      )}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px] hidden sm:table-cell">ID</TableHead>
            <TableHead>Nome</TableHead>
            <TableHead>Email</TableHead>
            <TableHead className="text-center">Admin?</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => {
            const isThisUserTheOnlyAdmin = user.isAdmin && users.filter(u => u.isAdmin).length === 1 && user.id === currentAdminId;
            const disableToggle = !!isTogglingAdmin || (isThisUserTheOnlyAdmin && user.id === currentAdminId) || isAuthLoading || isStaticExport;
            const toggleTitle = isStaticExport 
                                ? "Gerenciamento de admin desativado em modo estático"
                                : (isThisUserTheOnlyAdmin && user.id === currentAdminId)
                                ? "Não é possível remover o status de administrador do único administrador."
                                : (user.isAdmin ? "Remover Admin" : "Tornar Admin");

            return (
              <TableRow key={user.id}>
                <TableCell className="font-medium hidden sm:table-cell truncate max-w-[100px]">{user.id}</TableCell>
                <TableCell>{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell className="text-center">
                  {user.isAdmin ? (
                    <Badge variant="default" className="bg-green-500 hover:bg-green-600">
                      <CheckCircle className="mr-1 h-4 w-4" /> Sim
                    </Badge>
                  ) : (
                    <Badge variant="secondary">
                      <XCircle className="mr-1 h-4 w-4" /> Não
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-right space-x-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/profile/${user.id}`} title="Ver Perfil">
                      <Eye className="h-4 w-4" />
                      <span className="sr-only sm:not-sr-only sm:ml-1">Perfil</span>
                    </Link>
                  </Button>
                  <Button
                    variant={user.isAdmin ? "destructive" : "outline"}
                    size="sm"
                    onClick={() => onToggleAdmin(user.id)}
                    disabled={disableToggle}
                    title={toggleTitle}
                  >
                    {isTogglingAdmin === user.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                       <UserCog className="h-4 w-4" />
                    )}
                    <span className="sr-only sm:not-sr-only sm:ml-1">{user.isAdmin ? 'Remover Admin' : 'Tornar Admin'}</span>
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
