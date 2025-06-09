
"use client";

import { useState, useEffect, useActionState, startTransition } from 'react';
import type { User } from '@/lib/types';
import { toggleAdminStatusAction } from '../actions';
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

interface UsersTableProps {
  initialUsers: User[];
}

interface ToggleAdminResult {
  success: boolean;
  user?: User | null;
  message?: string;
  error?: string;
}

const initialActionState: ToggleAdminResult = { success: false };

export default function UsersTable({ initialUsers }: UsersTableProps) {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [adminActionState, handleToggleAdmin, isAdminTogglePending] = useActionState(toggleAdminStatusAction, initialActionState);
  const { toast } = useToast();

  useEffect(() => {
    setUsers(initialUsers);
  }, [initialUsers]);

  useEffect(() => {
    if (adminActionState?.message) {
      if (adminActionState.success && adminActionState.user) {
        toast({
          title: "Sucesso!",
          description: adminActionState.message,
        });
        // Update local state optimistically or based on returned user
        setUsers(prevUsers => 
          prevUsers.map(u => u.id === adminActionState.user!.id ? adminActionState.user! : u)
        );
      } else if (!adminActionState.success && adminActionState.error) {
        toast({
          title: "Erro",
          description: adminActionState.error,
          variant: "destructive",
        });
      }
    }
  }, [adminActionState, toast]);

  const onToggleAdmin = (userId: string) => {
    const formData = new FormData();
    formData.append('userId', userId);
    startTransition(() => {
        handleToggleAdmin(formData);
    });
  };
  
  // In a real app, you'd get the current admin's ID from auth context
  // For this mock, let's assume 'admin-1' is the ID of the currently logged-in admin.
  // This is a simplification for the self-demotion prevention.
  const currentAdminId = 'admin-1'; 

  return (
    <div className="overflow-x-auto">
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
            const isCurrentUserTheOnlyAdmin = user.isAdmin && users.filter(u => u.isAdmin).length === 1 && user.id === currentAdminId;
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
                    disabled={isAdminTogglePending || (isCurrentUserTheOnlyAdmin && user.id === currentAdminId) } // Disable if current user is the only admin and it's them
                    title={isCurrentUserTheOnlyAdmin && user.id === currentAdminId ? "Não é possível remover o status de administrador do único administrador." : (user.isAdmin ? "Remover Admin" : "Tornar Admin")}
                  >
                    {isAdminTogglePending && adminActionState?.user?.id === user.id ? (
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
