"use client";

/**
 * AuthContext has been deprecated and replaced with NextAuth
 * This file is kept for reference only
 * 
 * All authentication is now handled by NextAuth:
 * app/api/auth/[...nextauth]/route.ts
 * 
 * Use NextAuth directly in your components:
 * import { useSession, signIn, signOut } from "next-auth/react"
 */

// This file is deprecated - use NextAuth instead
// For backward compatibility, throw an error if someone tries to use the old context

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

export const useAuth = () => {
  throw new Error(
    "❌ useAuth is no longer available.\n\n" +
    "Use NextAuth instead:\n" +
    "import { useSession, signIn, signOut } from 'next-auth/react'\n\n" +
    "Example:\n" +
    "const { data: session, status } = useSession()\n" +
    "await signIn('credentials', { email, password, redirect: false })\n" +
    "await signOut()"
  );
};
