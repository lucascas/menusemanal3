import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../auth/[...nextauth]/route"
import dbConnect from "@/lib/dbConnect"
import ApiKey from "@/models/ApiKey"
import { logger } from "@/lib/logger"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.casa?.id) {
      return NextResponse.json({ error: "No autorizado o sin casa asignada" }, { status: 401 })
    }

    await dbConnect()

    // Obtener todas las claves API del usuario
    const apiKeys = await ApiKey.find({ user: session.user.id })

    // Formatear la respuesta para no exponer la clave completa
    const formattedKeys = apiKeys.map((key) => ({
      id: key._id,
      name: key.name,
      createdAt: key.createdAt,
      lastUsed: key.lastUsed,
      key: `${key.key.substring(0, 8)}...${key.key.substring(key.key.length - 4)}`,
    }))

    return NextResponse.json(formattedKeys)
  } catch (error) {
    logger.error("Error fetching API keys:", error)
    return NextResponse.json({ error: "Error al obtener las claves API" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.casa?.id) {
      return NextResponse.json({ error: "No autorizado o sin casa asignada" }, { status: 401 })
    }

    await dbConnect()

    const { name } = await request.json()

    if (!name) {
      return NextResponse.json({ error: "El nombre de la clave es requerido" }, { status: 400 })
    }

    // Generar una nueva clave API
    const key = ApiKey.generateKey()

    // Crear la clave en la base de datos
    const apiKey = await ApiKey.create({
      key,
      name,
      user: session.user.id,
      casa: session.user.casa.id,
    })

    return NextResponse.json({
      id: apiKey._id,
      name: apiKey.name,
      key: apiKey.key,
      createdAt: apiKey.createdAt,
    })
  } catch (error) {
    logger.error("Error creating API key:", error)
    return NextResponse.json({ error: "Error al crear la clave API" }, { status: 500 })
  }
}

