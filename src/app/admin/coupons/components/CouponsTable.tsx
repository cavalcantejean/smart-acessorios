
"use client";

import { useState, useEffect, useActionState, startTransition } from 'react';
import type { Coupon } from '@/lib/types';
import { deleteCouponAction, type CouponActionResult } from '../actions';
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
import Link from 'next/link';
import { Edit, Trash2, Loader2, CalendarDays, Store } from 'lucide-react';
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
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface CouponsTableProps {
  initialCoupons: Coupon[];
}

const initialActionState: CouponActionResult = { success: false };

export default function CouponsTable({ initialCoupons }: CouponsTableProps) {
  const [coupons, setCoupons] = useState<Coupon[]>(initialCoupons);
  const [deleteState, handleDeleteAction, isDeletePending] = useActionState(deleteCouponAction, initialActionState);
  const { toast } = useToast();
  const [couponToDelete, setCouponToDelete] = useState<Coupon | null>(null);

  useEffect(() => {
    setCoupons(initialCoupons);
  }, [initialCoupons]);

  useEffect(() => {
    if (deleteState?.message) {
      if (deleteState.success) {
        toast({
          title: "Sucesso!",
          description: deleteState.message,
        });
        // List will re-render due to revalidatePath or state update if filtered locally
      } else if (!deleteState.success && deleteState.error) {
        toast({
          title: "Erro",
          description: deleteState.error,
          variant: "destructive",
        });
      }
      setCouponToDelete(null); 
    }
  }, [deleteState, toast]);

  const handleDeleteConfirm = () => {
    if (couponToDelete) {
      const formData = new FormData();
      formData.append('couponId', couponToDelete.id);
      startTransition(() => {
        handleDeleteAction(formData);
      });
    }
  };

  const formatDateSafe = (dateString?: string) => {
    if (!dateString) return 'N/A';
    try {
      return format(parseISO(dateString), "PPP", { locale: ptBR });
    } catch (error) {
      return dateString; // Return original if parsing fails
    }
  };

  return (
    <AlertDialog open={!!couponToDelete} onOpenChange={(isOpen) => { if (!isOpen) setCouponToDelete(null); }}>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Código</TableHead>
              <TableHead className="hidden sm:table-cell">Desconto</TableHead>
              <TableHead className="hidden md:table-cell">Descrição</TableHead>
              <TableHead className="hidden lg:table-cell">Validade</TableHead>
              <TableHead className="hidden lg:table-cell">Loja</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {coupons.map((coupon) => (
              <TableRow key={coupon.id}>
                <TableCell className="font-mono font-semibold text-primary max-w-[150px] truncate">{coupon.code}</TableCell>
                <TableCell className="hidden sm:table-cell">
                  <Badge variant="secondary">{coupon.discount}</Badge>
                </TableCell>
                <TableCell className="hidden md:table-cell max-w-[300px] truncate">{coupon.description}</TableCell>
                <TableCell className="hidden lg:table-cell text-xs">
                    {coupon.expiryDate ? (
                        <span className="flex items-center gap-1">
                            <CalendarDays className="h-3.5 w-3.5 text-muted-foreground"/>
                            {formatDateSafe(coupon.expiryDate)}
                        </span>
                    ) : (
                        'Sem validade'
                    )}
                </TableCell>
                <TableCell className="hidden lg:table-cell text-xs">
                     {coupon.store ? (
                        <span className="flex items-center gap-1">
                            <Store className="h-3.5 w-3.5 text-muted-foreground"/>
                            {coupon.store}
                        </span>
                    ) : (
                        'N/A'
                    )}
                </TableCell>
                <TableCell className="text-right space-x-1 sm:space-x-2">
                  <Button variant="outline" size="icon" asChild title="Editar Cupom">
                    <Link href={`/admin/coupons/${coupon.id}/edit`}>
                      <Edit className="h-4 w-4" />
                    </Link>
                  </Button>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => setCouponToDelete(coupon)}
                      disabled={isDeletePending && couponToDelete?.id === coupon.id}
                      title="Excluir Cupom"
                    >
                      {isDeletePending && couponToDelete?.id === coupon.id ? (
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

      <AlertDialogContent>
        {couponToDelete && (
          <>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja excluir o cupom "{couponToDelete.code}"? Esta ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeletePending}>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteConfirm}
                disabled={isDeletePending}
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

