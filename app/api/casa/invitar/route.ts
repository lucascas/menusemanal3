import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../../auth/[...nextauth]/route"
import dbConnect from "@/lib/dbConnect"
import User from "@/models/User"
import Invitation from "@/models/Invitation"
import { sendInvitationEmail } from "@/app/actions/email"
import crypto from "crypto"

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.casa?.id) {
      return NextResponse.json({ error: "Usuario no autorizado o sin casa asignada" }, { status: 401 })
    }

    const { email } = await request.json()

    await dbConnect()

    // Verificar si el usuario ya existe y ya tiene una casa
    const existingUser = await User.findOne({ email }).populate("casa")
    if (existingUser?.casa) {
      return NextResponse.json({ error: "El usuario ya pertenece a una casa" }, { status: 400 })
    }

    // Generar token único para la invitación
    const token = crypto.randomBytes(32).toString("hex")

    // Eliminar invitaciones anteriores para este email
    await Invitation.deleteMany({ email })

    // Crear nueva invitación
    const invitation = await Invitation.create({
      token,
      email,
      casa: session.user.casa.id,
      used: false,
    })

    // Si el usuario ya existe pero no tiene casa, asignarle la casa directamente
    if (existingUser) {
      existingUser.casa = session.user.casa.id
      await existingUser.save()

      // Marcar la invitación como usada
      invitation.used = true
      await invitation.save()
    }

    // Enviar invitación por correo
    const result = await sendInvitationEmail(
      email,
      session.user.email!,
      session.user.casa.nombre,
      token, // Asegurarnos de pasar el token
    )

    if (!result.success) {
      console.error("Error detallado al enviar la invitación:", result.error)
      // Si falla el envío del email, eliminamos la invitación creada
      await Invitation.findByIdAndDelete(invitation._id)
      return NextResponse.json(
        {
          error: "Error al enviar la invitación",
          details: result.error,
        },
        { status: 500 },
      )
    }

    return NextResponse.json({
      message: "Invitación enviada con éxito",
      userAddedDirectly: !!existingUser,
      token: token, // Incluir el token en la respuesta para debugging
    })
  } catch (error: any) {
    console.error("Error detallado al invitar usuario:", error)
    return NextResponse.json(
      {
        error: "Error al procesar la invitación",
        details: error.message || "Error desconocido",
      },
      { status: 500 },
    )
  }
}
