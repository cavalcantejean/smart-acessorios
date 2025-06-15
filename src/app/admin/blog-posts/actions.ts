'use server';

import { revalidatePath } from 'next/cache';
import { PostFormSchema, type PostFormValues } from '@/lib/schemas/post-schema';
import {
  addPost,
  updatePost,
  deletePost
} from '@/lib/data-admin';
import type { Post } from '@/lib/types';

// Helper type for Server Action responses
export interface PostActionResult {
  success: boolean;
  message?: string;
  error?: string | { [key: string]: string[] };
  post?: Post | null;
  slug?: string | null; // To help with revalidating specific post pages
}

// Utility to convert FormData from PostForm to a suitable object
const processPostFormData = (formData: FormData): Record<string, any> => {
  const data: { [key: string]: any } = {};
  formData.forEach((value, key) => {
    // Convert tags string "tag1, tag2" to array ["tag1", "tag2"]
    if (key === 'tags' && typeof value === 'string') {
      data[key] = value.split(',').map(tag => tag.trim()).filter(tag => tag !== '');
    } else {
      data[key] = value;
    }
  });
  // publishedAt will be a string like "YYYY-MM-DD" from the form.
  // data-admin functions (addPost, updatePost) handle conversion to Firestore Timestamp.
  // imageUrl (base64 or URL string) is passed as is.
  return data;
};

export async function addPostAction(
  prevState: PostActionResult | undefined,
  formData: FormData
): Promise<PostActionResult> {
  // Note: Authentication/Authorization should be enforced within data-admin functions.

  const rawData = processPostFormData(formData);
  const validatedFields = PostFormSchema.safeParse(rawData);

  if (!validatedFields.success) {
    console.error("Validation Error (Add Post):", validatedFields.error.flatten().fieldErrors);
    return {
      success: false,
      error: validatedFields.error.flatten().fieldErrors,
      message: "Erro de validação. Verifique os campos do post.",
    };
  }

  try {
    // addPost from data-admin.ts handles `createdAt`, `updatedAt`, `publishedAt` conversion, and expects tags as array.
    const newPost = await addPost(validatedFields.data as Omit<Post, 'id' | 'createdAt' | 'updatedAt'>); // Type assertion

    revalidatePath('/admin/blog-posts');
    revalidatePath('/blog');
    if (newPost.slug) {
      revalidatePath(`/blog/${newPost.slug}`);
    }

    return {
      success: true,
      message: 'Post adicionado com sucesso!',
      post: newPost,
      slug: newPost.slug,
    };
  } catch (e: any) {
    console.error("Error in addPostAction:", e);
    return {
      success: false,
      message: `Falha ao adicionar post: ${e.message || 'Erro desconhecido do servidor.'}`,
      error: e.message || 'Erro desconhecido do servidor.',
    };
  }
}

export async function updatePostAction(
  postId: string,
  prevState: PostActionResult | undefined,
  formData: FormData
): Promise<PostActionResult> {
  if (!postId) {
    return { success: false, message: "ID do post não fornecido para atualização." };
  }

  const rawData = processPostFormData(formData);
  const validatedFields = PostFormSchema.safeParse(rawData);

  if (!validatedFields.success) {
    console.error("Validation Error (Update Post):", validatedFields.error.flatten().fieldErrors);
    return {
      success: false,
      error: validatedFields.error.flatten().fieldErrors,
      message: "Erro de validação. Verifique os campos do post.",
    };
  }

  try {
    // updatePost from data-admin.ts handles `updatedAt`, `publishedAt` conversion, and expects tags as array.
    const updatedPost = await updatePost(postId, validatedFields.data as Partial<Omit<Post, 'id'>>); // Type assertion

    if (!updatedPost) {
        throw new Error("Falha ao atualizar o post no servidor.");
    }

    revalidatePath('/admin/blog-posts');
    revalidatePath(`/admin/blog-posts/${postId}/edit`);
    revalidatePath('/blog');
    if (updatedPost.slug) {
      revalidatePath(`/blog/${updatedPost.slug}`);
    }

    return {
      success: true,
      message: 'Post atualizado com sucesso!',
      post: updatedPost,
      slug: updatedPost.slug,
    };
  } catch (e: any) {
    console.error("Error in updatePostAction:", e);
    return {
      success: false,
      message: `Falha ao atualizar post: ${e.message || 'Erro desconhecido do servidor.'}`,
      error: e.message || 'Erro desconhecido do servidor.',
    };
  }
}

export async function deletePostAction(
  postId: string,
  // An optional slug can be passed if needed for more specific revalidation,
  // but usually revalidating the main blog listing is enough.
  // postSlug?: string
): Promise<Omit<PostActionResult, 'post' | 'slug'>> {
   if (!postId) {
    return { success: false, message: "ID do post não fornecido para exclusão." };
  }

  // Note: Authentication/Authorization should be enforced in data-admin.ts.

  try {
    // Optional: Fetch post to get slug for more specific revalidation before deleting
    // const post = await getPostById(postId); // Assuming getPostById exists for client or admin

    const success = await deletePost(postId);
    if (!success) {
        throw new Error("Falha ao excluir o post no servidor.");
    }

    revalidatePath('/admin/blog-posts');
    revalidatePath('/blog');
    // if (postSlug) { // Or if fetched: if (post?.slug)
    //   revalidatePath(`/blog/${postSlug}`);
    // }


    return {
      success: true,
      message: 'Post excluído com sucesso!',
    };
  } catch (e: any) {
    console.error("Error in deletePostAction:", e);
    return {
      success: false,
      message: `Falha ao excluir post: ${e.message || 'Erro desconhecido do servidor.'}`,
      error: e.message || 'Erro desconhecido do servidor.',
    };
  }
}
