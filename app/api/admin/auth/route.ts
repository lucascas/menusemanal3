import { NextResponse } from "next/server"
import dbConnect from "@/lib/dbConnect"
import Admin from "@/models/Admin"
import User from "@/models/User"
import { cookies } from "next/headers"
import { logger } from "@/lib/logger"
import jwt from "jsonwebtoken"

// Función para generar un token JWT para administradores
function generateAdminToken(admin: any) {
  if (!process.env.ADMIN_JWT_SECRET) {
    logger.error("ADMIN_JWT_SECRET no está configurado")
    throw new Error("Error de configuración del servidor")
  }

  return jwt.sign(
    {
      id: admin._id,
      username: admin.username,
      role: admin.role,
    },
    process.env.ADMIN_JWT_SECRET,
    { expiresIn: "8h" },
  )
}

// Función para verificar si un usuario normal puede ser administrador
async function checkUserAdminAccess(email: string, password: string) {
  // Solo permitir esto en desarrollo o con una variable de entorno específica
  if (process.env.NODE_ENV !== "development" && !process.env.ALLOW_USER_ADMIN_ACCESS) {
    return null
  }

  try {
    // Buscar el usuario por email
    const user = await User.findOne({ email }).select("+password")
    if (!user) {
      return null
    }

    // Verificar la contraseña
    const isPasswordValid = await user.comparePassword(password)
    if (!isPasswordValid) {
      return null
    }

    // Verificar si el usuario tiene un rol especial (puedes definir esto en tu modelo User)
    // Por ahora, simplemente permitimos a todos los usuarios en desarrollo
    logger.warn(`Usuario sin permisos de admin intentando acceder: ${email}`)

    return null // Cambiar a null para deshabilitar esta característica
  } catch (error) {
    logger.error("Error al verificar acceso de usuario como admin:", error)
    return null
  }
}

export async function POST(request: Request) {
  try {
    await dbConnect()
    const { username, password } = await request.json()

    // Validaciones básicas
    if (!username || !password) {
      return NextResponse.json({ success: false, message: "Usuario y contraseña son requeridos" }, { status: 400 })
    }

    // Buscar el administrador
    const admin = await Admin.findOne({ username }).select("+password")

    // Si no se encuentra el administrador, verificar si es un usuario normal que puede acceder
    if (!admin) {
      // Intentar autenticar como usuario normal (solo en desarrollo)
      const userAdmin = await checkUserAdminAccess(username, password)
      if (userAdmin) {
        // Si el usuario puede acceder como admin, generar token
        const token = generateAdminToken(userAdmin)

        // Establecer cookie
        cookies().set("admin_token", token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          maxAge: 8 * 60 * 60, // 8 horas
          path: "/",
          sameSite: "strict",
        })

        return NextResponse.json({
          success: true,
          admin: {
            id: userAdmin._id,
            username: userAdmin.email,
            role: "admin",
          },
        })
      }

      logger.warn(`Intento de inicio de sesión fallido para el administrador: ${username}`)
      return NextResponse.json(
        {
          success: false,
          message: "Credenciales inválidas o usuario sin permisos de administrador",
        },
        { status: 401 },
      )
    }

    // Verificar la contraseña
    const isPasswordValid = await admin.comparePassword(password)
    if (!isPasswordValid) {
      logger.warn(`Contraseña incorrecta para el administrador: ${username}`)
      return NextResponse.json({ success: false, message: "Credenciales inválidas" }, { status: 401 })
    }

    // Actualizar último inicio de sesión
    admin.lastLogin = new Date()
    await admin.save()

    // Generar token JWT
    const token = generateAdminToken(admin)

    // Establecer cookie con el token JWT
    cookies().set("admin_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 8 * 60 * 60, // 8 horas
      path: "/",
      sameSite: "strict",
    })

    logger.info(`Inicio de sesión exitoso para el administrador: ${username}`)

    return NextResponse.json({
      success: true,
      admin: {
        id: admin._id,
        username: admin.username,
        role: admin.role,
      },
      redirectUrl: "/administrador/dashboard",
    })
  } catch (error: any) {
    logger.error("Error en la autenticación de administrador:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Error en el servidor",
        details: error.message,
      },
      { status: 500 },
    )
  }
}

// Endpoint para verificar el estado de la sesión
export async function GET() {
  try {
    const cookieStore = cookies()
    const token = cookieStore.get("admin_token")?.value

    if (!token) {
      return NextResponse.json({ isAuthenticated: false })
    }

    // Verificar el token JWT
    if (!process.env.ADMIN_JWT_SECRET) {
      logger.error("ADMIN_JWT_SECRET no está configurado")
      return NextResponse.json({ isAuthenticated: false })
    }

    try {
      const decoded = jwt.verify(token, process.env.ADMIN_JWT_SECRET) as any

      // Verificar que el admin existe en la base de datos
      await dbConnect()
      const admin = await Admin.findById(decoded.id)

      if (!admin) {
        return NextResponse.json({ isAuthenticated: false })
      }

      return NextResponse.json({
        isAuthenticated: true,
        admin: {
          id: admin._id,
          username: admin.username,
          role: admin.role,
        },
      })
    } catch (jwtError) {
      logger.error("Error al verificar token JWT:", jwtError)
      return NextResponse.json({ isAuthenticated: false })
    }
  } catch (error: any) {
    logger.error("Error al verificar la autenticación de administrador:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Error en el servidor",
        details: error.message,
      },
      { status: 500 },
    )
  }
}

// Endpoint para cerrar sesión
export async function DELETE() {
  const cookieStore = cookies()
  cookieStore.delete("admin_token")

  return NextResponse.json({
    success: true,
    message: "Sesión cerrada correctamente",
  })
}

// Agregar soporte para OPTIONS para CORS
export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 })
}

