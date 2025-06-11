
import { getAllPosts } from '@/lib/data'; // Now async
import type { Post } from '@/lib/types';
import PostsTable from './components/PostsTable';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, FileText, PlusCircle } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Gerenciar Posts do Blog | Admin SmartAcessorios',
  description: 'Adicione, edite ou remova posts do blog da plataforma.',
};

export default async function ManageBlogPostsPage() {
  const posts: Post[] = await getAllPosts(); // Await async call

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-headline flex items-center gap-2">
            <FileText className="h-8 w-8 text-primary" />
            Gerenciar Posts do Blog
          </h1>
          <p className="text-muted-foreground">Adicione, edite ou remova posts do blog.</p>
        </div>
        <div className="flex gap-2">
            <Button variant="outline" asChild size="sm">
            <Link href="/admin/dashboard">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar ao Painel
            </Link>
            </Button>
            <Button asChild size="sm">
            <Link href="/admin/blog-posts/new">
                <PlusCircle className="mr-2 h-4 w-4" />
                Adicionar Novo Post
            </Link>
            </Button>
        </div>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Lista de Posts</CardTitle>
          <CardDescription>
            Total de posts cadastrados: {posts.length}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {posts.length > 0 ? (
            <PostsTable initialPosts={posts} />
          ) : (
            <div className="text-center py-10">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Nenhum post cadastrado ainda.</p>
              <Button asChild className="mt-4">
                <Link href="/admin/blog-posts/new">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Adicionar Primeiro Post
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
