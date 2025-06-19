
import { getAllCouponsAdmin } from '@/lib/data-admin';
import type { Coupon } from '@/lib/types';
import CouponsTable from './components/CouponsTable';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, TicketPercent, PlusCircle } from 'lucide-react';
import type { Metadata } from 'next';
// import { Timestamp } from 'firebase/firestore'; // No longer needed

export const metadata: Metadata = {
  title: 'Gerenciar Cupons | Admin SmartAcessorios',
  description: 'Adicione, edite ou remova cupons promocionais da plataforma.',
};

const prepareCouponForClient = (coupon: Coupon): Coupon => {
  const convertToISO = (dateField: Date | string | undefined): string | undefined => {
    if (!dateField) return undefined;
    if (typeof dateField === 'string') return dateField; // Assume already ISO string
    if (dateField instanceof Date) return dateField.toISOString();
    // Fallback for any other unexpected type
    return String(dateField);
  };
  return {
    ...coupon,
    expiryDate: convertToISO(coupon.expiryDate),
    createdAt: convertToISO(coupon.createdAt),
    updatedAt: convertToISO(coupon.updatedAt),
  };
};

export default async function ManageCouponsPage() {
  console.log('--- RENDERIZANDO: src/app/admin/coupons/page.tsx no SERVIDOR ---');
  const rawCoupons: Coupon[] = await getAllCouponsAdmin();
  const coupons = rawCoupons.map(prepareCouponForClient);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-headline flex items-center gap-2">
            <TicketPercent className="h-8 w-8 text-primary" />
            Gerenciar Cupons
          </h1>
          <p className="text-muted-foreground">Adicione, edite ou remova cupons promocionais.</p>
        </div>
        <div className="flex gap-2">
            <Button variant="outline" asChild size="sm">
            <Link href="/admin/dashboard">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar ao Painel
            </Link>
            </Button>
            <Button asChild size="sm">
            <Link href="/admin/coupons/new">
                <PlusCircle className="mr-2 h-4 w-4" />
                Adicionar Novo Cupom
            </Link>
            </Button>
        </div>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Lista de Cupons</CardTitle>
          <CardDescription>
            Total de cupons cadastrados: {coupons.length}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {coupons.length > 0 ? (
            <CouponsTable initialCoupons={coupons} isStaticExport={false} />
          ) : (
            <div className="text-center py-10">
              <TicketPercent className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Nenhum cupom cadastrado ainda.</p>
              <Button asChild className="mt-4">
                <Link href="/admin/coupons/new">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Adicionar Primeiro Cupom
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
