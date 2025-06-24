import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../../auth/[...nextauth]/route"
import dbConnect from "@/lib/dbConnect"
import User from "@/models/User"
import Casa from "@/models/Casa"

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.casa?.id) {
      return NextResponse.json({ error: "No autorizado o sin casa asignada" }, { status: 401 })
    }

    await dbConnect()
    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json({ error: "Se requiere el ID del usuario" }, { status: 400 })
    }

    // Verificar que el usuario actual es el propietario
    const casa = await Casa.findById(session.user.casa.id)
    if (!casa) {
      return NextResponse.json({ error: "Casa no encontrada" }, { status: 404 })
    }

    // Verificar que el usuario a promover existe y pertenece a la casa
    const nuevoCreador = await User.findOne({ _id: userId, casa: session.user.casa.id })
    if (!nuevoCreador) {
      return NextResponse.json({ error: "Usuario no encontrado o no pertenece a esta casa" }, { status: 404 })
    }

    // Actualizar el creador de la casa
    casa.creador = userId
    await casa.save()

    return NextResponse.json({ success: true, message: "Propietario actualizado correctamente" })
  } catch (error) {
    console.error("Error al actualizar el propietario:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
