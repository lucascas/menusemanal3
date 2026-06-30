import { NextResponse } from "next/server"
import dbConnect from "@/lib/dbConnect"
import WeeklyMenu from "@/models/WeeklyMenu"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../auth/[...nextauth]/route"
import { logger } from "@/lib/logger"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }
    await dbConnect()
    const menus = await WeeklyMenu.find({ user: session.user.id }).sort({ fecha: -1 })
    return NextResponse.json(menus)
  } catch (error) {
    logger.error("Error en GET /api/weeklyMenu:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.casa?.id) {
      return NextResponse.json({ error: "No autorizado o sin casa asignada" }, { status: 401 })
    }

    await dbConnect()

    // Obtener y validar los datos
    let data
    try {
      data = await request.json()
    } catch (e) {
      console.error("Error al parsear JSON:", e)
      return NextResponse.json({ error: "Datos inválidos" }, { status: 400 })
    }

    // Validar que la fecha sea válida
    if (!data.fecha) {
      return NextResponse.json({ error: "La fecha es requerida" }, { status: 400 })
    }

    // Validar que el menú tenga al menos un día
    if (!data.menu || Object.keys(data.menu).length === 0) {
      return NextResponse.json({ error: "El menú debe tener al menos un día" }, { status: 400 })
    }

    // Verificar si ya existe un menú para esta fecha y usuario
    const existingMenu = await WeeklyMenu.findOne({
      user: session.user.id,
      fecha: {
        $gte: new Date(new Date(data.fecha).setHours(0, 0, 0, 0)),
        $lt: new Date(new Date(data.fecha).setHours(23, 59, 59, 999)),
      },
    })

    if (existingMenu) {
      // Actualizar el menú existente
      existingMenu.menu = data.menu
      existingMenu.ingredientes = data.ingredientes || []

      const updatedMenu = await existingMenu.save()

      return NextResponse.json({
        ...updatedMenu.toObject(),
        message: "Menú actualizado correctamente",
      })
    }

    // Crear un nuevo menú
    const weeklyMenu = new WeeklyMenu({
      fecha: new Date(data.fecha),
      menu: data.menu,
      user: session.user.id,
      casa: session.user.casa.id,
      ingredientes: data.ingredientes || [],
    })

    const savedMenu = await weeklyMenu.save()

    return NextResponse.json({
      ...savedMenu.toObject(),
      message: "Menú creado correctamente",
    })
  } catch (error: any) {
    console.error("Error general en POST /api/weeklyMenu:", error)
    return NextResponse.json(
      {
        error: "Error al guardar el menú",
        details: error.message,
      },
      { status: 500 },
    )
  }
}

export const dynamic = "force-dynamic"
