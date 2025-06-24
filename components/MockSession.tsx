"use client"

import { createContext, type ReactNode } from "react"

// -------- Sesión ficticia --------
export const mockSession = {
  user: {
    id: "mock-user-id",
    email: "usuario@ejemplo.com",
    name: "Usuario de Prueba",
    casa: {
      id: "mock-casa-id",
      nombre: "Casa de Prueba",
    },
  },
}

// -------- Contexto + Provider --------
const MockSessionContext = createContext<typeof mockSession>(mockSession)

export function MockSessionProvider({ children }: { children: ReactNode }) {
  return <MockSessionContext.Provider value={mockSession}>{children}</MockSessionContext.Provider>
}

// -------- Hook simplificado --------
export function useAuth() {
  return {
    user: mockSession.user,
    isAuthenticated: true,
    isLoading: false,
  }
}

export async function signOut() {
  /* noop – sin autenticación real */
  console.info("Mock signOut")
}
