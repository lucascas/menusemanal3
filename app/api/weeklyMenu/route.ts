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

const menus = [...mockMenus]

export async function GET() {
  // Siempre devolver datos
  return NextResponse.json(menus)
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
    // Si falla, devolver un menú básico
    return NextResponse.json({
      _id: Date.now().toString(),
      fecha: new Date().toISOString(),
      menu: {
        Lunes: { almuerzo: "Comida", cena: "Cena" },
      },
      ingredientes: [],
      user: "mock-user",
      casa: "mock-casa",
    })
  }
}

export const dynamic = "force-dynamic"
