// Función auxiliar para obtener el token de autenticación
export function getAuthToken(): string | null {
  if (typeof window !== "undefined") {
    return sessionStorage.getItem("auth_token")
  }
  return null
}

// Función auxiliar para establecer el token de autenticación
export function setAuthToken(token: string): void {
  if (typeof window !== "undefined") {
    sessionStorage.setItem("auth_token", token)
  }
}

// Función auxiliar para eliminar el token de autenticación
export function removeAuthToken(): void {
  if (typeof window !== "undefined") {
    sessionStorage.removeItem("auth_token")
  }
}

// Función auxiliar para verificar si el usuario está autenticado
export function isAuthenticated(): boolean {
  return !!getAuthToken()
}
