
'use server';

import type { RegisterFormState } from '@/components/auth/RegisterForm';
import { z } from 'zod';
import { auth, db } from '@/lib/firebase'; // Firebase Auth and Firestore
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth'; // Import sendEmailVerification
import { doc, setDoc, serverTimestamp, collection, query, where, getDocs } from 'firebase/firestore';
import type { AuthUser, UserFirestoreData } from '@/lib/types';

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
  console.log("--- registerUserAction Server Action START (Firebase Auth) ---");

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

  console.log("Attempting User Registration with Firebase Auth:", { name, email: lowercasedEmail });
  
  if (!auth || !db) {
    console.error("!!! CRITICAL: Firebase 'auth' or 'db' instance is not available in registerUserAction. Registration aborted. !!!");
    return {
      message: "Erro crítico na configuração. Contate o suporte.",
      success: false,
      fields: { name, email: lowercasedEmail },
      user: null,
    };
  }

  try {
    // Verificar se o e-mail já existe na coleção 'usuarios' do Firestore
    const usersRef = collection(db, "usuarios");
    const q = query(usersRef, where("email", "==", lowercasedEmail));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      console.log("Email already exists in Firestore 'usuarios' collection.");
      return {
        message: "Este e-mail já está cadastrado. Tente fazer login ou use outro e-mail.",
        success: false,
        issues: { email: ["Este e-mail já está cadastrado."] },
        fields: { name, email: lowercasedEmail },
        user: null,
      };
    }

    // Step 1: Create user in Firebase Authentication
    const userCredential = await createUserWithEmailAndPassword(auth, lowercasedEmail, password);
    const firebaseAuthUser = userCredential.user;
    console.log("Firebase Auth user created successfully:", firebaseAuthUser.uid);

    // Step 2: Create user document in Firestore
    const newUserFirestoreData: UserFirestoreData = { 
      id: firebaseAuthUser.uid,
      name,
      email: lowercasedEmail,
      isAdmin: false,
      followers: [],
      following: [],
      badges: [],
      createdAt: serverTimestamp(),
      avatarUrl: `https://placehold.co/150x150.png?text=${name.charAt(0).toUpperCase()}`, // Simple placeholder avatar
      avatarHint: "user avatar placeholder",
      bio: `Novo membro da comunidade SmartAcessorios!`,
    };

    // Log do objeto que será enviado para o Firestore
    console.log("Data to be sent to Firestore (newUserFirestoreData):", JSON.stringify(newUserFirestoreData, null, 2));

    await setDoc(doc(db, "usuarios", firebaseAuthUser.uid), newUserFirestoreData);
    console.log("Firestore document created for user:", firebaseAuthUser.uid);
    
    // Step 3: Send email verification
    try {
      await sendEmailVerification(firebaseAuthUser);
      console.log("Verification email sent to:", firebaseAuthUser.email);
    } catch (emailError) {
      console.error("Error sending verification email:", emailError);
      // Não consideramos isso um erro fatal para o registro, mas logamos.
      // Poderia adicionar uma mensagem ao usuário aqui, se desejado.
    }
    
    const authUserForState: AuthUser = {
      id: firebaseAuthUser.uid,
      name,
      email: lowercasedEmail,
      isAdmin: false,
    };

    return { 
      message: `Cadastro de ${name} realizado com sucesso! Um e-mail de verificação foi enviado para ${lowercasedEmail}. Por favor, verifique sua caixa de entrada (e spam).`, 
      success: true,
      user: authUserForState, 
    };

  } catch (error: any) {
    console.error("--- Firebase Registration Error in registerUserAction CATCH BLOCK ---");
    console.error("Timestamp:", new Date().toISOString());
    console.error("Input Data:", { name, email: lowercasedEmail }); 
    
    let errorMessage = "Não foi possível registrar o usuário. Tente novamente.";
    if (error.code === 'auth/email-already-in-use') {
      errorMessage = "Este e-mail já está cadastrado no Firebase Authentication. Tente fazer login ou use outro e-mail.";
      return {
        message: errorMessage,
        success: false,
        issues: { email: [errorMessage] },
        fields: { name, email: lowercasedEmail },
        user: null,
      };
    } else if (error.code === 'auth/weak-password') {
      errorMessage = "A senha é muito fraca. Use pelo menos 6 caracteres.";
       return {
        message: errorMessage,
        success: false,
        issues: { password: [errorMessage] },
        fields: { name, email: lowercasedEmail },
        user: null,
      };
    } else {
      console.error("Firebase Error Code:", error.code);
      console.error("Firebase Error Message:", error.message);
      console.error("Full Firebase Error Object:", error);
      errorMessage = `Erro no servidor ao registrar: ${error.message || 'Erro desconhecido.'} (Código: ${error.code || 'N/A'})`;
    }
    console.error("--- End Firebase Registration Error ---");
    
    return {
      message: errorMessage,
      success: false,
      fields: { name, email: lowercasedEmail },
      user: null,
    };
  }
}
