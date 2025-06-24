import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/dbConnect"
import WeeklyMenu from "@/models/WeeklyMenu"
import { verifyApiKey } from "@/lib/apiAuth"
import { logger } from "@/lib/logger"

export async function GET(request: NextRequest) {
  try {
    // Verificar la clave API
    const auth = await verifyApiKey(request)
    if (!auth.isValid) {
      return auth.response
    }

    // Obtener los parámetros de consulta
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")

    // Validar los parámetros
    if (!startDate || !endDate) {
      return NextResponse.json({ error: "startDate and endDate parameters are required" }, { status: 400 })
    }

    // Convertir a objetos Date
    const start = new Date(startDate)
    const end = new Date(endDate)

    // Validar que las fechas son válidas
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return NextResponse.json({ error: "Invalid date format. Use YYYY-MM-DD" }, { status: 400 })
    }

    await dbConnect()

    // Buscar menús en el rango de fechas
    const menus = await WeeklyMenu.find({
      casa: auth.casa,
      fecha: { $gte: start, $lte: end },
    }).sort({ fecha: 1 })

    // Formatear los datos para la respuesta
    const formattedMeals = []

    menus.forEach((weeklyMenu) => {
      weeklyMenu.menu.forEach((dayMenu, dayKey) => {
        if (dayMenu.fecha) {
          const mealDate = new Date(dayMenu.fecha)

          // Solo incluir si está dentro del rango
          if (mealDate >= start && mealDate <= end) {
            formattedMeals.push({
              date: mealDate.toISOString().split("T")[0],
              dayOfWeek: dayKey,
              meals: {
                lunch: dayMenu.almuerzo || null,
                dinner: dayMenu.cena || null,
              },
            })
          }
        }
      })
    })

    return NextResponse.json(formattedMeals)
  } catch (error) {
    logger.error("Error fetching meals:", error)
    return NextResponse.json({ error: "Error fetching meals" }, { status: 500 })
  }
}

