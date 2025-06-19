// src/components/ClientProviders.tsx
"use client";

import React from 'react';
import { AuthProvider } from '@/hooks/useAuth';

interface ClientProvidersProps {
  children: React.ReactNode;
}

export default function ClientProviders({ children }: ClientProvidersProps) {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  );
}
