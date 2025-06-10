
'use server';

import type { RegisterFormState } from '@/components/auth/RegisterForm';
import { z } from 'zod';
import type { AuthUser, User } from '@/lib/types'; // Import User type as well for Firestore data structure
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, doc, setDoc, serverTimestamp } from 'firebase/firestore';

const RegisterSchema = z.object({
  name: z.string().min(2, { message: "O nome deve ter pelo menos 2 caracteres." }),
  email: z.string().email({ message: "Por favor, insira um e-mail válido." }),
  password: z.string().min(6, { message: "A senha deve ter pelo menos 6 caracteres." }),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas não coincidem.",
  path: ["confirmPassword"],
});

export async function registerUserAction(
  prevState: RegisterFormState,
  formData: FormData
): Promise<RegisterFormState> {
  const validatedFields = RegisterSchema.safeParse(
    Object.fromEntries(formData.entries())
  );

  if (!validatedFields.success) {
    return {
      message: "Dados de cadastro inválidos. Verifique os campos.",
      success: false,
      issues: validatedFields.error.flatten().fieldErrors,
      fields: {
        name: formData.get('name')?.toString() || '',
        email: formData.get('email')?.toString() || '',
      },
      user: null,
    };
  }

  const { name, email, password } = validatedFields.data;
  const lowercasedEmail = email.toLowerCase(); // Use lowercase for consistent querying

  console.log("Attempting User Registration with Firestore:", { name, email: lowercasedEmail });
  
  try {
    // 1. Check if user already exists in Firestore
    const usersRef = collection(db, "usuarios");
    const q = query(usersRef, where("email", "==", lowercasedEmail));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      return {
        message: "Este e-mail já está cadastrado.",
        success: false,
        issues: { email: ["Este e-mail já está cadastrado."] },
        fields: { name, email: lowercasedEmail },
        user: null,
      };
    }

    // 2. Add new user to Firestore
    const newUserId = doc(collection(db, "usuarios")).id; // Generate a new unique ID

    const newUserFirestoreData: Omit<User, 'password'> & { password?: string; createdAt: any } = { // Password is still stored for mock compatibility
      id: newUserId,
      name,
      email: lowercasedEmail,
      // ATENÇÃO: Armazenar senha em texto plano é INSEGURO.
      // Isto é mantido apenas para compatibilidade com a estrutura mock atual.
      // INTEGRE O FIREBASE AUTHENTICATION para um manuseio seguro de senhas.
      password: password,
      isAdmin: false,
      followers: [],
      following: [],
      badges: [],
      createdAt: serverTimestamp(), // Firestore server-side timestamp
      // avatarUrl and bio can be added later or set to defaults if needed
    };

    await setDoc(doc(db, "usuarios", newUserId), newUserFirestoreData);

    console.log("User registration successful with Firestore:", newUserFirestoreData);
    
    const authUser: AuthUser = {
      id: newUserId,
      name,
      email: lowercasedEmail,
      isAdmin: false,
    };

    return { 
      message: `Cadastro de ${name} realizado com sucesso! Um e-mail de confirmação (simulado) foi enviado para ${email}. Por favor, verifique sua caixa de entrada e também a pasta de spam para validar seu cadastro.`, 
      success: true,
      user: authUser, 
    };

  } catch (error) {
    console.error("--- Firestore Registration Error ---");
    console.error("Timestamp:", new Date().toISOString());
    console.error("Input Data:", { name, email: lowercasedEmail }); // Log input that led to error
    if (error instanceof Error) {
        console.error("Error Name:", error.name);
        console.error("Error Message:", error.message);
        console.error("Error Stack:", error.stack);
        // Specific Firebase error properties
        if ('code' in error) {
          console.error("Firebase Error Code:", (error as any).code);
        }
    } else {
        console.error("Raw Error Object:", error);
    }
    console.error("--- End Firestore Registration Error ---");

    let clientErrorMessage = "Não foi possível registrar o usuário. Tente novamente.";
    // Potentially customize clientErrorMessage based on specific Firebase error codes if desired later
    // For example: if ((error as any).code === 'permission-denied') clientErrorMessage = "Permissão negada ao tentar registrar no banco de dados."

    return {
      message: clientErrorMessage,
      success: false,
      fields: { name, email: lowercasedEmail },
      user: null,
    };
  }
}
