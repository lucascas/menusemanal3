"use client"

import { useSession, signOut as nextAuthSignOut } from "next-auth/react"

// Hook de autenticación conectado a la sesión real de NextAuth.
export function useAuth() {
  const { data: session, status } = useSession()

  return {
    user: session?.user ?? null,
    isAuthenticated: status === "authenticated",
    isLoading: status === "loading",
  }
}

// Reexportamos signOut real de next-auth para mantener compatibilidad
// con los componentes que lo importaban desde este módulo.
export const signOut = nextAuthSignOut

// Reexport del useSession real por compatibilidad con imports previos.
export { useSession }
