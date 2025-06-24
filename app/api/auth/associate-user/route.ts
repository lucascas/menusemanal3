import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../[...nextauth]/route"
import dbConnect from "@/lib/dbConnect"
import User from "@/models/User"
import Invitation from "@/models/Invitation"
import { logger } from "@/lib/logger"

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    await dbConnect()

    // Asegurarse de que los modelos estén registrados
    require("@/models/User")
    require("@/models/Casa")
    require("@/models/Invitation")

    const { email, invitationToken } = await request.json()

    if (!email || !invitationToken) {
      return NextResponse.json({ error: "Email y token de invitación son requeridos" }, { status: 400 })
    }

    // Verificar si el usuario existe
    const user = await User.findOne({ email: email.toLowerCase() })
    if (!user) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })
    }

    // Si el usuario ya tiene una casa, no hacer nada
    if (user.casa) {
      return NextResponse.json({ message: "El usuario ya pertenece a una casa" })
    }

    // Verificar la invitación
    const invitation = await Invitation.findOne({
      token: invitationToken,
      email: email.toLowerCase(),
      used: false,
    }).populate("casa")

    if (!invitation) {
      return NextResponse.json({ error: "Invitación no válida o expirada" }, { status: 400 })
    }

    // Asociar el usuario a la casa
    user.casa = invitation.casa._id
    await user.save()

    // Marcar la invitación como usada
    invitation.used = true
    await invitation.save()

    return NextResponse.json({
      success: true,
      message: "Usuario asociado a casa exitosamente",
      casa: {
        id: invitation.casa._id.toString(),
        nombre: invitation.casa.nombre,
      },
    })
  } catch (error: any) {
    logger.error("Error al asociar usuario a casa:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Error en el servidor al asociar usuario a casa",
        details: error.message,
      },
      { status: 500 },
    )
  }
}
