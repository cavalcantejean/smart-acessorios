
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import type { Metadata } from 'next';
import AccessoryForm from '@/components/admin/AccessoryForm';
// createAccessoryAction removed as Server Actions are not used for static export

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
            (Salvamento desativado para exportação estática).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AccessoryForm 
            // formAction prop is removed; client-side handling would be needed for dynamic deployment
            submitButtonText="Criar Acessório"
            isStaticExport={true} // Explicitly pass flag for static export behavior
          />
        </CardContent>
      </Card>
    </div>
  );
}
