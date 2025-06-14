
"use client";

import { useState, useEffect, startTransition } from 'react'; // useActionState removed
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
import { Timestamp, doc, deleteDoc } from 'firebase/firestore'; // Added doc, deleteDoc
import { useAuth } from '@/hooks/useAuth';
import { db } from '@/lib/firebase'; // Added db

interface AccessoriesTableProps {
  initialAccessories: Accessory[];
  isStaticExport?: boolean; // Added for static export handling
}

// initialActionState removed

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

export default function AccessoriesTable({ initialAccessories, isStaticExport = false }: AccessoriesTableProps) {
  const [accessories, setAccessories] = useState<Accessory[]>(initialAccessories);
  const { toast } = useToast();
  const [accessoryToDelete, setAccessoryToDelete] = useState<Accessory | null>(null);
  const { user: authUser } = useAuth();
  const [isDeletePending, setIsDeletePending] = useState(false);

  useEffect(() => {
    setAccessories(initialAccessories);
  }, [initialAccessories]);

  const handleDeleteConfirm = async () => {
    if (isStaticExport) {
      toast({ title: "Funcionalidade Indisponível", description: "Exclusão não suportada no modo de exportação estática.", variant: "destructive" });
      setAccessoryToDelete(null);
      return;
    }

    if (!authUser?.id) {
      toast({ title: "Não autenticado", description: "Você precisa estar logado como administrador para excluir.", variant: "destructive" });
      setAccessoryToDelete(null);
      return;
    }

    if (!accessoryToDelete) {
      toast({ title: "Erro Interno", description: "Nenhum acessório selecionado para exclusão.", variant: "destructive" });
      return;
    }

    // Firestore rules should ensure only authenticated admins can delete from "acessorios"
    // e.g., allow delete: if request.auth != null && request.auth.token.admin == true;

    setIsDeletePending(true);
    try {
      await deleteDoc(doc(db, "acessorios", accessoryToDelete.id));
      setAccessories(prev => prev.filter(acc => acc.id !== accessoryToDelete.id));
      toast({ title: "Sucesso!", description: `Acessório "${accessoryToDelete.name}" excluído.` });
    } catch (error) {
      console.error("Error deleting accessory:", error);
      toast({
        title: "Erro ao Excluir",
        description: `Ocorreu um erro: ${error instanceof Error ? error.message : String(error)}`,
        variant: "destructive",
      });
    } finally {
      setIsDeletePending(false);
      setAccessoryToDelete(null);
    }
  };

  return (
    <AlertDialog open={!!accessoryToDelete} onOpenChange={(isOpen) => { if (!isOpen) setAccessoryToDelete(null); }}>
      {isStaticExport && (
        <div className="p-3 mb-4 text-sm text-orange-700 bg-orange-100 border border-orange-300 rounded-md">
            <strong>Modo de Demonstração Estática:</strong> Ações de exclusão estão desativadas.
        </div>
      )}
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
                        disabled={isDeletePending && accessoryToDelete?.id === accessory.id || isStaticExport}
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
                disabled={isDeletePending || !authUser?.id || isStaticExport}
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
