import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../../auth/[...nextauth]/route"
import dbConnect from "@/lib/dbConnect"
import User from "@/models/User"
import Casa from "@/models/Casa"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.casa?.id) {
      return NextResponse.json({ error: "Usuario no autorizado o sin casa asignada" }, { status: 401 })
    }

    await dbConnect()

    // Obtener la casa para saber quién es el creador
    const casa = await Casa.findById(session.user.casa.id)
    if (!casa) {
      return NextResponse.json({ error: "Casa no encontrada" }, { status: 404 })
    }

    // Buscar todos los usuarios que pertenecen a la casa
    const usuarios = await User.find(
      { casa: session.user.casa.id },
      "name email", // Solo seleccionar nombre y email
    )

    // Transformar los documentos de MongoDB a objetos planos
    const usuariosFormateados = usuarios.map((usuario) => ({
      id: usuario._id.toString(),
      name: usuario.name || usuario.email.split("@")[0], // Usar email como nombre si no hay nombre
      email: usuario.email,
      isCurrentUser: usuario._id.toString() === session.user.id,
      isCreator: usuario._id.toString() === casa.creador?.toString(),
    }))

    return NextResponse.json(usuariosFormateados)
  } catch (error) {
    console.error("Error al obtener usuarios de la casa:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export const dynamic = "force-dynamic"

