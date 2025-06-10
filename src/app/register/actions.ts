
'use server';

import type { RegisterFormState } from '@/components/auth/RegisterForm';
import { z } from 'zod';
import type { AuthUser, User } from '@/lib/types';
import { db } from '@/lib/firebase'; // Importa a instância db
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
  console.log("--- registerUserAction Server Action START ---");
  console.log("Checking 'db' instance from firebase.ts:", db ? "db IS VALID" : "db IS NULL or UNDEFINED");

  const validatedFields = RegisterSchema.safeParse(
    Object.fromEntries(formData.entries())
  );

  if (!validatedFields.success) {
    console.log("Validation failed in registerUserAction.");
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
  const lowercasedEmail = email.toLowerCase();

  console.log("Attempting User Registration with Firestore:", { name, email: lowercasedEmail });
  
  // Verificação crucial antes do try-catch para Firestore
  if (!db) {
    console.error("!!! CRITICAL: Firestore 'db' instance is not available in registerUserAction. Registration aborted. Check firebase.ts logs. !!!");
    return {
      message: "Erro crítico na configuração do banco de dados. Contate o suporte.",
      success: false,
      fields: { name, email: lowercasedEmail },
      user: null,
    };
  }

  try {
    console.log("Proceeding with Firestore operations in registerUserAction...");
    // 1. Check if user already exists in Firestore
    const usersRef = collection(db, "usuarios");
    const q = query(usersRef, where("email", "==", lowercasedEmail));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      console.log("User email already exists in Firestore.");
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

    const newUserFirestoreData: Omit<User, 'password'> & { password?: string; createdAt: any } = { 
      id: newUserId,
      name,
      email: lowercasedEmail,
      password: password, 
      isAdmin: false,
      followers: [],
      following: [],
      badges: [],
      createdAt: serverTimestamp(), 
    };

    await setDoc(doc(db, "usuarios", newUserId), newUserFirestoreData);

    console.log("User registration successful with Firestore:", newUserFirestoreData.id);
    
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
    console.error("--- Firestore Registration Error in registerUserAction CATCH BLOCK ---");
    console.error("Timestamp:", new Date().toISOString());
    console.error("Input Data:", { name, email: lowercasedEmail }); 
    if (error instanceof Error) {
        console.error("Error Name:", error.name);
        console.error("Error Message:", error.message);
        console.error("Error Stack:", error.stack);
        if ('code' in error) {
          console.error("Firebase Error Code:", (error as any).code);
        }
    } else {
        console.error("Raw Error Object:", error);
    }
    console.error("--- End Firestore Registration Error ---");

    let clientErrorMessage = "Não foi possível registrar o usuário. Tente novamente.";
    if (error instanceof Error && (error as any).code === 'permission-denied') {
      clientErrorMessage = "Erro de permissão ao registrar no banco de dados. Verifique as regras de segurança do Firestore.";
    } else if (error instanceof Error && error.message.includes("Failed to get document because the client is offline")) {
      clientErrorMessage = "Falha na conexão com o banco de dados. Verifique sua internet ou tente mais tarde.";
    }
    
    return {
      message: clientErrorMessage,
      success: false,
      fields: { name, email: lowercasedEmail },
      user: null,
    };
  }
}
