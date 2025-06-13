
"use server";

import { z } from 'zod';
import { PostFormSchema } from '@/lib/schemas/post-schema';
import { addPost, updatePost, deletePost as deletePostData } from '@/lib/data-admin';
import { getPostById } from '@/lib/data';
import type { Post } from '@/lib/types';
import { revalidatePath } from 'next/cache';
import type { Timestamp as AdminTimestamp } from 'firebase-admin/firestore';

// Helper type for client-safe post, mirroring Post type but with string dates
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
  post?: ClientSafePost; // Use client-safe type
}

const parseTags = (tagsString?: string): string[] => {
  if (!tagsString || tagsString.trim() === "") return [];
  return tagsString.split(',').map(tag => tag.trim()).filter(tag => tag !== "");
};

// Helper function to serialize a post for client
function serializePostForClient(post: Post | null | undefined): ClientSafePost | undefined {
  if (!post) return undefined;

  const adminCreatedAt = post.createdAt as unknown as AdminTimestamp | undefined;
  const adminUpdatedAt = post.updatedAt as unknown as AdminTimestamp | undefined;
  const adminPublishedAt = post.publishedAt as unknown as AdminTimestamp | undefined;

  return {
    id: post.id,
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt,
    content: post.content,
    imageUrl: post.imageUrl,
    imageHint: post.imageHint,
    authorName: post.authorName,
    authorAvatarUrl: post.authorAvatarUrl,
    authorAvatarHint: post.authorAvatarHint,
    category: post.category,
    tags: Array.isArray(post.tags) ? post.tags : [],
    publishedAt: adminPublishedAt?.toDate?.().toISOString(),
    embedHtml: post.embedHtml,
    createdAt: adminCreatedAt?.toDate?.().toISOString(),
    updatedAt: adminUpdatedAt?.toDate?.().toISOString(),
  };
}


export async function createPostAction(
  prevState: PostActionResult | null,
  formData: FormData
): Promise<PostActionResult> {
  console.log("[Action:createPost] Raw form data received:", Object.fromEntries(formData.entries()));
  const rawFormData = Object.fromEntries(formData.entries());
  const dataToValidate = {
    ...rawFormData,
    tags: rawFormData.tags as string | undefined, // Keep as string for schema validation
    authorAvatarUrl: rawFormData.authorAvatarUrl || undefined,
    authorAvatarHint: rawFormData.authorAvatarHint || undefined,
    category: rawFormData.category || undefined,
    imageHint: rawFormData.imageHint || undefined,
    publishedAt: rawFormData.publishedAt || new Date().toISOString().split('T')[0], // Default to today if empty
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
    const postDataForDb = {
      ...validatedFields.data,
      tags: parseTags(validatedFields.data.tags), // Convert tags string to array
    };
    console.log("[Action:createPost] Calling addPost with data:", postDataForDb);
    const newPostFromDb = await addPost(postDataForDb as Omit<Post, 'id' | 'createdAt' | 'updatedAt'>); // Uses addPost from data-admin.ts
    
    if (newPostFromDb) {
      console.log("[Action:createPost] Post created successfully in DB:", newPostFromDb);
      revalidatePath('/admin/blog-posts');
      revalidatePath('/blog');
      revalidatePath(`/blog/${newPostFromDb.slug}`);
      revalidatePath('/');
      return {
        success: true,
        message: `Post "${newPostFromDb.title}" criado com sucesso!`,
        post: serializePostForClient(newPostFromDb) // Serialize before sending to client
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
    const updatedPostFromDb = await updatePost(postId, postDataForDb as Partial<Omit<Post, 'id'>>); 
    if (updatedPostFromDb) {
      revalidatePath('/admin/blog-posts');
      revalidatePath(`/admin/blog-posts/${postId}/edit`);
      revalidatePath('/blog');
      revalidatePath(`/blog/${updatedPostFromDb.slug}`);
      revalidatePath('/');
      return {
        success: true,
        message: `Post "${updatedPostFromDb.title}" atualizado com sucesso!`,
        post: serializePostForClient(updatedPostFromDb) // Serialize before sending to client
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
    
