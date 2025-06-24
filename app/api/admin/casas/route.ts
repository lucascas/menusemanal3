import { NextResponse } from "next/server"
import dbConnect from "@/lib/dbConnect"
import Casa from "@/models/Casa"
import User from "@/models/User"
import { logger } from "@/lib/logger"
import { cookies } from "next/headers"
import Admin from "@/models/Admin"
import bcrypt from "bcryptjs"

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

    // Obtener todas las casas con información del creador
    const casas = await Casa.find().populate("creador", "name email").sort({ createdAt: -1 })

    // Contar usuarios por casa
    const casasConUsuarios = await Promise.all(
      casas.map(async (casa) => {
        const usuariosCount = await User.countDocuments({ casa: casa._id })
        return {
          _id: casa._id,
          nombre: casa.nombre,
          creador: casa.creador,
          createdAt: casa.createdAt,
          usuariosCount,
        }
      }),
    )

    return NextResponse.json(casasConUsuarios)
  } catch (error: any) {
    logger.error("Error al obtener casas:", error)
    return NextResponse.json({ error: "Error al obtener las casas", details: error.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const admin = await verifyAdminAuth()
    if (!admin) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    await dbConnect()
    const { nombre, creadorEmail } = await request.json()

    if (!nombre) {
      return NextResponse.json({ error: "El nombre de la casa es obligatorio" }, { status: 400 })
    }

    // Si se proporciona un email de creador, verificar si existe
    let creador
    if (creadorEmail) {
      creador = await User.findOne({ email: creadorEmail })
      if (!creador) {
        // Crear un nuevo usuario si no existe
        const password = Math.random().toString(36).slice(-8) // Generar contraseña aleatoria
        const hashedPassword = await bcrypt.hash(password, 10)

        creador = await User.create({
          email: creadorEmail,
          password: hashedPassword,
          emailVerified: false,
        })

        logger.info(`Usuario creado automáticamente: ${creadorEmail} con contraseña: ${password}`)
      }
    } else {
      // Crear un usuario temporal si no se proporciona email
      const tempEmail = `temp_${Date.now()}@planneat.com`
      const password = Math.random().toString(36).slice(-8)
      const hashedPassword = await bcrypt.hash(password, 10)

      creador = await User.create({
        email: tempEmail,
        password: hashedPassword,
        name: "Administrador Temporal",
        emailVerified: false,
      })

      logger.info(`Usuario temporal creado: ${tempEmail} con contraseña: ${password}`)
    }

    // Crear la casa
    const casa = await Casa.create({
      nombre,
      creador: creador._id,
    })

    // Asignar la casa al creador
    creador.casa = casa._id
    await creador.save()

    return NextResponse.json({
      success: true,
      message: "Casa creada exitosamente",
    })
  } catch (error: any) {
    logger.error("Error al crear casa:", error)
    return NextResponse.json({ error: "Error al crear la casa", details: error.message }, { status: 500 })
  }
}

// Agregar soporte para OPTIONS para CORS
export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 })
}

