
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import type { Metadata } from 'next';
import AccessoryForm from '@/components/admin/AccessoryForm';
import { createAccessoryAction } from '../actions';

export const metadata: Metadata = {
  title: 'Adicionar Novo Acessório | Admin SmartAcessorios',
  description: 'Crie um novo acessório para a plataforma.',
};

export default function NewAccessoryPage() {
  // Admin auth check should be here or in a layout

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-headline">Adicionar Novo Acessório</h1>
          <p className="text-muted-foreground">Preencha os detalhes do novo acessório.</p>
        </div>
        <Button variant="outline" asChild size="sm">
          <Link href="/admin/accessories">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para Lista
          </Link>
        </Button>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Formulário de Novo Acessório</CardTitle>
          <CardDescription>
            Preencha todos os campos obrigatórios para cadastrar um novo acessório.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AccessoryForm 
            formAction={createAccessoryAction} 
            submitButtonText="Criar Acessório"
          />
        </CardContent>
      </Card>
    </div>
  );
}
