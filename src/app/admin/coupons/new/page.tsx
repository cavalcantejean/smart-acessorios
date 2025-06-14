
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, TicketPercent } from 'lucide-react';
import type { Metadata } from 'next';
import CouponForm from '../components/CouponForm';

export const metadata: Metadata = {
  title: 'Adicionar Novo Cupom | Admin SmartAcessorios',
  description: 'Crie um novo cupom promocional para a plataforma.',
};

export default function NewCouponPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-headline flex items-center gap-2">
             <TicketPercent className="h-7 w-7 text-primary"/>
             Adicionar Novo Cupom
          </h1>
          <p className="text-muted-foreground">Preencha os detalhes do novo cupom promocional.</p>
        </div>
        <Button variant="outline" asChild size="sm">
          <Link href="/admin/coupons">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para Lista de Cupons
          </Link>
        </Button>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Formulário de Novo Cupom</CardTitle>
          <CardDescription>
            Preencha todos os campos obrigatórios para cadastrar um novo cupom. (Salvamento desativado para exportação estática).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CouponForm 
            submitButtonText="Criar Cupom"
            isStaticExport={true}
          />
        </CardContent>
      </Card>
    </div>
  );
}
