import { cookies } from "next/headers"
import jwt from "jsonwebtoken"
import dbConnect from "@/lib/dbConnect"
import Admin from "@/models/Admin"
import { logger } from "@/lib/logger"

/**
 * Verifica la autenticación de administrador a partir de la cookie `admin_token`.
 *
 * A diferencia de la implementación anterior (que solo hacía `token.split("_")[0]`
 * y comprobaba la existencia del id, sin validar la firma), esta versión:
 *  1. Verifica la FIRMA del JWT con `ADMIN_JWT_SECRET` (el token se emite con
 *     `jwt.sign` en `app/api/admin/auth/route.ts`).
 *  2. Confirma que el admin decodificado sigue existiendo en la base.
 *
 * Devuelve el documento `Admin` si el token es válido, o `null` en caso contrario.
 */
export async function verifyAdminToken() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("admin_token")?.value

    if (!token) {
      return null
    }

    if (!process.env.ADMIN_JWT_SECRET) {
      logger.error("ADMIN_JWT_SECRET no está configurado")
      return null
    }

    // Verificar la firma y expiración del JWT
    const decoded = jwt.verify(token, process.env.ADMIN_JWT_SECRET) as { id?: string }
    if (!decoded?.id) {
      return null
    }

    // Confirmar que el admin sigue existiendo
    await dbConnect()
    const admin = await Admin.findById(decoded.id)

    return admin || null
  } catch (error) {
    // Token inválido, expirado o firma incorrecta
    logger.warn("Token de admin inválido o expirado")
    return null
  }
}
