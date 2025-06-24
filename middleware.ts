import { NextResponse } from "next/server"
import { withAuth } from "next-auth/middleware"
import { logger } from "@/lib/logger"

// Indicar explícitamente que este middleware no debe ejecutarse en el Edge Runtime
export const config = {
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico|login|register).*)"],
  runtime: "nodejs", // Esto es crucial para evitar el error de crypto
}

// Función simplificada para verificar si una ruta es de administrador
function isAdminRoute(pathname: string) {
  return (
    pathname.startsWith("/administrador") &&
    pathname !== "/administrador" &&
    pathname !== "/administrador/login" &&
    !pathname.includes("_next") &&
    !pathname.includes("favicon.ico")
  )
}

export default function middleware(req) {
  // Si es una ruta de administrador, verificar la cookie y redirigir si es necesario
  if (isAdminRoute(req.nextUrl.pathname)) {
    // Verificar si existe la cookie admin_token
    const adminToken = req.cookies.get("admin_token")?.value

    if (!adminToken) {
      logger.warn(`Intento de acceso a ruta protegida sin token: ${req.nextUrl.pathname}`)
      return NextResponse.redirect(new URL("/administrador/login", req.url))
    }

    // No intentamos verificar el token aquí, solo comprobamos su existencia
    // La verificación real se hará en el componente del lado del servidor
    return NextResponse.next()
  }

  // Para rutas no administrativas, aplicar el middleware de autenticación normal
  return withAuth(
    function middleware(req) {
      const path = req.nextUrl.pathname
      logger.debug(`Middleware ejecutándose para ruta: ${path}`)

      // Permitir el acceso a las rutas de autenticación
      if (path.startsWith("/api/auth")) {
        logger.debug("Permitiendo acceso a ruta de autenticación")
        return NextResponse.next()
      }

      // Verificar si hay token
      const token = req.nextauth.token
      if (!token) {
        logger.warn("Intento de acceso sin token")
        return NextResponse.redirect(new URL("/login", req.url))
      }

      logger.debug("Token válido encontrado, permitiendo acceso")
      return NextResponse.next()
    },
    {
      callbacks: {
        authorized: ({ token }) => {
          const isAuthorized = !!token
          logger.debug(`Autorización de token: ${isAuthorized}`)
          return isAuthorized
        },
      },
      pages: {
        signIn: "/login",
      },
    },
  )(req)
}

