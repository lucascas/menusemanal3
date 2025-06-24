import { NextResponse } from "next/server"
import dbConnect from "@/lib/dbConnect"
import WeeklyMenu from "@/models/WeeklyMenu"

export async function GET() {
  try {
    await dbConnect()
    const menus = await WeeklyMenu.find({}).sort({ fecha: -1 }).lean()
    return NextResponse.json(menus)
  } catch (error) {
    console.error("Error fetching weekly menus:", error)
    // Fallback a datos mock si falla la DB
    const mockMenus = [
      {
        _id: "1",
        fecha: new Date().toISOString(),
        menu: {
          Lunes: {
            almuerzo: "Pollo a la plancha",
            cena: "Pasta con tomate",
          },
          Martes: {
            almuerzo: "Ensalada mixta",
            cena: "Pescado al horno",
          },
          Miércoles: {
            almuerzo: "Arroz con pollo",
            cena: "Sopa de verduras",
          },
        },
        ingredientes: ["pollo", "pasta", "tomate", "lechuga", "pescado", "arroz", "verduras"],
        user: "mock-user",
        casa: "mock-casa",
      },
    ]
    return NextResponse.json(mockMenus)
  }
}

export async function POST(request: Request) {
  try {
    await dbConnect()
    const menuData = await request.json()

    const newMenu = new WeeklyMenu({
      ...menuData,
      user: "mock-user",
      casa: "mock-casa",
      fecha: new Date(),
    })

    const savedMenu = await newMenu.save()
    return NextResponse.json(savedMenu)
  } catch (error) {
    console.error("Error creating weekly menu:", error)
    return NextResponse.json({ error: "Error al crear el menú" }, { status: 500 })
  }
}

export const dynamic = "force-dynamic"
