
"use server";

import { z } from 'zod';
import { PostFormSchema, type PostFormValues } from '@/lib/schemas/post-schema';
import { addPost, updatePost, deletePost as deletePostData, getPostById } from '@/lib/data';
import type { Post } from '@/lib/types';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export interface PostActionResult {
  success: boolean;
  message?: string;
  error?: string; // General error message
  errors?: z.ZodIssue[]; // Specific field validation errors
  post?: Post;
}

// Helper to convert comma-separated tags string to string array
const parseTags = (tagsString?: string): string[] => {
  if (!tagsString || tagsString.trim() === "") return [];
  return tagsString.split(',').map(tag => tag.trim()).filter(tag => tag !== "");
};

export async function createPostAction(
  prevState: PostActionResult | null,
  formData: FormData
): Promise<PostActionResult> {
  const rawFormData = Object.fromEntries(formData.entries());
  
  // Handle optional fields and parse tags
  const dataToValidate = {
    ...rawFormData,
    tags: rawFormData.tags as string | undefined, // Keep as string for schema validation
    authorAvatarUrl: rawFormData.authorAvatarUrl || undefined,
    authorAvatarHint: rawFormData.authorAvatarHint || undefined,
    category: rawFormData.category || undefined,
    imageHint: rawFormData.imageHint || undefined,
    publishedAt: rawFormData.publishedAt || new Date().toISOString().split('T')[0], // Default to today if empty
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
      publishedAt: new Date(validatedFields.data.publishedAt || Date.now()).toISOString(),
    };

    const newPost = addPost(postDataForDb);
    if (newPost) {
      revalidatePath('/admin/blog-posts');
      revalidatePath('/blog');
      revalidatePath(`/blog/${newPost.slug}`);
      revalidatePath('/'); // Revalidate homepage if latest posts are shown
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
      publishedAt: validatedFields.data.publishedAt 
                     ? new Date(validatedFields.data.publishedAt).toISOString() 
                     : new Date().toISOString(), // Fallback for publishedAt
    };

    const updatedPost = updatePost(postId, postDataForDb);
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
    const postToDelete = getPostById(postId); // Get slug before deleting for revalidation
    const deleted = deletePostData(postId);
    if (deleted && postToDelete) {
      revalidatePath('/admin/blog-posts');
      revalidatePath('/blog');
      revalidatePath(`/blog/${postToDelete.slug}`); // Revalidate specific slug
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
