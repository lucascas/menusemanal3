import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../../auth/[...nextauth]/route"
import dbConnect from "@/lib/dbConnect"
import WeeklyMenu from "@/models/WeeklyMenu"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.casa?.id) {
      return NextResponse.json({ error: "No autorizado o sin casa asignada" }, { status: 401 })
    }

    await dbConnect()
    const menu = await WeeklyMenu.findOne({ _id: params.id, casa: session.user.casa.id }).lean()

    if (!menu) {
      return NextResponse.json({ error: "Menú no encontrado" }, { status: 404 })
    }

    return NextResponse.json(menu)
  } catch (error) {
    console.error("Error fetching weekly menu:", error)
    return NextResponse.json({ error: "Error al obtener el menú" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.casa?.id) {
      return NextResponse.json({ error: "No autorizado o sin casa asignada" }, { status: 401 })
    }

    await dbConnect()
    const menuData = await request.json()

    // Verificar que el menú existe y pertenece al usuario
    const existingMenu = await WeeklyMenu.findOne({
      _id: params.id,
      casa: session.user.casa.id,
    })

    if (!existingMenu) {
      return NextResponse.json({ error: "Menú no encontrado" }, { status: 404 })
    }

    const updatedMenu = await WeeklyMenu.findByIdAndUpdate(
      params.id,
      {
        ...menuData,
        casa: existingMenu.casa, // Evitar reasignar la casa vía body (mass-assignment)
        user: session.user.id, // registrar el último editor dentro de la casa
      },
      { new: true, runValidators: true },
    )

    return NextResponse.json(updatedMenu)
  } catch (error) {
    console.error("Error updating menu:", error)
    return NextResponse.json({ error: "Error al actualizar el menú" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.casa?.id) {
      return NextResponse.json({ error: "No autorizado o sin casa asignada" }, { status: 401 })
    }

    await dbConnect()

    // Verificar que el menú existe y pertenece al usuario
    const menu = await WeeklyMenu.findOne({
      _id: params.id,
      casa: session.user.casa.id,
    })

    if (!menu) {
      return NextResponse.json({ error: "Menú no encontrado" }, { status: 404 })
    }

    await WeeklyMenu.findByIdAndDelete(params.id)
    return NextResponse.json({ message: "Menú eliminado con éxito" })
  } catch (error) {
    console.error("Error deleting menu:", error)
    return NextResponse.json({ error: "Error al eliminar el menú" }, { status: 500 })
  }
}

export const dynamic = "force-dynamic"
