import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import jwt from "jsonwebtoken"
import { logger } from "@/lib/logger"
import AdminDashboard from "./AdminDashboard"

export default function AdminDashboardPage() {
  // Verificar la autenticación del lado del servidor
  const cookieStore = cookies()
  const token = cookieStore.get("admin_token")?.value

  if (!token) {
    logger.warn("Intento de acceso al dashboard sin token")
    redirect("/administrador/login")
  }

  try {
    // Verificar el token
    if (!process.env.ADMIN_JWT_SECRET) {
      logger.error("ADMIN_JWT_SECRET no está configurado")
      redirect("/administrador/login")
    }

    jwt.verify(token, process.env.ADMIN_JWT_SECRET)

    // Si el token es válido, mostrar el dashboard
    return <AdminDashboard />
  } catch (error) {
    logger.error("Error al verificar token para el dashboard:", error)
    redirect("/administrador/login")
  }
}
