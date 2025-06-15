
"use client";

import { useState, useEffect, useTransition } from 'react'; // useActionState removed, useTransition added directly
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
import { Timestamp } from 'firebase/firestore'; // doc, deleteDoc, db removed
import { useAuth } from '@/hooks/useAuth';
// import { db } from '@/lib/firebase'; // Removed db
import { deletePostAction, type PostActionResult } from '@/app/admin/blog-posts/actions'; // Added

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

export default function PostsTable({ initialPosts }: PostsTableProps) { // isStaticExport removed
  const [posts, setPosts] = useState<Post[]>(initialPosts); // Will be updated by revalidation
  const { toast } = useToast();
  const [postToDelete, setPostToDelete] = useState<Post | null>(null);
  const [isDeletePending, setIsDeletePending] = useState(false); // For local button loading state
  const { user: authUser, isAuthenticated } = useAuth();
  const [isTransitioning, startApiTransition] = useTransition(); // Corrected useTransition


  useEffect(() => {
    setPosts(initialPosts);
  }, [initialPosts]);

  const handleDeleteConfirm = async () => {
    // isStaticExport check removed
    if (!isAuthenticated || !authUser?.id) {
      toast({ title: "Não autenticado", description: "Você precisa estar logado como administrador para excluir.", variant: "destructive" });
      setPostToDelete(null);
      return;
    }

    if (!postToDelete) {
      toast({ title: "Erro Interno", description: "Nenhum post selecionado para exclusão.", variant: "destructive" });
      return;
    }

    setIsDeletePending(true);
    startApiTransition(async () => {
      // Pass slug if available for more specific revalidation, though actions.ts doesn't use it currently
      const result: Omit<PostActionResult, 'post' | 'slug'> = await deletePostAction(postToDelete.id);
      if (result.success) {
        toast({ title: "Sucesso!", description: result.message });
        // Data revalidation is handled by revalidatePath in the server action.
      } else {
        toast({
          title: "Erro ao Excluir",
          description: result.message || "Ocorreu um erro desconhecido.",
          variant: "destructive",
        });
      }
      setIsDeletePending(false);
      setPostToDelete(null);
    });
  };

  return (
    <AlertDialog open={!!postToDelete} onOpenChange={(isOpen) => { if (!isOpen) setPostToDelete(null); }}>
      {/* isStaticExport message div removed */}
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
                      disabled={isDeletePending || isTransitioning}
                      title="Excluir Post"
                    >
                      {(isDeletePending && postToDelete?.id === post.id) || (isTransitioning && postToDelete?.id === post.id) ? (
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
                disabled={isDeletePending || isTransitioning || !isAuthenticated}
                className="bg-destructive hover:bg-destructive/90"
              >
                {isDeletePending || isTransitioning ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Excluir
              </AlertDialogAction>
            </AlertDialogFooter>
          </>
        )}
      </AlertDialogContent>
    </AlertDialog>
  );
}
