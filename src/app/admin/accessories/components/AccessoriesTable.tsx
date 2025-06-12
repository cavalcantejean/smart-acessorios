
"use client";

import { useState, useEffect, useActionState, startTransition } from 'react';
import type { Accessory } from '@/lib/types';
import { deleteAccessoryAction, type AccessoryActionResult } from '../actions';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import Link from 'next/link';
import { Edit, Trash2, CheckCircle, XCircle, Loader2, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
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
} from "@/components/ui/alert-dialog";
import { Timestamp } from 'firebase/firestore';
import { useAuth } from '@/hooks/useAuth'; // Import useAuth

interface AccessoriesTableProps {
  initialAccessories: Accessory[];
}

const initialActionState: AccessoryActionResult = { success: false };

// Helper to convert Firestore Timestamp (or its plain object representation) to displayable date string
const formatDate = (timestampInput: any): string => {
  if (!timestampInput) return 'N/A';

  let date: Date;

  if (timestampInput instanceof Date) {
    date = timestampInput;
  } else if (timestampInput instanceof Timestamp) { // Client SDK Timestamp
    date = timestampInput.toDate();
  } else if (typeof timestampInput === 'string') {
    date = new Date(timestampInput); // Handles ISO strings
  } else if (typeof timestampInput === 'object' && timestampInput !== null &&
             typeof timestampInput.seconds === 'number' && typeof timestampInput.nanoseconds === 'number') {
    // Handle plain object from RSC serialization
    date = new Timestamp(timestampInput.seconds, timestampInput.nanoseconds).toDate();
  } else {
    console.warn("formatDate received unrecognized timestampInput in AccessoriesTable:", timestampInput);
    return 'Data inválida';
  }

  if (isNaN(date.getTime())) {
    console.warn("formatDate resulted in an invalid date for input in AccessoriesTable:", timestampInput);
    return 'Data inválida';
  }
  return date.toLocaleDateString('pt-BR');
};


export default function AccessoriesTable({ initialAccessories }: AccessoriesTableProps) {
  const [accessories, setAccessories] = useState<Accessory[]>(initialAccessories);
  const [deleteState, handleDeleteAction, isDeletePending] = useActionState(deleteAccessoryAction, initialActionState);
  const { toast } = useToast();
  const [accessoryToDelete, setAccessoryToDelete] = useState<Accessory | null>(null);
  const { user: authUser } = useAuth(); // Get authenticated user for userId

  useEffect(() => {
    setAccessories(initialAccessories);
  }, [initialAccessories]);

  useEffect(() => {
    if (deleteState?.message) {
      if (deleteState.success) {
        toast({
          title: "Sucesso!",
          description: deleteState.message,
        });
         if (accessoryToDelete) {
           setAccessories(prev => prev.filter(acc => acc.id !== accessoryToDelete.id));
         }
      } else if (!deleteState.success && deleteState.error) {
        toast({
          title: "Erro",
          description: deleteState.error,
          variant: "destructive",
        });
      }
      setAccessoryToDelete(null);
    }
  }, [deleteState, toast, accessoryToDelete]);

  const handleDeleteConfirm = () => {
    if (accessoryToDelete && authUser && authUser.id) {
      const formData = new FormData();
      formData.append('accessoryId', accessoryToDelete.id);
      formData.append('userId', authUser.id); // Add userId for admin check in action
      startTransition(() => {
        handleDeleteAction(formData);
      });
    } else if (!authUser?.id) {
        toast({ title: "Erro de Autenticação", description: "ID do usuário não encontrado. Faça login novamente.", variant: "destructive"});
    }
  };

  return (
    <AlertDialog open={!!accessoryToDelete} onOpenChange={(isOpen) => { if (!isOpen) setAccessoryToDelete(null); }}>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px] hidden sm:table-cell">Imagem</TableHead>
              <TableHead>Nome</TableHead>
              <TableHead className="hidden md:table-cell">Categoria</TableHead>
              <TableHead className="hidden lg:table-cell">Preço</TableHead>
              <TableHead className="text-center hidden sm:table-cell">É Oferta?</TableHead>
               <TableHead className="hidden lg:table-cell">Criado em</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {accessories.length > 0 ? (
              accessories.map((accessory) => (
                <TableRow key={accessory.id}>
                  <TableCell className="hidden sm:table-cell">
                    <div className="relative h-12 w-12 rounded-md overflow-hidden">
                      <Image
                        src={accessory.imageUrl}
                        alt={accessory.name}
                        fill
                        style={{ objectFit: 'cover' }}
                        sizes="48px"
                        data-ai-hint={accessory.imageHint || "product accessory"}
                      />
                    </div>
                  </TableCell>
                  <TableCell className="font-medium max-w-[200px] truncate">
                      <Link href={`/accessory/${accessory.id}`} target="_blank" className="hover:underline" title={accessory.name}>
                          {accessory.name} <ExternalLink className="inline h-3 w-3 ml-0.5 text-muted-foreground"/>
                      </Link>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">{accessory.category || 'N/A'}</TableCell>
                  <TableCell className="hidden lg:table-cell">
                    {accessory.price ? `R$${accessory.price.replace('.', ',')}` : 'N/A'}
                  </TableCell>
                  <TableCell className="text-center hidden sm:table-cell">
                    {accessory.isDeal ? (
                      <Badge variant="default" className="bg-green-500 hover:bg-green-600">
                        <CheckCircle className="mr-1 h-3.5 w-3.5" /> Sim
                      </Badge>
                    ) : (
                      <Badge variant="secondary">
                        <XCircle className="mr-1 h-3.5 w-3.5" /> Não
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-xs">
                    {formatDate(accessory.createdAt)}
                  </TableCell>
                  <TableCell className="text-right space-x-1 sm:space-x-2">
                    <Button variant="outline" size="icon" asChild title="Editar Acessório">
                      <Link href={`/admin/accessories/${accessory.id}/edit`}>
                        <Edit className="h-4 w-4" />
                      </Link>
                    </Button>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => setAccessoryToDelete(accessory)}
                        disabled={isDeletePending && accessoryToDelete?.id === accessory.id}
                        title="Excluir Acessório"
                      >
                        {isDeletePending && accessoryToDelete?.id === accessory.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </AlertDialogTrigger>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                  Nenhum acessório encontrado. Verifique as permissões de leitura no Firestore ou adicione novos acessórios.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <AlertDialogContent>
        {accessoryToDelete && (
          <>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja excluir o acessório "{accessoryToDelete.name}"? Esta ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeletePending}>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteConfirm}
                disabled={isDeletePending || !authUser?.id}
                className="bg-destructive hover:bg-destructive/90"
              >
                {isDeletePending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Excluir
              </AlertDialogAction>
            </AlertDialogFooter>
          </>
        )}
      </AlertDialogContent>
    </AlertDialog>
  );
}
