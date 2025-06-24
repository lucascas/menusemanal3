import { NextResponse } from "next/server"
import dbConnect from "@/lib/dbConnect"
import User from "@/models/User"
import Casa from "@/models/Casa"
import { logger } from "@/lib/logger"
import { cookies } from "next/headers"
import Admin from "@/models/Admin"

// Función simplificada para verificar la autenticación
async function verifyAdminAuth() {
  try {
    const cookieStore = cookies()
    const token = cookieStore.get("admin_token")?.value

    if (!token) {
      return null
    }

    // Extraer el ID del admin del token
    const adminId = token.split("_")[0]

    // Verificar que el admin existe
    await dbConnect()
    const admin = await Admin.findById(adminId)

    if (!admin) {
      return null
    }

    return admin
  } catch (error) {
    logger.error("Error al verificar autenticación:", error)
    return null
  }
}

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const admin = await verifyAdminAuth()
    if (!admin) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    await dbConnect()

    // Verificar si la casa existe
    const casa = await Casa.findById(params.id)
    if (!casa) {
      return NextResponse.json({ error: "Casa no encontrada" }, { status: 404 })
    }

    // Obtener todos los usuarios de la casa
    const usuarios = await User.find({ casa: params.id })

    // Identificar al creador de la casa
    const usuariosConRol = usuarios.map((usuario) => ({
      _id: usuario._id,
      name: usuario.name,
      email: usuario.email,
      isCreator: usuario._id.toString() === casa.creador?.toString(),
      lastLogin: usuario.lastLogin,
      createdAt: usuario.createdAt,
    }))

    return NextResponse.json(usuariosConRol)
  } catch (error: any) {
    logger.error(`Error al obtener usuarios de la casa ${params.id}:`, error)
    return NextResponse.json({ error: "Error al obtener los usuarios", details: error.message }, { status: 500 })
  }
}

// Agregar soporte para OPTIONS para CORS
export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 })
}
