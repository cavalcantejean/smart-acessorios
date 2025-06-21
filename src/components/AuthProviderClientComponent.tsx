
"use server";

import React, { type ReactNode } from 'react'; // Ensure React is imported for JSX
import { useAuth, type AuthContextType } from '@/hooks/useAuth';

interface AuthProviderClientComponentProps {
  children: (auth: AuthContextType) => ReactNode;
}

/**
 * A client component wrapper to easily access AuthContext values
 * by passing them as children props. This allows Server Components
 * to effectively use auth state by rendering this client component.
 */
export function AuthProviderClientComponent({ children }: AuthProviderClientComponentProps) {
  const auth = useAuth();
  // Call the render prop function to get the actual content
  const content = children(auth);
  // Wrap the content in a fragment, which is a common and safe practice
  return <>{content}</>;
}
