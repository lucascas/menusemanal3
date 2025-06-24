import { NextResponse } from "next/server"

// Datos mock para menús
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
    },
    ingredientes: ["pollo", "pasta", "tomate", "lechuga", "pescado"],
    user: "mock-user",
    casa: "mock-casa",
  },
]

const menus = [...mockMenus]

export async function GET() {
  try {
    return NextResponse.json(menus)
  } catch (error) {
    console.error("Error fetching weekly menus:", error)
    return NextResponse.json(mockMenus)
  }
}

export async function POST(request: Request) {
  try {
    const menuData = await request.json()

    const newMenu = {
      _id: Date.now().toString(),
      ...menuData,
      user: "mock-user",
      casa: "mock-casa",
    }

    menus.push(newMenu)
    return NextResponse.json(newMenu)
  } catch (error) {
    console.error("Error creating weekly menu:", error)
    return NextResponse.json({ error: "Error al crear el menú" }, { status: 500 })
  }
}

export const dynamic = "force-dynamic"
