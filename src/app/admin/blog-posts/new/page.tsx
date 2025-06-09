
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import type { Metadata } from 'next';
import PostForm from '@/components/admin/PostForm'; // Corrected import path
import { createPostAction } from '../actions';

export const metadata: Metadata = {
  title: 'Adicionar Novo Post | Admin SmartAcessorios',
  description: 'Crie um novo post para o blog da plataforma.',
};

export default function NewPostPage() {
  // Admin auth check should be here or in a layout

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-headline">Adicionar Novo Post</h1>
          <p className="text-muted-foreground">Preencha os detalhes do novo post.</p>
        </div>
        <Button variant="outline" asChild size="sm">
          <Link href="/admin/blog-posts">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para Lista de Posts
          </Link>
        </Button>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Formulário de Novo Post</CardTitle>
          <CardDescription>
            Preencha todos os campos obrigatórios para cadastrar um novo post.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PostForm 
            formAction={createPostAction} 
            submitButtonText="Criar Post"
          />
        </CardContent>
      </Card>
    </div>
  );
}
