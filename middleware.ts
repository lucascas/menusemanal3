import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export const config = {
  matcher: [
    // Solo aplicar middleware a rutas de administrador
    "/administrador/((?!login).*)",
  ],
}

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Solo manejar rutas de administrador (mantener esta funcionalidad)
  if (pathname.startsWith("/administrador") && pathname !== "/administrador/login") {
    const adminToken = request.cookies.get("admin_token")?.value

    if (!adminToken) {
      return NextResponse.redirect(new URL("/administrador/login", request.url))
    }
  }

  // Para todas las demás rutas, permitir acceso libre
  return NextResponse.next()
}
