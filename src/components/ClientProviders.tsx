"use client";

import { AuthProvider } from '@/hooks/useAuth';
// Se você tiver outros provedores de contexto (como para um tema), importe-os aqui também.

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      {/* Se tiver outros provedores, eles podem envolver os filhos aqui também */}
      {children}
    </AuthProvider>
  );
}
