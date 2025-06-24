"use client"

// Hook personalizado que simula autenticación
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

// Mock de signOut
export function signOut() {
  console.log("Mock signOut - no action needed")
  return Promise.resolve()
}
