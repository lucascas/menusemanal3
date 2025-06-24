import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/dbConnect"
import ApiKey from "@/models/ApiKey"
import { logger } from "@/lib/logger"

export async function verifyApiKey(req: NextRequest) {
  try {
    // Obtener la clave API del encabezado
    const apiKey = req.headers.get("x-api-key")

    if (!apiKey) {
      return {
        isValid: false,
        response: NextResponse.json({ error: "API key is required" }, { status: 401 }),
      }
    }

    await dbConnect()

    // Buscar la clave API en la base de datos
    const keyDoc = await ApiKey.findOne({ key: apiKey })

    if (!keyDoc) {
      return {
        isValid: false,
        response: NextResponse.json({ error: "Invalid API key" }, { status: 401 }),
      }
    }

    // Actualizar la fecha de último uso
    keyDoc.lastUsed = new Date()
    await keyDoc.save()

    return {
      isValid: true,
      user: keyDoc.user,
      casa: keyDoc.casa,
    }
  } catch (error) {
    logger.error("Error verifying API key:", error)
    return {
      isValid: false,
      response: NextResponse.json({ error: "Error verifying API key" }, { status: 500 }),
    }
  }
}
