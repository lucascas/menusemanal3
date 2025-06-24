import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"
import { logger } from "@/lib/logger"

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - login, register (auth pages)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|login|register).*)",
  ],
}

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Permitir acceso a rutas públicas sin autenticación
  const publicRoutes = ["/login", "/register", "/api/auth"]
  if (publicRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.next()
  }

  // Manejar rutas de administrador
  if (pathname.startsWith("/administrador")) {
    // Permitir acceso a la página de login del administrador
    if (pathname === "/administrador/login") {
      return NextResponse.next()
    }

    // Para otras rutas de administrador, verificar token admin
    const adminToken = request.cookies.get("admin_token")?.value

    if (!adminToken) {
      logger.warn(`Acceso denegado a ruta admin sin token: ${pathname}`)
      return NextResponse.redirect(new URL("/administrador/login", request.url))
    }

    return NextResponse.next()
  }

  // Para rutas normales de usuario, verificar autenticación NextAuth
  try {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    })

    if (!token) {
      logger.warn(`Acceso denegado sin autenticación: ${pathname}`)
      return NextResponse.redirect(new URL("/login", request.url))
    }

    // Si el usuario está autenticado pero accede a la raíz, permitir acceso
    return NextResponse.next()
  } catch (error) {
    logger.error("Error en middleware:", error)
    return NextResponse.redirect(new URL("/login", request.url))
  }
}
