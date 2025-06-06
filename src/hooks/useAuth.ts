
"use client";
import React, { useState, useEffect, useCallback, createContext, useContext, type ReactNode } from 'react';

// ESTE É UM HOOK E PROVEDOR DE AUTENTICAÇÃO SIMULADO
// Em uma aplicação real, isso interagiria com seu provedor de autenticação.

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  login: () => void; // Login simulado
  logout: () => void; // Logout simulado
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // Começa carregando

  useEffect(() => {
    // Simula a verificação do status de autenticação do localStorage ao montar
    // Em um app real, seria uma chamada assíncrona para verificar sessão/token
    try {
      const storedAuth = localStorage.getItem('mockAppIsAuthenticated');
      if (storedAuth === 'true') {
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.warn("Não foi possível acessar o localStorage para o status de autenticação simulado.", error);
      setIsAuthenticated(false); // Garantir que o estado seja definido em caso de erro
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(() => {
    try {
      localStorage.setItem('mockAppIsAuthenticated', 'true');
    } catch (error) {
       console.warn("Não foi possível definir o status de autenticação simulado no localStorage.", error);
    }
    setIsAuthenticated(true);
  }, []);

  const logout = useCallback(() => {
    try {
      localStorage.removeItem('mockAppIsAuthenticated');
    } catch (error) {
      console.warn("Não foi possível limpar o status de autenticação simulado no localStorage.", error);
    }
    setIsAuthenticated(false);
  }, []);

  // Usando React.createElement em vez de JSX para evitar erros de parsing em arquivo .ts
  return React.createElement(
    AuthContext.Provider,
    { value: { isAuthenticated, isLoading, login, logout } },
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
