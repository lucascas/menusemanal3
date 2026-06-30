import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../auth/[...nextauth]/route"
import dbConnect from "@/lib/dbConnect"
import User from "@/models/User"
import Casa from "@/models/Casa"
import Invitation from "@/models/Invitation"
import { sendInvitationEmail } from "@/app/actions/email"
import crypto from "crypto"

export const dynamic = "force-dynamic"

// Existing POST handler
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      console.log("No session or email found:", session)
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    await dbConnect()

    // First, ensure the user exists in the database
    let user = await User.findOne({
      $or: [{ email: session.user.email }, { googleId: session.user.id }],
    })

    if (!user) {
      // If user doesn't exist, create them
      user = await User.create({
        email: session.user.email,
        name: session.user.name,
        googleId: session.user.id,
      })
    }

    let body
    try {
      body = await request.json()
    } catch (e) {
      console.error("Error parsing request body:", e)
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
    }

    const { nombre, invitados } = body

    if (!nombre || typeof nombre !== "string") {
      console.log("Nombre inválido:", nombre)
      return NextResponse.json({ error: "El nombre de la casa es requerido y debe ser texto" }, { status: 400 })
    }

    // Verificar si el usuario ya tiene una casa
    if (user.casa) {
      const casa = await Casa.findById(user.casa)
      console.log("Usuario ya tiene casa:", casa)
      return NextResponse.json({ error: "El usuario ya pertenece a una casa" }, { status: 400 })
    }

    // Crear la nueva casa
    const nuevaCasa = await Casa.create({
      nombre: nombre.trim(),
      creador: user._id, // Establecer al usuario actual como creador
    })

    // Actualizar el usuario con la nueva casa
    user.casa = nuevaCasa._id
    await user.save()

    // Enviar invitaciones si hay invitados
    const invitacionesEnviadas = []
    const invitacionesFallidas = []

    if (Array.isArray(invitados)) {
      for (const email of invitados) {
        if (email && typeof email === "string" && email.trim()) {
          const emailTrimmed = email.trim()
          try {
            // Generar token y registrar la invitación para que pueda canjearse
            const token = crypto.randomBytes(32).toString("hex")
            await Invitation.deleteMany({ email: emailTrimmed })
            const invitation = await Invitation.create({
              token,
              email: emailTrimmed,
              casa: nuevaCasa._id,
              used: false,
            })

            const result = await sendInvitationEmail(emailTrimmed, session.user.email, nuevaCasa.nombre, token)
            if (result.success) {
              invitacionesEnviadas.push(emailTrimmed)
            } else {
              // Si falla el envío, eliminar la invitación creada
              await Invitation.findByIdAndDelete(invitation._id)
              invitacionesFallidas.push(emailTrimmed)
            }
          } catch (error) {
            console.error(`Error al enviar invitación a ${email}:`, error)
            invitacionesFallidas.push(emailTrimmed)
          }
        }
      }
    }

    // Obtener el usuario actualizado con la casa
    const updatedUser = await User.findById(user._id).populate("casa")

    return NextResponse.json({
      success: true,
      message: "Casa creada exitosamente",
      casa: {
        id: nuevaCasa._id.toString(),
        nombre: nuevaCasa.nombre,
      },
      user: {
        id: updatedUser._id.toString(),
        email: updatedUser.email,
        casa: {
          id: nuevaCasa._id.toString(),
          nombre: nuevaCasa.nombre,
        },
      },
      invitacionesEnviadas,
      invitacionesFallidas,
    })
  } catch (error: any) {
    console.error("Error detallado al crear la casa:", error)
    return NextResponse.json(
      {
        error: "Error del servidor al crear la casa",
        details: error.message,
      },
      { status: 500 },
    )
  }
}

// New PUT handler for updating house name
export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.casa?.id) {
      return NextResponse.json({ error: "No autorizado o sin casa asignada" }, { status: 401 })
    }

    await dbConnect()

    const body = await request.json()
    const { nombre } = body

    if (!nombre || typeof nombre !== "string") {
      return NextResponse.json({ error: "El nombre de la casa es requerido y debe ser texto" }, { status: 400 })
    }

    const casa = await Casa.findById(session.user.casa.id)
    if (!casa) {
      return NextResponse.json({ error: "Casa no encontrada" }, { status: 404 })
    }

    casa.nombre = nombre.trim()
    await casa.save()

    return NextResponse.json({
      success: true,
      casa: {
        id: casa._id.toString(),
        nombre: casa.nombre,
      },
    })
  } catch (error: any) {
    console.error("Error al actualizar el nombre de la casa:", error)
    return NextResponse.json(
      {
        error: "Error del servidor al actualizar la casa",
        details: error.message,
      },
      { status: 500 },
    )
  }
}

// GET: devuelve la casa del usuario autenticado
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.casa?.id) {
      return NextResponse.json({ error: "No autorizado o sin casa asignada" }, { status: 401 })
    }

    await dbConnect()

    const casa = await Casa.findById(session.user.casa.id)
    if (!casa) {
      return NextResponse.json({ error: "Casa no encontrada" }, { status: 404 })
    }

    return NextResponse.json({
      id: casa._id.toString(),
      nombre: casa.nombre,
      creador: casa.creador?.toString() ?? null,
    })
  } catch (error) {
    console.error("Error fetching casa:", error)
    return NextResponse.json({ error: "Error al obtener la casa" }, { status: 500 })
  }
}

export async function OPTIONS(request: Request) {
  return NextResponse.json({}, { status: 200 })
}
