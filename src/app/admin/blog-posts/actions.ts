
"use server";

import { z } from 'zod';
import { PostFormSchema } from '@/lib/schemas/post-schema';
import { addPost, updatePost, deletePost as deletePostData } from '@/lib/data-admin'; // Importar de data-admin.ts
import { getPostById } from '@/lib/data'; // getPostById (leitura) pode vir de data.ts
import type { Post } from '@/lib/types';
import { revalidatePath } from 'next/cache';

export interface PostActionResult {
  success: boolean;
  message?: string;
  error?: string;
  errors?: z.ZodIssue[];
  post?: Post;
}

const parseTags = (tagsString?: string): string[] => {
  if (!tagsString || tagsString.trim() === "") return [];
  return tagsString.split(',').map(tag => tag.trim()).filter(tag => tag !== "");
};

export async function createPostAction(
  prevState: PostActionResult | null,
  formData: FormData
): Promise<PostActionResult> {
  const rawFormData = Object.fromEntries(formData.entries());
  const dataToValidate = {
    ...rawFormData,
    tags: rawFormData.tags as string | undefined,
    authorAvatarUrl: rawFormData.authorAvatarUrl || undefined,
    authorAvatarHint: rawFormData.authorAvatarHint || undefined,
    category: rawFormData.category || undefined,
    imageHint: rawFormData.imageHint || undefined,
    publishedAt: rawFormData.publishedAt || new Date().toISOString().split('T')[0],
    embedHtml: rawFormData.embedHtml || undefined,
  };

  const validatedFields = PostFormSchema.safeParse(dataToValidate);

  if (!validatedFields.success) {
    return {
      success: false,
      message: "Falha na validação. Verifique os campos.",
      errors: validatedFields.error.errors,
      error: "Dados inválidos. Corrija os erros abaixo."
    };
  }

  try {
    const postDataForDb = {
      ...validatedFields.data,
      tags: parseTags(validatedFields.data.tags),
    };
    const newPost = await addPost(postDataForDb as any); // Usa addPost de data-admin.ts
    if (newPost) {
      revalidatePath('/admin/blog-posts');
      revalidatePath('/blog');
      revalidatePath(`/blog/${newPost.slug}`);
      revalidatePath('/');
      return {
        success: true,
        message: `Post "${newPost.title}" criado com sucesso!`,
        post: newPost
      };
    } else {
      return { success: false, error: "Falha ao criar o post no sistema." };
    }
  } catch (error) {
    console.error("Error in createPostAction:", error);
    return { success: false, error: "Erro no servidor ao tentar criar o post." };
  }
}

export async function updatePostAction(
  postId: string,
  prevState: PostActionResult | null,
  formData: FormData
): Promise<PostActionResult> {
  const rawFormData = Object.fromEntries(formData.entries());
  const dataToValidate = {
    ...rawFormData,
    tags: rawFormData.tags as string | undefined,
    authorAvatarUrl: rawFormData.authorAvatarUrl || undefined,
    authorAvatarHint: rawFormData.authorAvatarHint || undefined,
    category: rawFormData.category || undefined,
    imageHint: rawFormData.imageHint || undefined,
    publishedAt: rawFormData.publishedAt || undefined,
    embedHtml: rawFormData.embedHtml || undefined,
  };

  const validatedFields = PostFormSchema.safeParse(dataToValidate);

  if (!validatedFields.success) {
    return {
      success: false,
      message: "Falha na validação. Verifique os campos.",
      errors: validatedFields.error.errors,
      error: "Dados inválidos. Corrija os erros abaixo."
    };
  }

  try {
    const postDataForDb = {
      ...validatedFields.data,
      tags: parseTags(validatedFields.data.tags),
    };
    const updatedPost = await updatePost(postId, postDataForDb as any); // Usa updatePost de data-admin.ts
    if (updatedPost) {
      revalidatePath('/admin/blog-posts');
      revalidatePath(`/admin/blog-posts/${postId}/edit`);
      revalidatePath('/blog');
      revalidatePath(`/blog/${updatedPost.slug}`);
      revalidatePath('/');
      return {
        success: true,
        message: `Post "${updatedPost.title}" atualizado com sucesso!`,
        post: updatedPost
      };
    } else {
      return { success: false, error: `Falha ao atualizar o post. ID ${postId} não encontrado.` };
    }
  } catch (error) {
    console.error("Error in updatePostAction:", error);
    return { success: false, error: "Erro no servidor ao tentar atualizar o post." };
  }
}

export async function deletePostAction(
  prevState: PostActionResult | null,
  formData: FormData
): Promise<PostActionResult> {
  const postId = formData.get('postId') as string;

  if (!postId) {
    return { success: false, error: "ID do post ausente." };
  }

  try {
    const postToDelete = await getPostById(postId); // Leitura de data.ts
    const deleted = await deletePostData(postId); // Escrita de data-admin.ts
    if (deleted && postToDelete) {
      revalidatePath('/admin/blog-posts');
      revalidatePath('/blog');
      revalidatePath(`/blog/${postToDelete.slug}`);
      revalidatePath('/');
      return { success: true, message: "Post excluído com sucesso." };
    } else if (deleted && !postToDelete){
       revalidatePath('/admin/blog-posts');
       revalidatePath('/blog');
       revalidatePath('/');
       return { success: true, message: "Post excluído com sucesso (slug não encontrado para revalidação específica)." };
    }else {
      return { success: false, error: "Falha ao excluir post. Não encontrado." };
    }
  } catch (error) {
    console.error("Error in deletePostAction:", error);
    return { success: false, error: "Erro no servidor ao excluir post." };
  }
}
    