import { NextResponse } from "next/server"

export async function GET() {
  // Devolvemos un usuario mock
  return NextResponse.json({
    id: "mock-user",
    name: "Usuario Demo",
    email: "demo@example.com",
    casa: {
      id: "mock-casa",
      nombre: "Casa Demo",
    },
  })
}

export async function POST(request: Request) {
  try {
    const userData = await request.json()

    // Simulamos la creación del usuario
    return NextResponse.json({
      id: Date.now().toString(),
      ...userData,
      casa: {
        id: "mock-casa",
        nombre: "Casa Demo",
      },
    })
  } catch (error) {
    console.error("Error creating user:", error)
    return NextResponse.json({ error: "Error al crear usuario" }, { status: 500 })
  }
}

export const dynamic = "force-dynamic"
