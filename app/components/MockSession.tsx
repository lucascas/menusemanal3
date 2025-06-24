"use client"

import { createContext, useContext, type ReactNode } from "react"

// Mock session data
const mockSession = {
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

const MockSessionContext = createContext(mockSession)

export function MockSessionProvider({ children }: { children: ReactNode }) {
  return <MockSessionContext.Provider value={mockSession}>{children}</MockSessionContext.Provider>
}

export function useMockSession() {
  return useContext(MockSessionContext)
}

// Mock de useSession para reemplazar el de NextAuth
export function useSession() {
  return {
    data: mockSession,
    status: "authenticated" as const,
  }
}
