
"use client";

import { useState, useEffect, useTransition } from 'react'; // useActionState removed, useTransition added
import type { Accessory } from '@/lib/types';
// deleteAccessoryAction and AccessoryActionResult removed
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
import { Timestamp } from 'firebase/firestore'; // doc, deleteDoc, db removed
import { useAuth } from '@/hooks/useAuth';
// import { db } from '@/lib/firebase'; // Removed db
import { deleteAccessoryAction, type AccessoryActionResult } from '@/app/admin/accessories/actions'; // Added Server Action

interface AccessoriesTableProps {
  initialAccessories: Accessory[];
  // isStaticExport prop is no longer needed
}

const formatDate = (timestampInput: any): string => {
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

export default function AccessoriesTable({ initialAccessories }: AccessoriesTableProps) { // isStaticExport removed
  const [accessories, setAccessories] = useState<Accessory[]>(initialAccessories); // This will be updated by revalidation
  const { toast } = useToast();
  const [accessoryToDelete, setAccessoryToDelete] = useState<Accessory | null>(null);
  const { user: authUser, isAuthenticated } = useAuth(); // Added isAuthenticated
  const [isDeletePending, setIsDeletePending] = useState(false);
  const [isTransitioning, startTransition] = useTransition(); // Corrected useTransition


  useEffect(() => {
    setAccessories(initialAccessories);
  }, [initialAccessories]);

  const handleDeleteConfirm = async () => {
    // isStaticExport check removed
    if (!isAuthenticated || !authUser?.id) { // Check against general isAuthenticated
      toast({ title: "Não autenticado", description: "Você precisa estar logado como administrador para excluir.", variant: "destructive" });
      setAccessoryToDelete(null);
      return;
    }

    if (!accessoryToDelete) {
      toast({ title: "Erro Interno", description: "Nenhum acessório selecionado para exclusão.", variant: "destructive" });
      return;
    }

    setIsDeletePending(true); // For UI feedback on button
    startTransition(async () => {
      const result: AccessoryActionResult = await deleteAccessoryAction(accessoryToDelete.id);
      if (result.success) {
        toast({ title: "Sucesso!", description: result.message });
        // Data revalidation is handled by revalidatePath in the server action.
        // Optionally, optimistically update UI here, but relying on revalidation is simpler.
        // setAccessories(prev => prev.filter(acc => acc.id !== accessoryToDelete.id));
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

  return (
    <AlertDialog open={!!accessoryToDelete} onOpenChange={(isOpen) => { if (!isOpen) setAccessoryToDelete(null); }}>
      {/* isStaticExport message div removed */}
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
                        disabled={isDeletePending || isTransitioning} // Disable if local pending or transition pending
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
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                  Nenhum acessório encontrado.
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
                disabled={isDeletePending || isTransitioning || !isAuthenticated}
                className="bg-destructive hover:bg-destructive/90"
              >
                {isDeletePending || isTransitioning ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Excluir
              </AlertDialogAction>
            </AlertDialogFooter>
          </>
        )}
      </AlertDialogContent>
    </AlertDialog>
  );
}
