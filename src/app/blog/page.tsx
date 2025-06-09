
import { getAllPosts } from '@/lib/data';
import type { Post } from '@/lib/types';
import BlogPostCard from '@/components/BlogPostCard';
import { BookOpenText } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Blog | SmartAcessorios',
  description: 'Leia nossos últimos artigos, guias e notícias sobre acessórios para smartphones e tecnologia.',
};

export default async function BlogPage() {
  const posts: Post[] = getAllPosts();

  return (
    <div className="space-y-8">
      <section>
        <div className="flex items-center gap-3 mb-8">
          <BookOpenText className="h-8 w-8 text-primary" />
          <h1 className="text-4xl font-bold font-headline tracking-tight">Nosso Blog</h1>
        </div>
        
        {posts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map(post => (
              <BlogPostCard key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <BookOpenText className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
            <h2 className="text-2xl font-semibold mb-2">Nenhum artigo encontrado</h2>
            <p className="text-muted-foreground">
              Ainda não publicamos nenhum artigo. Volte em breve!
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
