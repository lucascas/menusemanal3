import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"
import { logger } from "@/lib/logger"

export const config = {
  matcher: [
    /*
     * Protege todas las rutas excepto:
     * - api (las APIs validan su propia sesión / API key)
     * - _next/static, _next/image (assets de Next)
     * - favicon.ico
     * - login, register (páginas públicas de autenticación)
     * - archivos estáticos de public/ (imágenes, etc.) para que se sirvan sin sesión
     */
    "/((?!api|_next/static|_next/image|favicon.ico|login|register|.*\\.(?:png|jpg|jpeg|gif|svg|ico|webp)$).*)",
  ],
}

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Rutas públicas que nunca requieren autenticación de usuario
  const publicRoutes = ["/login", "/register", "/api/auth"]
  if (publicRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.next()
  }

  // Rutas del panel de administrador (esquema de auth propio con cookie admin_token)
  if (pathname.startsWith("/administrador")) {
    if (pathname === "/administrador/login") {
      return NextResponse.next()
    }

    const adminToken = request.cookies.get("admin_token")?.value
    if (!adminToken) {
      logger.warn(`Acceso denegado a ruta admin sin token: ${pathname}`)
      return NextResponse.redirect(new URL("/administrador/login", request.url))
    }

    return NextResponse.next()
  }

  // Rutas normales de usuario: requieren sesión NextAuth (JWT)
  try {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    })

    if (!token) {
      logger.warn(`Acceso denegado sin autenticación: ${pathname}`)
      return NextResponse.redirect(new URL("/login", request.url))
    }

    return NextResponse.next()
  } catch (error) {
    logger.error("Error en middleware:", error)
    return NextResponse.redirect(new URL("/login", request.url))
  }
}
