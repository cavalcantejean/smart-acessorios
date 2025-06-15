
import { getPostById, getAllPosts } from '@/lib/data'; 
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, AlertTriangle, FileText } from 'lucide-react';
import type { Metadata } from 'next';
import PostForm from '@/components/admin/PostForm';
import type { Post } from '@/lib/types';
import { Timestamp } from 'firebase/firestore';

export async function generateStaticParams() {
  const posts = await getAllPosts();
  return posts.map((post) => ({
    id: post.id,
  }));
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const post = await getPostById(params.id); 
  if (!post) {
    return { title: 'Post Não Encontrado | Admin' };
  }
  return {
    title: `Editar: ${post.title} | Admin SmartAcessorios`,
    description: `Edite os detalhes do post ${post.title}.`,
  };
}

export default async function EditPostPage({ params }: { params: { id: string } }) {
  const post = await getPostById(params.id); 

  if (!post) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <AlertTriangle className="h-16 w-16 text-destructive mb-4" />
        <h1 className="text-2xl font-bold mb-2">Post Não Encontrado</h1>
        <p className="text-muted-foreground mb-6">
          O post que você está tentando editar não foi encontrado.
        </p>
        <Button asChild variant="outline">
          <Link href="/admin/blog-posts">
            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para Lista de Posts
          </Link>
        </Button>
      </div>
    );
  }

  let publishedAtString = "";
  if (post.publishedAt) {
    if (post.publishedAt instanceof Timestamp) {
      publishedAtString = post.publishedAt.toDate().toISOString().split('T')[0];
    } else if (typeof post.publishedAt === 'string') { 
      publishedAtString = new Date(post.publishedAt).toISOString().split('T')[0];
    } else if (typeof post.publishedAt === 'object' && 'seconds' in post.publishedAt && 'nanoseconds' in post.publishedAt) {
      publishedAtString = new Timestamp((post.publishedAt as any).seconds, (post.publishedAt as any).nanoseconds).toDate().toISOString().split('T')[0];
    }
  }

  const initialDataForForm = {
    ...post,
    tags: Array.isArray(post.tags) ? post.tags.join(", ") : "",
    publishedAt: publishedAtString,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-headline flex items-center gap-2">
            <FileText className="h-7 w-7 text-primary"/>
            Editar Post
          </h1>
          <p className="text-muted-foreground truncate max-w-xl">Modifique os detalhes do post: "{post.title}"</p>
        </div>
        <Button variant="outline" asChild size="sm">
          <Link href="/admin/blog-posts">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para Lista
          </Link>
        </Button>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Formulário de Edição de Post</CardTitle>
          <CardDescription>
            Altere os campos abaixo para atualizar o post. (Salvamento desativado para exportação estática).
          </CardDescription>
        </CardHeader>
        <CardContent>
            <PostForm
              initialData={initialDataForForm}
              submitButtonText="Salvar Alterações"
              isStaticExport={false}
            />
        </CardContent>
      </Card>
    </div>
  );
}
