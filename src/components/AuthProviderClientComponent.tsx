
"use client";

import { useAuth } from '@/hooks/useAuth';
import type { AuthContextType } from '@/hooks/useAuth'; // Assuming AuthContextType is exported
import type { ReactNode } from 'react';

interface AuthProviderClientComponentProps {
  children: (auth: AuthContextType) => ReactNode;
}

/**
 * A client component wrapper to easily access AuthContext values
 * within Server Components by passing them as children props.
 */
export function AuthProviderClientComponent({ children }: AuthProviderClientComponentProps) {
  const auth = useAuth();
  return <>{children(auth)}</>;
}
