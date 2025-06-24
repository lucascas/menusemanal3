import { NextResponse } from "next/server"
import dbConnect from "@/lib/dbConnect"
import Casa from "@/models/Casa"
import User from "@/models/User"
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
    const casa = await Casa.findById(params.id).populate("creador", "name email")

    if (!casa) {
      return NextResponse.json({ error: "Casa no encontrada" }, { status: 404 })
    }

    return NextResponse.json(casa)
  } catch (error: any) {
    logger.error(`Error al obtener casa ${params.id}:`, error)
    return NextResponse.json({ error: "Error al obtener la casa", details: error.message }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const admin = await verifyAdminAuth()
    if (!admin) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    await dbConnect()
    const { nombre } = await request.json()

    if (!nombre) {
      return NextResponse.json({ error: "El nombre de la casa es obligatorio" }, { status: 400 })
    }

    const casa = await Casa.findByIdAndUpdate(params.id, { nombre }, { new: true }).populate("creador", "name email")

    if (!casa) {
      return NextResponse.json({ error: "Casa no encontrada" }, { status: 404 })
    }

    return NextResponse.json(casa)
  } catch (error: any) {
    logger.error(`Error al actualizar casa ${params.id}:`, error)
    return NextResponse.json({ error: "Error al actualizar la casa", details: error.message }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
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

    // Desvincular a todos los usuarios de la casa
    await User.updateMany({ casa: params.id }, { $unset: { casa: "" } })

    // Eliminar la casa
    await Casa.findByIdAndDelete(params.id)

    return NextResponse.json({ message: "Casa eliminada correctamente" })
  } catch (error: any) {
    logger.error(`Error al eliminar casa ${params.id}:`, error)
    return NextResponse.json({ error: "Error al eliminar la casa", details: error.message }, { status: 500 })
  }
}

// Agregar soporte para OPTIONS para CORS
export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 })
}

