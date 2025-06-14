
"use client";

import { useState, useEffect, startTransition } from 'react'; // useActionState removed
import type { Post } from '@/lib/types';
// deletePostAction and PostActionResult removed
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Image from 'next/image';
import Link from 'next/link';
import { Edit, Trash2, Loader2, ExternalLink, CalendarDays } from 'lucide-react'; // UserCircleIcon removed as authorAvatarUrl isn't used in table directly
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from '@/components/ui/badge';
import { Timestamp } from 'firebase/firestore';

interface PostsTableProps {
  initialPosts: Post[];
  isStaticExport?: boolean;
}

// initialActionState removed

const formatDate = (dateInput: any): string => {
  if (!dateInput) return 'N/A';
  let date: Date;
  if (dateInput instanceof Date) date = dateInput;
  else if (dateInput instanceof Timestamp) date = dateInput.toDate();
  else if (typeof dateInput === 'string') date = new Date(dateInput);
  else if (typeof dateInput === 'object' && dateInput !== null && typeof dateInput.seconds === 'number' && typeof dateInput.nanoseconds === 'number') {
    date = new Timestamp(dateInput.seconds, dateInput.nanoseconds).toDate();
  } else {
    return 'Data inválida';
  }
  if (isNaN(date.getTime())) return 'Data inválida';
  return date.toLocaleDateString('pt-BR', { year: 'numeric', month: 'short', day: 'numeric' });
};

export default function PostsTable({ initialPosts, isStaticExport = true }: PostsTableProps) {
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const { toast } = useToast();
  const [postToDelete, setPostToDelete] = useState<Post | null>(null);
  const [isDeletePending, setIsDeletePending] = useState(false);

  useEffect(() => {
    setPosts(initialPosts);
  }, [initialPosts]);

  const handleDeleteConfirm = () => {
    if (isStaticExport) {
      toast({ title: "Funcionalidade Indisponível", description: "Exclusão não suportada na exportação estática.", variant: "destructive" });
      setPostToDelete(null);
      return;
    }
    if (postToDelete) {
      setIsDeletePending(true);
      // Client-side Firebase logic would go here
      console.log(`Simulating delete for post ${postToDelete.id}`);
      setTimeout(() => {
        setPosts(prevPosts => prevPosts.filter(p => p.id !== postToDelete.id));
        toast({ title: "Sucesso (Simulado)!", description: `Post "${postToDelete.title}" excluído.` });
        setIsDeletePending(false);
        setPostToDelete(null);
      }, 1000);
    }
  };

  return (
    <AlertDialog open={!!postToDelete} onOpenChange={(isOpen) => { if (!isOpen) setPostToDelete(null); }}>
      {isStaticExport && (
        <div className="p-3 mb-4 text-sm text-orange-700 bg-orange-100 border border-orange-300 rounded-md">
            <strong>Modo de Demonstração Estática:</strong> Ações de exclusão estão desativadas.
        </div>
      )}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px] hidden sm:table-cell">Imagem</TableHead>
              <TableHead>Título</TableHead>
              <TableHead className="hidden md:table-cell">Autor</TableHead>
              <TableHead className="hidden lg:table-cell">Categoria</TableHead>
              <TableHead className="hidden lg:table-cell">Publicado em</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {posts.map((post) => (
              <TableRow key={post.id}>
                <TableCell className="hidden sm:table-cell">
                  <div className="relative h-12 w-12 rounded-md overflow-hidden">
                    <Image
                      src={post.imageUrl}
                      alt={post.title}
                      fill
                      style={{ objectFit: 'cover' }}
                      sizes="48px"
                      data-ai-hint={post.imageHint || "blog post"}
                    />
                  </div>
                </TableCell>
                <TableCell className="font-medium max-w-[250px] truncate">
                    <Link href={`/blog/${post.slug}`} target="_blank" className="hover:underline" title={post.title}>
                        {post.title} <ExternalLink className="inline h-3 w-3 ml-0.5 text-muted-foreground"/>
                    </Link>
                </TableCell>
                <TableCell className="hidden md:table-cell">{post.authorName}</TableCell>
                <TableCell className="hidden lg:table-cell">
                  {post.category ? <Badge variant="outline">{post.category}</Badge> : 'N/A'}
                </TableCell>
                <TableCell className="hidden lg:table-cell text-xs">
                  <div className="flex items-center gap-1">
                    <CalendarDays className="h-3.5 w-3.5 text-muted-foreground" />
                    {formatDate(post.publishedAt)}
                  </div>
                </TableCell>
                <TableCell className="text-right space-x-1 sm:space-x-2">
                  <Button variant="outline" size="icon" asChild title="Editar Post">
                    <Link href={`/admin/blog-posts/${post.id}/edit`}>
                      <Edit className="h-4 w-4" />
                    </Link>
                  </Button>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => setPostToDelete(post)}
                      disabled={isDeletePending && postToDelete?.id === post.id || isStaticExport}
                      title="Excluir Post"
                    >
                      {isDeletePending && postToDelete?.id === post.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </AlertDialogTrigger>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <AlertDialogContent>
        {postToDelete && (
          <>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja excluir o post "{postToDelete.title}"? Esta ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeletePending}>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteConfirm}
                disabled={isDeletePending || isStaticExport}
                className="bg-destructive hover:bg-destructive/90"
              >
                {isDeletePending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Excluir
              </AlertDialogAction>
            </AlertDialogFooter>
          </>
        )}
      </AlertDialogContent>
    </AlertDialog>
  );
}
