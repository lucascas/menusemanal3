import type { AuthConfig } from "next-auth"

export const authConfig: AuthConfig = {
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const isOnLoginPage = nextUrl.pathname === "/login"
      const isOnRegisterPage = nextUrl.pathname === "/register"
      const isOnAuthPage = nextUrl.pathname.startsWith("/api/auth")

      // Permitir acceso a páginas de auth sin restricciones
      if (isOnLoginPage || isOnRegisterPage || isOnAuthPage) {
        return true
      }

      // Para otras páginas, requerir autenticación
      return isLoggedIn
    },
  },
  providers: [], // Add providers with an empty array
}
