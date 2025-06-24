import { NextResponse } from "next/server"
import dbConnect from "@/lib/dbConnect"
import Admin from "@/models/Admin"
import { logger } from "@/lib/logger"

export async function GET() {
  try {
    // Verificar ADMIN_JWT_SECRET
    if (!process.env.ADMIN_JWT_SECRET) {
      return NextResponse.json(
        {
          success: false,
          message: 'Variable de entorno inválida/faltante: "ADMIN_JWT_SECRET"',
        },
        { status: 500 },
      )
    }

    await dbConnect()

    // Verificar si ya existe un superadmin
    const existingAdmin = await Admin.findOne({ role: "superadmin" })
    if (existingAdmin) {
      return NextResponse.json({
        success: false,
        message: "Ya existe un superadmin en la base de datos",
        admin: {
          username: existingAdmin.username,
          role: existingAdmin.role,
          createdAt: existingAdmin.createdAt,
        },
      })
    }

    // Crear el superadmin
    const username = "admin"
    const password = "admin123" // Cambiar esto en producción

    const admin = await Admin.create({
      username,
      password, // Se hasheará automáticamente gracias al middleware
      role: "superadmin",
    })

    return NextResponse.json({
      success: true,
      message: "Superadmin creado con éxito",
      admin: {
        username: admin.username,
        role: admin.role,
        createdAt: admin.createdAt,
      },
    })
  } catch (error: any) {
    logger.error("Error al crear el superadmin:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Error al crear el superadmin",
        error: error.message,
      },
      { status: 500 },
    )
  }
}

// Agregar soporte para OPTIONS para CORS
export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 })
}
