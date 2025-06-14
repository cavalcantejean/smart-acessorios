
import { getPostBySlug, getAllPosts } from '@/lib/data';
import type { Post } from '@/lib/types';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, BookOpenText } from 'lucide-react';
import { Timestamp } from 'firebase/firestore';
import type { Metadata } from 'next';
import BlogPostClientView from './components/BlogPostClientView'; // New client component

interface PostPageProps {
  params: { slug: string };
}

// generateStaticParams is required for static export of dynamic routes
export async function generateStaticParams() {
  const posts = await getAllPosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

// generateMetadata for dynamic metadata
export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
  const post = await getPostBySlug(params.slug);
  if (!post) {
    return {
      title: 'Artigo Não Encontrado',
      description: 'O artigo que você está procurando não foi encontrado.',
    };
  }
  return {
    title: `${post.title} | Blog SmartAcessorios`,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
      publishedTime: post.publishedAt instanceof Timestamp ? post.publishedAt.toDate().toISOString() : post.publishedAt,
      authors: [post.authorName],
      images: post.imageUrl ? [{ url: post.imageUrl }] : [],
    },
    twitter: {
        card: "summary_large_image",
        title: post.title,
        description: post.excerpt,
        images: post.imageUrl ? [post.imageUrl] : [],
    }
  };
}

// Helper to prepare post data for client components (convert Timestamps to strings)
const preparePostForClient = (post: Post): any => {
  return {
    ...post,
    publishedAt: post.publishedAt instanceof Timestamp ? post.publishedAt.toDate().toISOString() : (post.publishedAt as any),
    createdAt: post.createdAt instanceof Timestamp ? post.createdAt.toDate().toISOString() : (post.createdAt as any),
    updatedAt: post.updatedAt instanceof Timestamp ? post.updatedAt.toDate().toISOString() : (post.updatedAt as any),
  };
};


export default async function PostPage({ params }: PostPageProps) {
  const postData = await getPostBySlug(params.slug);

  if (!postData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <BookOpenText className="h-20 w-20 text-muted-foreground mb-6" />
        <h1 className="text-3xl font-bold mb-4">Artigo Não Encontrado</h1>
        <p className="text-muted-foreground mb-8">
          O artigo que você está procurando não existe ou foi movido.
        </p>
        <Button asChild>
          <Link href="/blog">
            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para o Blog
          </Link>
        </Button>
      </div>
    );
  }

  const clientReadyPost = preparePostForClient(postData);

  return <BlogPostClientView post={clientReadyPost} />;
}
