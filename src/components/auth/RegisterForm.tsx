
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, UserPlus } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react"; // Removed useActionState, startTransition
import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

const registerFormSchema = z.object({
  name: z.string().min(2, { message: "O nome deve ter pelo menos 2 caracteres." }),
  email: z.string().email({ message: "Por favor, insira um e-mail válido." }),
  password: z.string().min(6, { message: "A senha deve ter pelo menos 6 caracteres." }),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas não coincidem.",
  path: ["confirmPassword"],
});

type RegisterFormValues = z.infer<typeof registerFormSchema>;

interface RegisterFormProps {
  // formAction prop removed
  title: string;
  description: string;
  submitButtonText: string;
  linkToLogin?: { href: string; text: string; label: string; };
}

export default function RegisterForm({ title, description, submitButtonText, linkToLogin }: RegisterFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const handleClientSideRegister = async (values: RegisterFormValues) => {
    setIsLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
      const firebaseUser = userCredential.user;

      await updateProfile(firebaseUser, { displayName: values.name });

      const userDocRef = doc(db, "usuarios", firebaseUser.uid);
      await setDoc(userDocRef, {
        id: firebaseUser.uid,
        name: values.name,
        email: values.email,
        isAdmin: false, // Default to not admin
        avatarUrl: `https://placehold.co/150x150.png?text=${values.name.charAt(0).toUpperCase()}`, // Simple placeholder
        avatarHint: "user initial",
        bio: "",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      toast({
        title: "Cadastro Realizado com Sucesso!",
        description: "Você será redirecionado para a página de login.",
      });
      form.reset();
      router.push('/login?message=Cadastro%20realizado!%20Faça%20login.');
    } catch (error: any) {
      console.error("Erro no registro (client-side):", error);
      let errorMessage = "Ocorreu um erro ao tentar se cadastrar.";
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = "Este e-mail já está cadastrado.";
      } else if (error.code === 'auth/weak-password') {
        errorMessage = "A senha é muito fraca. Tente uma senha mais forte.";
      }
      toast({
        title: "Erro de Cadastro",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl font-headline">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleClientSideRegister)}
            className="space-y-6"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome Completo</FormLabel>
                  <FormControl>
                    <Input placeholder="Seu Nome" {...field} autoComplete="name" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="seu@email.com" {...field} autoComplete="email" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Senha</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="•••••••• (mínimo 6 caracteres)" {...field} autoComplete="new-password" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirmar Senha</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} autoComplete="new-password" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <UserPlus className="mr-2 h-4 w-4" />
              )}
              {submitButtonText}
            </Button>
          </form>
        </Form>
        {linkToLogin && (
          <div className="mt-6 text-center text-sm">
            {linkToLogin.text}{" "}
            <Link href={linkToLogin.href} className="font-semibold text-primary hover:underline">
              {linkToLogin.label}
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
