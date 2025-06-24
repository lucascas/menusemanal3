import "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      email: string
      name?: string
      casa?: {
        id: string
        nombre: string
      } | null
    }
  }

  interface User {
    id: string
    email: string
    name?: string
    casa?: {
      id: string
      nombre: string
    } | null
  }
}
