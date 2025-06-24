import { NextResponse } from "next/server"
import dbConnect from "@/lib/dbConnect"
import Meal from "@/models/Meal"
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

export async function GET() {
  try {
    const admin = await verifyAdminAuth()
    if (!admin) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    await dbConnect()

    // Contar todas las comidas
    const count = await Meal.countDocuments()

    return NextResponse.json({ count })
  } catch (error: any) {
    logger.error("Error al contar comidas:", error)
    return NextResponse.json({ error: "Error al contar comidas", details: error.message }, { status: 500 })
  }
}

// Agregar soporte para OPTIONS para CORS
export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 })
}
