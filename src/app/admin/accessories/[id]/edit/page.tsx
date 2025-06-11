
import { getAccessoryById } from '@/lib/data'; // Now async
import type { Accessory } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, Construction, AlertTriangle } from 'lucide-react';
import type { Metadata } from 'next';
import AccessoryForm from '@/components/admin/AccessoryForm';
import { updateAccessoryAction } from '../../actions';
import { Timestamp } from 'firebase/firestore';

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const accessory = await getAccessoryById(params.id); // Await async call
  if (!accessory) {
    return { title: 'Acessório Não Encontrado | Admin' };
  }
  return {
    title: `Editar: ${accessory.name} | Admin SmartAcessorios`,
    description: `Edite os detalhes do acessório ${accessory.name}.`,
  };
}

export default async function EditAccessoryPage({ params }: { params: { id: string } }) {
  const accessory = await getAccessoryById(params.id); // Await async call

  if (!accessory) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <AlertTriangle className="h-16 w-16 text-destructive mb-4" />
        <h1 className="text-2xl font-bold mb-2">Acessório Não Encontrado</h1>
        <p className="text-muted-foreground mb-6">
          O acessório que você está tentando editar não foi encontrado.
        </p>
        <Button asChild variant="outline">
          <Link href="/admin/accessories">
            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para Lista de Acessórios
          </Link>
        </Button>
      </div>
    );
  }

  const boundUpdateAccessoryAction = updateAccessoryAction.bind(null, accessory.id);

  // Prepare initialData for the form, converting Timestamps if necessary
  const initialDataForForm = {
    ...accessory,
    // Ensure date fields that might be Timestamps are converted for form if needed
    // For AccessoryForm, it expects strings or booleans as per AccessoryFormValues
    // Price is already string in schema, isDeal is boolean
    // Timestamps (createdAt, updatedAt) are not directly on the form schema
  };


  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-headline">Editar Acessório: {accessory.name}</h1>
          <p className="text-muted-foreground">Modifique os detalhes do acessório.</p>
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
          <CardTitle>Formulário de Edição de Acessório</CardTitle>
          <CardDescription>
            Modifique os campos abaixo para atualizar o acessório.
          </CardDescription>
        </CardHeader>
        <CardContent>
           <AccessoryForm
              formAction={boundUpdateAccessoryAction}
              initialData={initialDataForForm} // Pass the prepared data
              submitButtonText="Salvar Alterações"
            />
        </CardContent>
      </Card>
    </div>
  );
}
