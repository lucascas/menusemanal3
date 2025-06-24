import { NextResponse } from "next/server"
import dbConnect from "@/lib/dbConnect"
import User from "@/models/User"
import { logger } from "@/lib/logger"
import { cookies } from "next/headers"
import Admin from "@/models/Admin"
import { ensureModelsRegistered } from "@/lib/models"

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

    // Asegurar que los modelos estén registrados
    ensureModelsRegistered()

    const usuario = await User.findById(params.id).populate("casa", "nombre")

    if (!usuario) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })
    }

    return NextResponse.json(usuario)
  } catch (error: any) {
    logger.error(`Error al obtener usuario ${params.id}:`, error)
    return NextResponse.json({ error: "Error al obtener el usuario", details: error.message }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const admin = await verifyAdminAuth()
    if (!admin) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    await dbConnect()

    // Asegurar que los modelos estén registrados
    ensureModelsRegistered()

    const { name, casaId } = await request.json()

    const updateData: any = {}
    if (name !== undefined) {
      updateData.name = name
    }

    if (casaId !== undefined) {
      if (casaId) {
        updateData.casa = casaId
      } else {
        // Si casaId es null o vacío, eliminar la referencia a la casa
        updateData.$unset = { casa: "" }
      }
    }

    const usuario = await User.findByIdAndUpdate(params.id, updateData, { new: true }).populate("casa", "nombre")

    if (!usuario) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })
    }

    return NextResponse.json(usuario)
  } catch (error: any) {
    logger.error(`Error al actualizar usuario ${params.id}:`, error)
    return NextResponse.json({ error: "Error al actualizar el usuario", details: error.message }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const admin = await verifyAdminAuth()
    if (!admin) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    await dbConnect()

    // Asegurar que los modelos estén registrados
    ensureModelsRegistered()

    // Verificar si el usuario existe
    const usuario = await User.findById(params.id)
    if (!usuario) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })
    }

    // Eliminar el usuario
    await User.findByIdAndDelete(params.id)

    return NextResponse.json({ message: "Usuario eliminado correctamente" })
  } catch (error: any) {
    logger.error(`Error al eliminar usuario ${params.id}:`, error)
    return NextResponse.json({ error: "Error al eliminar el usuario", details: error.message }, { status: 500 })
  }
}

// Agregar soporte para OPTIONS para CORS
export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 })
}
