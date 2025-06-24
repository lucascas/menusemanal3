import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import dbConnect from "@/lib/dbConnect"
import User from "@/models/User"
import Invitation from "@/models/Invitation"
import { logger } from "@/lib/logger"

export async function POST(request: Request) {
  try {
    await dbConnect()

    // Asegurarse de que todos los modelos estén registrados
    require("@/models/User")
    require("@/models/Casa")
    require("@/models/Invitation")

    const { email, password, invitationToken } = await request.json()

    // Validaciones básicas
    if (!email || !password) {
      return NextResponse.json({ success: false, message: "Email y contraseña son requeridos" }, { status: 400 })
    }

    // Verificar si el usuario ya existe
    const existingUser = await User.findOne({ email: email.toLowerCase() })

    // Si el usuario ya existe, verificamos si tiene una invitación pendiente
    if (existingUser) {
      // Si hay un token de invitación, verificamos si es válido
      if (invitationToken) {
        const invitation = await Invitation.findOne({
          token: invitationToken,
          email: email.toLowerCase(),
          used: false,
        }).populate("casa")

        if (invitation) {
          // Si la invitación es válida y el usuario no tiene casa, le asignamos la casa
          if (!existingUser.casa) {
            existingUser.casa = invitation.casa._id
            await existingUser.save()

            // Marcamos la invitación como usada
            invitation.used = true
            await invitation.save()

            return NextResponse.json({
              success: true,
              message: "Usuario existente asociado a casa exitosamente",
              user: {
                id: existingUser._id.toString(),
                email: existingUser.email,
                casa: {
                  id: invitation.casa._id.toString(),
                  nombre: invitation.casa.nombre,
                },
              },
              wasInvited: true,
            })
          } else {
            return NextResponse.json(
              {
                success: false,
                message: "El usuario ya pertenece a una casa",
              },
              { status: 400 },
            )
          }
        }
      }

      return NextResponse.json(
        {
          success: false,
          message: "El email ya está registrado. Por favor, inicia sesión.",
        },
        { status: 409 },
      )
    }

    // Verificar la invitación si existe
    let casa = null
    if (invitationToken) {
      const invitation = await Invitation.findOne({
        token: invitationToken,
        email: email.toLowerCase(),
        used: false,
      }).populate("casa")

      if (!invitation) {
        return NextResponse.json(
          {
            success: false,
            message: "Invitación no válida o expirada",
          },
          { status: 400 },
        )
      }

      casa = invitation.casa
      // Marcar la invitación como usada
      invitation.used = true
      await invitation.save()
    }

    // Encriptar la contraseña
    const hashedPassword = await bcrypt.hash(password, 10)

    // Crear el nuevo usuario con la casa asignada si viene de una invitación
    const newUser = await User.create({
      email: email.toLowerCase(),
      password: hashedPassword,
      casa: casa ? casa._id : null,
    })

    // Obtener el usuario con la información de la casa
    const userWithCasa = await User.findById(newUser._id).populate("casa")

    // Devolver respuesta sin la contraseña
    return NextResponse.json({
      success: true,
      message: "Usuario creado exitosamente",
      user: {
        id: userWithCasa._id.toString(),
        email: userWithCasa.email,
        casa: casa
          ? {
              id: casa._id.toString(),
              nombre: casa.nombre,
            }
          : null,
      },
      wasInvited: !!casa,
    })
  } catch (error: any) {
    logger.error("Error en el registro:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Error en el servidor al crear el usuario",
        details: error.message,
      },
      { status: 500 },
    )
  }
}
