import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../auth/[...nextauth]/route"
import dbConnect from "@/lib/dbConnect"
import User from "@/models/User"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    await dbConnect()

    const user = await User.findOne({ email: session.user.email }).populate("casa")
    if (!user) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })
    }

    return NextResponse.json({
      id: user._id,
      email: user.email,
      name: user.name,
      casa: user.casa
        ? {
            id: user.casa._id,
            nombre: user.casa.nombre,
          }
        : null,
    })
  } catch (error) {
    console.error("Error al obtener la información del usuario:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export const dynamic = "force-dynamic"

