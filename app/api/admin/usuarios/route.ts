import { NextResponse } from "next/server"
import dbConnect from "@/lib/dbConnect"
import User from "@/models/User"
import mongoose from "mongoose"
import { logger } from "@/lib/logger"
import { cookies } from "next/headers"
import Admin from "@/models/Admin"
import bcrypt from "bcryptjs"
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

export async function GET() {
  try {
    const admin = await verifyAdminAuth()
    if (!admin) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    await dbConnect()

    // Asegurar que los modelos estén registrados
    ensureModelsRegistered()

    // Verificar explícitamente que el modelo Casa esté registrado
    if (!mongoose.models.Casa) {
      // Si no está registrado, registrarlo explícitamente
      logger.warn("Modelo Casa no registrado, registrando manualmente")
      require("@/models/Casa")
    }

    // Obtener todos los usuarios con información de su casa
    const usuarios = await User.find().populate("casa", "nombre").sort({ createdAt: -1 })

    return NextResponse.json(usuarios)
  } catch (error: any) {
    logger.error("Error al obtener usuarios:", error)
    return NextResponse.json({ error: "Error al obtener los usuarios", details: error.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const admin = await verifyAdminAuth()
    if (!admin) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    await dbConnect()

    // Asegurar que los modelos estén registrados
    ensureModelsRegistered()

    const { name, email, password, casaId } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: "El email y la contraseña son obligatorios" }, { status: 400 })
    }

    // Verificar si el usuario ya existe
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return NextResponse.json({ error: "Ya existe un usuario con ese email" }, { status: 400 })
    }

    // Hashear la contraseña
    const hashedPassword = await bcrypt.hash(password, 10)

    // Crear el usuario
    const userData: any = {
      email,
      password: hashedPassword,
      emailVerified: true,
    }

    if (name) {
      userData.name = name
    }

    if (casaId) {
      userData.casa = casaId
    }

    const usuario = await User.create(userData)

    // Obtener el usuario con la información de la casa
    const usuarioConCasa = await User.findById(usuario._id).populate("casa", "nombre")

    return NextResponse.json({
      success: true,
      message: "Usuario creado exitosamente",
      usuario: {
        _id: usuarioConCasa._id,
        name: usuarioConCasa.name,
        email: usuarioConCasa.email,
        casa: usuarioConCasa.casa,
        createdAt: usuarioConCasa.createdAt,
      },
    })
  } catch (error: any) {
    logger.error("Error al crear usuario:", error)
    return NextResponse.json({ error: "Error al crear el usuario", details: error.message }, { status: 500 })
  }
}

// Agregar soporte para OPTIONS para CORS
export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 })
}

