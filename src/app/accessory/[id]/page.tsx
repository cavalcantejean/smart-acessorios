
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export async function generateMetadata({ params }: { params: { id: string } }) {
  console.log("[TEST generateMetadata] Received params:", JSON.stringify(params));
  const accessoryId: string = params.id;
  console.log("[TEST generateMetadata] Accessory ID:", accessoryId);

  if (!accessoryId) {
    console.error("[TEST generateMetadata] Accessory ID is missing from params object.");
    return {
      title: 'ID de Acessório Inválido (Teste)',
    };
  }
  return {
    title: `Acessório Teste ${accessoryId}`,
  };
}

export default async function AccessoryDetailPage({ params }: { params: { id:string } }) {
  console.log("[TEST AccessoryDetailPage] Received params:", JSON.stringify(params));
  const accessoryId: string = params.id;
  console.log("[TEST AccessoryDetailPage] Accessory ID:", accessoryId);

  if (!accessoryId) {
    console.error("AccessoryDetailPage: Accessory ID is missing from params.");
    // Render a fallback if ID is missing
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Card className="w-full max-w-md p-8 text-center">
          <CardHeader>
            <CardTitle className="text-2xl font-headline">ID de Acessório Inválido (Página de Teste)</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-6">
              O ID do acessório não foi fornecido corretamente na URL.
            </p>
            <Button asChild>
              <Link href="/">
                <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para a Página Inicial
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold">Página de Detalhes do Acessório (Teste)</h1>
      <p className="mt-4">O ID do acessório é: <span className="font-semibold text-primary">{accessoryId}</span></p>
      <p className="mt-2 text-sm text-muted-foreground">Esta é uma visualização simplificada para diagnóstico.</p>
      <Button asChild className="mt-6">
        <Link href="/">
          <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para a Página Inicial
        </Link>
      </Button>
    </div>
  );
}
