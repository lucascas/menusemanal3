import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { logger } from "@/lib/logger"

export async function adminMiddleware(request: NextRequest) {
  // Verificar si la ruta comienza con /administrador
  if (!request.nextUrl.pathname.startsWith("/administrador")) {
    return NextResponse.next()
  }

  // Permitir acceso a la página de login y a la raíz de administrador
  if (
    request.nextUrl.pathname === "/administrador" ||
    request.nextUrl.pathname === "/administrador/login" ||
    request.nextUrl.pathname.startsWith("/api/admin") ||
    request.nextUrl.pathname.includes("_next") ||
    request.nextUrl.pathname.includes("favicon.ico")
  ) {
    return NextResponse.next()
  }

  // Verificar token en las cookies
  const token = request.cookies.get("admin_token")?.value

  if (!token) {
    logger.warn(`Intento de acceso a ruta protegida sin token: ${request.nextUrl.pathname}`)
    return NextResponse.redirect(new URL("/administrador/login", request.url))
  }

  try {
    // Verificar el token
    if (!process.env.ADMIN_JWT_SECRET) {
      logger.error("ADMIN_JWT_SECRET no está configurado")
      return NextResponse.redirect(new URL("/administrador/login", request.url))
    }

    jwt.verify(token, process.env.ADMIN_JWT_SECRET)
    logger.info(`Acceso autorizado a ruta protegida: ${request.nextUrl.pathname}`)
    return NextResponse.next()
  } catch (error) {
    logger.error(`Error al verificar token para ruta ${request.nextUrl.pathname}:`, error)
    return NextResponse.redirect(new URL("/administrador/login", request.url))
  }
}

