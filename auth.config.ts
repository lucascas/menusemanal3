import type { AuthConfig } from "next-auth"

export const authConfig: AuthConfig = {
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized() {
      // Siempre permitir acceso
      return true
    },
  },
  providers: [],
}
