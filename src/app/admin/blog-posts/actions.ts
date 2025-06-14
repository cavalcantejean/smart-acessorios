
"use server";

import { z } from 'zod';
import { PostFormSchema } from '@/lib/schemas/post-schema';
import { addPost, updatePost, deletePost as deletePostData } from '@/lib/data-admin';
import { getPostById } from '@/lib/data';
import type { Post } from '@/lib/types';
import { revalidatePath } from 'next/cache';
import { adminDb } from '@/lib/firebase-admin';
// AdminTimestamp type is not explicitly needed here if we use duck-typing for .toDate()

interface ClientSafePost extends Omit<Post, 'createdAt' | 'updatedAt' | 'publishedAt' | 'tags'> {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  imageUrl: string;
  imageHint?: string;
  authorName: string;
  authorAvatarUrl?: string;
  authorAvatarHint?: string;
  category?: string;
  tags: string[];
  publishedAt?: string; // ISO string
  embedHtml?: string;
  createdAt?: string; // ISO string
  updatedAt?: string; // ISO string
}

export interface PostActionResult {
  success: boolean;
  message?: string;
  error?: string;
  errors?: z.ZodIssue[];
  post?: ClientSafePost;
}

const parseTags = (tagsString?: string): string[] => {
  if (!tagsString || tagsString.trim() === "") return [];
  return tagsString.split(',').map(tag => tag.trim()).filter(tag => tag !== "");
};

// Changed postData type to `any` to handle raw data from adminDb
function serializePostForClient(postData: any): ClientSafePost | undefined {
  if (!postData) return undefined;

  const createdAtTimestamp = postData.createdAt;
  const updatedAtTimestamp = postData.updatedAt;
  const publishedAtTimestamp = postData.publishedAt;

  return {
    id: postData.id,
    title: postData.title,
    slug: postData.slug,
    excerpt: postData.excerpt,
    content: postData.content,
    imageUrl: postData.imageUrl,
    imageHint: postData.imageHint,
    authorName: postData.authorName,
    authorAvatarUrl: postData.authorAvatarUrl,
    authorAvatarHint: postData.authorAvatarHint,
    category: postData.category,
    tags: Array.isArray(postData.tags) ? postData.tags : [],
    publishedAt: publishedAtTimestamp?.toDate?.().toISOString(),
    embedHtml: postData.embedHtml,
    createdAt: createdAtTimestamp?.toDate?.().toISOString(),
    updatedAt: updatedAtTimestamp?.toDate?.().toISOString(),
  };
}


export async function createPostAction(
  prevState: PostActionResult | null,
  formData: FormData
): Promise<PostActionResult> {
  if (!adminDb) {
    console.error("[Action:createPost] Firebase Admin SDK (adminDb) is not initialized.");
    return { success: false, error: "Erro crítico na configuração do servidor (Admin SDK)." };
  }
  console.log("[Action:createPost] Raw form data received:", Object.fromEntries(formData.entries()));
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
  console.log("[Action:createPost] Data for Zod validation:", dataToValidate);

  const validatedFields = PostFormSchema.safeParse(dataToValidate);

  if (!validatedFields.success) {
    console.error("[Action:createPost] Zod validation failed:", validatedFields.error.flatten());
    return {
      success: false,
      message: "Falha na validação. Verifique os campos.",
      errors: validatedFields.error.errors,
      error: "Dados inválidos. Corrija os erros abaixo."
    };
  }
  console.log("[Action:createPost] Zod validation successful. Data for DB:", validatedFields.data);

  try {
    const postDataForDbCreation = {
      ...validatedFields.data,
      tags: parseTags(validatedFields.data.tags),
    };
    console.log("[Action:createPost] Calling addPost with data:", postDataForDbCreation);
    // addPost from data-admin.ts returns data with AdminTimestamps
    const newPostFromDbAdmin = await addPost(postDataForDbCreation as Omit<Post, 'id' | 'createdAt' | 'updatedAt'>);
    
    if (newPostFromDbAdmin) {
      console.log("[Action:createPost] Post created successfully in DB:", newPostFromDbAdmin);
      // newPostFromDbAdmin has AdminTimestamps
      revalidatePath('/admin/blog-posts');
      revalidatePath('/blog');
      revalidatePath(`/blog/${newPostFromDbAdmin.slug}`);
      revalidatePath('/');
      return {
        success: true,
        message: `Post "${newPostFromDbAdmin.title}" criado com sucesso!`,
        post: serializePostForClient(newPostFromDbAdmin) // Pass raw data with AdminTimestamps
      };
    } else {
      console.error("[Action:createPost] addPost returned null or undefined.");
      return { success: false, error: "Falha ao criar o post no sistema (addPost retornou nulo)." };
    }
  } catch (error: any) {
    console.error("[Action:createPost] Error caught in createPostAction:", error);
    let errorMessage = "Erro no servidor ao tentar criar o post.";
    if (error.message) {
        errorMessage += ` Detalhes: ${error.message}`;
    }
    if (error.stack) {
        console.error("[Action:createPost] Stack Trace:", error.stack);
    }
    return { success: false, error: errorMessage };
  }
}

export async function updatePostAction(
  postId: string,
  prevState: PostActionResult | null,
  formData: FormData
): Promise<PostActionResult> {
  if (!adminDb) {
    console.error("[Action:updatePost] Firebase Admin SDK (adminDb) is not initialized.");
    return { success: false, error: "Erro crítico na configuração do servidor (Admin SDK)." };
  }
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
    const postDataForDbUpdate = {
      ...validatedFields.data,
      tags: parseTags(validatedFields.data.tags),
    };
    // updatePost from data-admin.ts returns data with AdminTimestamps
    const updatedPostFromDbAdmin = await updatePost(postId, postDataForDbUpdate as Partial<Omit<Post, 'id'>>);
    if (updatedPostFromDbAdmin) {
      // updatedPostFromDbAdmin has AdminTimestamps
      revalidatePath('/admin/blog-posts');
      revalidatePath(`/admin/blog-posts/${postId}/edit`);
      revalidatePath('/blog');
      revalidatePath(`/blog/${updatedPostFromDbAdmin.slug}`);
      revalidatePath('/');
      return {
        success: true,
        message: `Post "${updatedPostFromDbAdmin.title}" atualizado com sucesso!`,
        post: serializePostForClient(updatedPostFromDbAdmin) // Pass raw data with AdminTimestamps
      };
    } else {
      return { success: false, error: `Falha ao atualizar o post. ID ${postId} não encontrado.` };
    }
  } catch (error: any) {
    console.error("[Action:updatePost] Error caught in updatePostAction:", error);
    let errorMessage = "Erro no servidor ao tentar atualizar o post.";
     if (error.message) {
        errorMessage += ` Detalhes: ${error.message}`;
    }
    return { success: false, error: errorMessage };
  }
}

export async function deletePostAction(
  prevState: PostActionResult | null,
  formData: FormData
): Promise<PostActionResult> {
  if (!adminDb) {
    console.error("[Action:deletePost] Firebase Admin SDK (adminDb) is not initialized.");
    return { success: false, error: "Erro crítico na configuração do servidor (Admin SDK)." };
  }
  const postId = formData.get('postId') as string;

  if (!postId) {
    return { success: false, error: "ID do post ausente." };
  }

  try {
    const postToDelete = await getPostById(postId); 
    const deleted = await deletePostData(postId); 
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
  } catch (error: any) {
    console.error("[Action:deletePost] Error in deletePostAction:", error);
    return { success: false, error: "Erro no servidor ao excluir post." };
  }
}
    
    