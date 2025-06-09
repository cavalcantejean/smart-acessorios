
"use client";
import React, { useState, useEffect, useCallback, createContext, useContext, type ReactNode } from 'react';
import type { AuthUser } from '@/lib/types'; // Using AuthUser which omits password

// ESTE É UM HOOK E PROVEDOR DE AUTENTICAÇÃO SIMULADO
// Em uma aplicação real, isso interagiria com seu provedor de autenticação.

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  login: (userData: AuthUser) => void; // Login agora aceita dados do usuário
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const MOCK_AUTH_USER_KEY = 'mockAppAuthUser';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simula a verificação do status de autenticação do localStorage ao montar
    try {
      const storedUser = localStorage.getItem(MOCK_AUTH_USER_KEY);
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.warn("Não foi possível acessar o localStorage para os dados do usuário simulado.", error);
      setUser(null);
    }
    setIsLoading(false);
  }, []);

  const login = useCallback((userData: AuthUser) => {
    try {
      localStorage.setItem(MOCK_AUTH_USER_KEY, JSON.stringify(userData));
    } catch (error) {
       console.warn("Não foi possível definir os dados do usuário simulado no localStorage.", error);
    }
    setUser(userData);
  }, []);

  const logout = useCallback(() => {
    try {
      localStorage.removeItem(MOCK_AUTH_USER_KEY);
    } catch (error)
 {
      console.warn("Não foi possível limpar os dados do usuário simulado no localStorage.", error);
    }
    setUser(null);
  }, []);

  const isAuthenticated = !!user;
  const isAdmin = user?.isAdmin ?? false;

  return React.createElement(
    AuthContext.Provider,
    { value: { user, isAuthenticated, isAdmin, isLoading, login, logout } },
    children
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}
