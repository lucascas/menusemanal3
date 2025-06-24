import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import jwt from "jsonwebtoken"
import { logger } from "@/lib/logger"

export default function AdminPage() {
  // Verificar si el usuario ya está autenticado
  const cookieStore = cookies()
  const token = cookieStore.get("admin_token")?.value

  if (token && process.env.ADMIN_JWT_SECRET) {
    try {
      // Verificar el token
      jwt.verify(token, process.env.ADMIN_JWT_SECRET)

      // Si el token es válido, redirigir al dashboard
      redirect("/administrador/dashboard")
    } catch (error) {
      logger.error("Error al verificar token en página principal:", error)
      // Si el token no es válido, redirigir al login
      redirect("/administrador/login")
    }
  } else {
    // Si no hay token, redirigir al login
    redirect("/administrador/login")
  }
}

