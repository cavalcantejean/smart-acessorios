"use client";

import { useState, useEffect, useTransition } from 'react';
import type { Accessory } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
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
// import { useAuth } from '@/hooks/useAuth'; // <-- REMOVIDO
import { deleteAccessoryAction, type AccessoryActionResult } from '@/app/admin/accessories/actions';

interface AccessoriesTableProps {
  initialAccessories: Accessory[];
  isAuthenticated: boolean; // <-- ADICIONADO A PROP
}

const formatDate = (timestampInput: any): string => {
  // ... (função formatDate continua a mesma)
  if (!timestampInput) return 'N/A';
  let date: Date;
  if (timestampInput instanceof Date) date = timestampInput;
  else if (timestampInput instanceof Timestamp) date = timestampInput.toDate();
  else if (typeof timestampInput === 'string') date = new Date(timestampInput);
  else if (typeof timestampInput === 'object' && timestampInput !== null && typeof timestampInput.seconds === 'number' && typeof timestampInput.nanoseconds === 'number') {
    date = new Timestamp(timestampInput.seconds, timestampInput.nanoseconds).toDate();
  } else {
    return 'Data inválida';
  }
  if (isNaN(date.getTime())) return 'Data inválida';
  return date.toLocaleDateString('pt-BR');
};

export default function AccessoriesTable({ initialAccessories, isAuthenticated }: AccessoriesTableProps) { // <-- Recebe a prop aqui
  const [accessories, setAccessories] = useState<Accessory[]>(initialAccessories);
  const { toast } = useToast();
  const [accessoryToDelete, setAccessoryToDelete] = useState<Accessory | null>(null);
  // const { user: authUser, isAuthenticated } = useAuth(); // <-- LINHA REMOVIDA
  const [isDeletePending, setIsDeletePending] = useState(false);
  const [isTransitioning, startTransition] = useTransition();

  useEffect(() => {
    setAccessories(initialAccessories);
  }, [initialAccessories]);

  const handleDeleteConfirm = async () => {
    // A verificação agora usa a prop `isAuthenticated`
    if (!isAuthenticated) {
      toast({ title: "Não autenticado", description: "Sua sessão pode ter expirado. Por favor, faça login novamente.", variant: "destructive" });
      setAccessoryToDelete(null);
      return;
    }

    if (!accessoryToDelete) {
      toast({ title: "Erro Interno", description: "Nenhum acessório selecionado para exclusão.", variant: "destructive" });
      return;
    }

    setIsDeletePending(true);
    startTransition(async () => {
      const result: AccessoryActionResult = await deleteAccessoryAction(accessoryToDelete.id);
      if (result.success) {
        toast({ title: "Sucesso!", description: result.message });
      } else {
        toast({
          title: "Erro ao Excluir",
          description: result.message || "Ocorreu um erro desconhecido.",
          variant: "destructive",
        });
      }
      setIsDeletePending(false);
      setAccessoryToDelete(null);
    });
  };

  // O resto do seu JSX continua exatamente o mesmo...
  return (
    <AlertDialog open={!!accessoryToDelete} onOpenChange={(isOpen) => { if (!isOpen) setAccessoryToDelete(null); }}>
      <div className="overflow-x-auto">
        <Table>
          {/* ... TableHeader ... */}
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
          {/* ... TableBody ... */}
          <TableBody>
            {accessories.map((accessory) => (
              <TableRow key={accessory.id}>
                {/* ... Suas TableCells ... */}
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
                        disabled={isDeletePending || isTransitioning}
                        title="Excluir Acessório"
                      >
                        {(isDeletePending && accessoryToDelete?.id === accessory.id) || (isTransitioning && accessoryToDelete?.id === accessory.id) ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </AlertDialogTrigger>
                  </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {/* ... AlertDialogContent ... */}
      <AlertDialogContent>
        {/* ... */}
      </AlertDialogContent>
    </AlertDialog>
  );
}