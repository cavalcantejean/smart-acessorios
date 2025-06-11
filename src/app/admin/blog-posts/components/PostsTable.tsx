
"use client";

import { useState, useEffect, useActionState, startTransition } from 'react';
import type { Post } from '@/lib/types';
import { deletePostAction, type PostActionResult } from '../actions';
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
import { Edit, Trash2, Loader2, ExternalLink, CalendarDays, UserCircleIcon } from 'lucide-react';
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
}

const initialActionState: PostActionResult = { success: false };

export default function PostsTable({ initialPosts }: PostsTableProps) {
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [deleteState, handleDeleteAction, isDeletePending] = useActionState(deletePostAction, initialActionState);
  const { toast } = useToast();
  const [postToDelete, setPostToDelete] = useState<Post | null>(null);

  useEffect(() => {
    setPosts(initialPosts);
  }, [initialPosts]);

  useEffect(() => {
    if (deleteState?.message) {
      if (deleteState.success) {
        toast({
          title: "Sucesso!",
          description: deleteState.message,
        });
        if (postToDelete) {
          setPosts(prevPosts => prevPosts.filter(p => p.id !== postToDelete.id));
        }
      } else if (!deleteState.success && deleteState.error) {
        toast({
          title: "Erro",
          description: deleteState.error,
          variant: "destructive",
        });
      }
      setPostToDelete(null);
    }
  }, [deleteState, toast, postToDelete]);

  const handleDeleteConfirm = () => {
    if (postToDelete) {
      const formData = new FormData();
      formData.append('postId', postToDelete.id);
      startTransition(() => {
        handleDeleteAction(formData);
      });
    }
  };

  const formatDate = (dateInput: Timestamp | Date | string) => {
    let date: Date;
    if (dateInput instanceof Timestamp) {
      date = dateInput.toDate();
    } else if (dateInput instanceof Date) {
      date = dateInput;
    } else {
      date = new Date(dateInput); // Attempt to parse if string
    }
    if (isNaN(date.getTime())) return 'Data inválida';
    return date.toLocaleDateString('pt-BR', {
      year: 'numeric', month: 'short', day: 'numeric',
    });
  };


  return (
    <AlertDialog open={!!postToDelete} onOpenChange={(isOpen) => { if (!isOpen) setPostToDelete(null); }}>
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
                      disabled={isDeletePending && postToDelete?.id === post.id}
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
                disabled={isDeletePending}
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
