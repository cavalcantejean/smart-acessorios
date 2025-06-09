
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, Construction } from 'lucide-react';
import type { Metadata } from 'next';
// import AccessoryForm from '../components/AccessoryForm'; // To be used later
// import { createAccessoryAction } from '../actions'; // To be used later

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
            Esta funcionalidade (formulário de criação) está em desenvolvimento.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center py-12">
          <Construction className="mx-auto h-16 w-16 text-primary mb-4" />
          <p className="text-muted-foreground">
            O formulário para adicionar acessórios será implementado em breve.
          </p>
          {/* 
            Placeholder for the form:
            <AccessoryForm 
              formAction={createAccessoryAction} 
              submitButtonText="Criar Acessório"
            /> 
          */}
        </CardContent>
      </Card>
    </div>
  );
}
