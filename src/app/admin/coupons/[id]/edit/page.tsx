
import { getCouponById } from '@/lib/data'; // Now async
import type { Coupon } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, AlertTriangle, TicketPercent } from 'lucide-react';
import type { Metadata } from 'next';
import CouponForm from '../../components/CouponForm';
import { updateCouponAction } from '../../actions';
import { Timestamp } from 'firebase/firestore';

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const coupon = await getCouponById(params.id); // Await async call
  if (!coupon) {
    return { title: 'Cupom Não Encontrado | Admin' };
  }
  return {
    title: `Editar Cupom: ${coupon.code} | Admin SmartAcessorios`,
    description: `Edite os detalhes do cupom ${coupon.code}.`,
  };
}

export default async function EditCouponPage({ params }: { params: { id: string } }) {
  const coupon = await getCouponById(params.id); // Await async call

  if (!coupon) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <AlertTriangle className="h-16 w-16 text-destructive mb-4" />
        <h1 className="text-2xl font-bold mb-2">Cupom Não Encontrado</h1>
        <p className="text-muted-foreground mb-6">
          O cupom que você está tentando editar não foi encontrado.
        </p>
        <Button asChild variant="outline">
          <Link href="/admin/coupons">
            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para Lista de Cupons
          </Link>
        </Button>
      </div>
    );
  }

  const boundUpdateCouponAction = updateCouponAction.bind(null, coupon.id);

  // Prepare initialData for the form. expiryDate needs to be in 'yyyy-MM-dd' format if present.
  const initialDataForForm = {
    ...coupon,
    expiryDate: coupon.expiryDate instanceof Timestamp
                 ? coupon.expiryDate.toDate().toISOString().split('T')[0]
                 : (typeof coupon.expiryDate === 'string' ? coupon.expiryDate.split('T')[0] : ""),
    store: coupon.store || "",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-headline flex items-center gap-2">
            <TicketPercent className="h-7 w-7 text-primary"/>
            Editar Cupom
          </h1>
          <p className="text-muted-foreground truncate max-w-xl">Modifique os detalhes do cupom: "{coupon.code}"</p>
        </div>
        <Button variant="outline" asChild size="sm">
          <Link href="/admin/coupons">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para Lista
          </Link>
        </Button>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Formulário de Edição de Cupom</CardTitle>
          <CardDescription>
            Altere os campos abaixo para atualizar o cupom.
          </CardDescription>
        </CardHeader>
        <CardContent>
            <CouponForm
              formAction={boundUpdateCouponAction}
              initialData={initialDataForForm}
              submitButtonText="Salvar Alterações"
            />
        </CardContent>
      </Card>
    </div>
  );
}
