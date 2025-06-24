import { NextResponse } from "next/server"
import dbConnect from "@/lib/dbConnect"
import WeeklyMenu from "@/models/WeeklyMenu"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    await dbConnect()
    const menu = await WeeklyMenu.findById(params.id).lean()

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
    await dbConnect()
    const menuData = await request.json()

    const updatedMenu = await WeeklyMenu.findByIdAndUpdate(params.id, menuData, {
      new: true,
      runValidators: true,
    }).lean()

    if (!updatedMenu) {
      return NextResponse.json({ error: "Menú no encontrado" }, { status: 404 })
    }

    return NextResponse.json(updatedMenu)
  } catch (error) {
    console.error("Error updating weekly menu:", error)
    return NextResponse.json({ error: "Error al actualizar el menú" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    await dbConnect()
    const deletedMenu = await WeeklyMenu.findByIdAndDelete(params.id)

    if (!deletedMenu) {
      return NextResponse.json({ error: "Menú no encontrado" }, { status: 404 })
    }

    return NextResponse.json({ message: "Menú eliminado exitosamente" })
  } catch (error) {
    console.error("Error deleting weekly menu:", error)
    return NextResponse.json({ error: "Error al eliminar el menú" }, { status: 500 })
  }
}

export const dynamic = "force-dynamic"
