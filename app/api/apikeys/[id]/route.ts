import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../../auth/[...nextauth]/route"
import dbConnect from "@/lib/dbConnect"
import ApiKey from "@/models/ApiKey"
import { logger } from "@/lib/logger"

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    await dbConnect()

    // Verificar que la clave pertenece al usuario
    const apiKey = await ApiKey.findOne({
      _id: params.id,
      user: session.user.id,
    })

    if (!apiKey) {
      return NextResponse.json({ error: "Clave API no encontrada" }, { status: 404 })
    }

    // Eliminar la clave
    await ApiKey.findByIdAndDelete(params.id)

    return NextResponse.json({ message: "Clave API eliminada correctamente" })
  } catch (error) {
    logger.error("Error deleting API key:", error)
    return NextResponse.json({ error: "Error al eliminar la clave API" }, { status: 500 })
  }
}

