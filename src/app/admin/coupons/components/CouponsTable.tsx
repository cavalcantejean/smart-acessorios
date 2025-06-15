
"use client";

import { useState, useEffect, startTransition } from 'react'; // useActionState removed
import type { Coupon } from '@/lib/types';
// deleteCouponAction and CouponActionResult removed
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
import { Timestamp } from 'firebase/firestore'; // doc, deleteDoc, db removed
import { useAuth } from '@/hooks/useAuth';
// import { db } from '@/lib/firebase'; // Removed db
import { deleteCouponAction, type CouponActionResult } from '@/app/admin/coupons/actions'; // Added Server Action

interface CouponsTableProps {
  initialCoupons: Coupon[];
  // isStaticExport prop removed
}

const formatDateSafe = (dateInput?: any): string => {
  if (!dateInput) return 'N/A';
  let date: Date;
  try {
    if (dateInput instanceof Date) date = dateInput;
    else if (dateInput instanceof Timestamp) date = dateInput.toDate();
    else if (typeof dateInput === 'string') {
      if (/^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|([+-]\d{2}:\d{2})))?$/.test(dateInput)) {
        date = parseISO(dateInput);
      } else {
        date = new Date(dateInput);
      }
    } else if (typeof dateInput === 'object' && dateInput !== null && typeof dateInput.seconds === 'number' && typeof dateInput.nanoseconds === 'number') {
      date = new Timestamp(dateInput.seconds, dateInput.nanoseconds).toDate();
    } else {
      return 'Data inválida';
    }
    if (isNaN(date.getTime())) return typeof dateInput === 'string' ? dateInput : 'Data inválida';
    return format(date, "PPP", { locale: ptBR });
  } catch (error) {
    return typeof dateInput === 'string' ? dateInput : 'Data inválida';
  }
};

export default function CouponsTable({ initialCoupons }: CouponsTableProps) { // isStaticExport removed
  const [coupons, setCoupons] = useState<Coupon[]>(initialCoupons); // Will be updated by revalidation
  const { toast } = useToast();
  const [couponToDelete, setCouponToDelete] = useState<Coupon | null>(null);
  const [isDeletePending, setIsDeletePending] = useState(false); // For local button loading state
  const { user: authUser, isAuthenticated } = useAuth();
  const [isTransitioning, startApiTransition] = (React as any).useTransition(); // Renamed startTransition

  useEffect(() => {
    setCoupons(initialCoupons);
  }, [initialCoupons]);

  const handleDeleteConfirm = async () => {
    // isStaticExport check removed
    if (!isAuthenticated || !authUser?.id) {
      toast({ title: "Não autenticado", description: "Você precisa estar logado como administrador para excluir.", variant: "destructive" });
      setCouponToDelete(null);
      return;
    }

    if (!couponToDelete) {
      toast({ title: "Erro Interno", description: "Nenhum cupom selecionado para exclusão.", variant: "destructive" });
      return;
    }

    setIsDeletePending(true);
    startApiTransition(async () => {
      const result: Omit<CouponActionResult, 'coupon'> = await deleteCouponAction(couponToDelete.id);
      if (result.success) {
        toast({ title: "Sucesso!", description: result.message });
        // Data revalidation is handled by revalidatePath in the server action.
        // No local state update `setCoupons` needed here for removal.
      } else {
        toast({
          title: "Erro ao Excluir",
          description: result.message || "Ocorreu um erro desconhecido.",
          variant: "destructive",
        });
      }
      setIsDeletePending(false);
      setCouponToDelete(null);
    });
  };

  return (
    <AlertDialog open={!!couponToDelete} onOpenChange={(isOpen) => { if (!isOpen) setCouponToDelete(null); }}>
      {/* isStaticExport message div removed */}
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
                      disabled={isDeletePending || isTransitioning}
                      title="Excluir Cupom"
                    >
                      {(isDeletePending && couponToDelete?.id === coupon.id) || (isTransitioning && couponToDelete?.id === coupon.id) ? (
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
