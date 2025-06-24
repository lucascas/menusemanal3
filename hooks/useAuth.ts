"use client"

// Hook completamente mock que simula un usuario autenticado
export function useAuth() {
  return {
    user: {
      id: "mock-user-id",
      email: "usuario@ejemplo.com",
      name: "Usuario de Prueba",
      casa: {
        id: "mock-casa-id",
        nombre: "Casa de Prueba",
      },
    },
    isAuthenticated: true,
    isLoading: false,
  }
}

// Mock de signOut que no hace nada
export function signOut() {
  console.log("Mock signOut - no action needed")
  return Promise.resolve()
}

// Mock de useSession para compatibilidad
export function useSession() {
  return {
    data: {
      user: {
        id: "mock-user-id",
        email: "usuario@ejemplo.com",
        name: "Usuario de Prueba",
        casa: {
          id: "mock-casa-id",
          nombre: "Casa de Prueba",
        },
      },
    },
    status: "authenticated" as const,
  }
}
