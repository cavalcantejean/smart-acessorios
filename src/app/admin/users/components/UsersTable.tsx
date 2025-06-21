
"use server";

import { useState, useEffect, useTransition } from 'react'; // useTransition added
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
// Firebase client imports for toggle admin removed:
// import { db } from '@/lib/firebase';
// import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import {
  toggleAdminStatusAction,
  type UserAdminActionResult,
  deleteUserAction, // Added
  type UserDeleteActionResult // Added
} from '@/app/admin/users/actions';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"; // Added AlertDialog components
import { Trash2 } from 'lucide-react'; // Added Trash2 icon

interface UsersTableProps {
  initialUsers: User[];
  // isStaticExport?: boolean; // Removed
}

// ToggleAdminResult and initialActionState removed

export default function UsersTable({ initialUsers }: UsersTableProps) { // isStaticExport removed from params
  const [users, setUsers] = useState<User[]>(initialUsers); // Will be updated by revalidation
  const [isTogglingAdmin, setIsTogglingAdmin] = useState<string | null>(null); // For local button loading state only
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [isProcessingDelete, setIsProcessingDelete] = useState(false);
  const { toast } = useToast();
  const { user: currentAdminUser, isLoading: isAuthLoading, isAuthenticated } = useAuth();
  const [isApiTransitionPending, startApiTransition] = useTransition(); // Corrected


  useEffect(() => {
    setUsers(initialUsers);
  }, [initialUsers]);

  const onToggleAdmin = async (userIdToToggle: string) => {
    // isStaticExport check removed as prop will be removed or always false.
    if (!isAuthenticated || !currentAdminUser?.id) {
      toast({ title: "Não autenticado", description: "Você precisa estar logado como administrador.", variant: "destructive" });
      return;
    }

    const targetUser = users.find(u => u.id === userIdToToggle);
    if (!targetUser) {
      toast({ title: "Erro", description: "Usuário não encontrado.", variant: "destructive" });
      return;
    }

    // Client-side check: Prevent current admin from removing their own status if they are the sole admin
    const adminUsers = users.filter(u => u.isAdmin === true);
    if (currentAdminUser.id === userIdToToggle && targetUser.isAdmin && adminUsers.length === 1) {
      toast({
        title: "Ação Não Permitida",
        description: "Você não pode remover seu próprio status de administrador pois é o único administrador no sistema.",
        variant: "destructive",
      });
      return;
    }

    setIsTogglingAdmin(userIdToToggle); // For immediate UI feedback on the button
    startApiTransition(async () => {
      const result: UserAdminActionResult = await toggleAdminStatusAction(userIdToToggle, currentAdminUser.id);

      if (result.success) {
        toast({ title: "Sucesso!", description: result.message });
        // Data revalidation is handled by revalidatePath in the server action.
        // No local setUsers(..) needed for the toggle.
      } else {
        toast({
          title: "Erro ao Alterar Status",
          description: result.message || "Ocorreu um erro desconhecido.",
          variant: "destructive",
        });
      }
      setIsTogglingAdmin(null);
    });
  };

  const handleDeleteUserConfirm = async () => {
    // isStaticExport check removed
    if (!isAuthenticated || !currentAdminUser?.id) {
      toast({ title: "Não autenticado", description: "Você precisa estar logado como administrador.", variant: "destructive" });
      setUserToDelete(null);
      return;
    }
    if (!userToDelete) {
      toast({ title: "Erro Interno", description: "Nenhum usuário selecionado para exclusão.", variant: "destructive" });
      return;
    }

    if (currentAdminUser.id === userToDelete.id) {
      toast({
        title: "Ação Não Permitida",
        description: "Administradores não podem excluir suas próprias contas através deste painel.",
        variant: "destructive",
      });
      setUserToDelete(null);
      return;
    }

    setIsProcessingDelete(true); // For button loading state
    startApiTransition(async () => {
      const result: UserDeleteActionResult = await deleteUserAction(userToDelete.id, currentAdminUser.id);

      if (result.success) {
        toast({ title: "Sucesso!", description: result.message });
        // Data revalidation is handled by revalidatePath in the server action.
        // No local setUsers(..) needed for removal.
      } else {
        toast({
          title: "Erro ao Excluir Usuário",
          description: result.message || "Ocorreu um erro desconhecido.",
          variant: "destructive",
        });
      }
      setIsProcessingDelete(false);
      setUserToDelete(null);
    });
  };

  const currentAdminId = currentAdminUser?.id;

  return (
    <>
      {/* isStaticExport message div removed */}
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
            const isThisUserTheOnlyAdmin = user.isAdmin && users.filter(u => u.isAdmin).length === 1 && user.id === currentAdminId;
            const isCurrentUserBeingToggled = isTogglingAdmin === user.id;

            const disableAdminToggle = isApiTransitionPending || isCurrentUserBeingToggled || (isThisUserTheOnlyAdmin && user.id === currentAdminId) || isAuthLoading;
            const adminToggleTitle = (isThisUserTheOnlyAdmin && user.id === currentAdminId)
                                ? "Não é possível remover o status de administrador do único administrador."
                                : (user.isAdmin ? "Remover Admin" : "Tornar Admin");

            const disableDelete = isApiTransitionPending || isCurrentUserBeingToggled || isAuthLoading || currentAdminUser?.id === user.id;
            const deleteTitle = currentAdminUser?.id === user.id
                                ? "Não é possível excluir a própria conta"
                                : "Excluir Usuário";


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
                    variant={user.isAdmin ? "outline" : "outline"} // Changed admin toggle to outline from destructive
                    size="sm"
                    onClick={() => onToggleAdmin(user.id)}
                    disabled={disableAdminToggle}
                    title={adminToggleTitle}
                    className={user.isAdmin ? "border-yellow-500 hover:border-yellow-600 text-yellow-600 hover:text-yellow-700" : ""}
                  >
                    {isCurrentUserBeingToggled && isApiTransitionPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                       <UserCog className="h-4 w-4" />
                    )}
                    <span className="sr-only sm:not-sr-only sm:ml-1">{user.isAdmin ? 'Remover Admin' : 'Tornar Admin'}</span>
                  </Button>
                  {/* AlertDialogTrigger asChild removed */}
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setUserToDelete(user)} // This sets the state to open the dialog
                    disabled={disableDelete}
                    title={deleteTitle}
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only sm:not-sr-only sm:ml-1">Excluir</span>
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>

    <AlertDialog open={!!userToDelete} onOpenChange={(isOpen) => { if (!isOpen) setUserToDelete(null); }}>
      <AlertDialogContent>
        {userToDelete && (
          <>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja excluir permanentemente o usuário "{userToDelete.name}" ({userToDelete.email})?
                Esta ação removerá o usuário da autenticação e todos os seus dados associados no banco de dados.
                Esta ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isProcessingDelete || isApiTransitionPending}>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteUserConfirm}
                disabled={isProcessingDelete || isApiTransitionPending || currentAdminUser?.id === userToDelete?.id}
                className="bg-destructive hover:bg-destructive/90"
              >
                {isProcessingDelete || isApiTransitionPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Excluir Permanentemente
              </AlertDialogAction>
            </AlertDialogFooter>
          </>
        )}
      </AlertDialogContent>
    </AlertDialog>
    </>
  );
}
