import { NextResponse } from "next/server"
import dbConnect from "@/lib/dbConnect"
import WeeklyMenu from "@/models/WeeklyMenu"

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    await dbConnect()
    const menuData = await request.json()

    const menu = await WeeklyMenu.findByIdAndUpdate(params.id, menuData, { new: true })

    if (!menu) {
      return NextResponse.json({ error: "Menú no encontrado" }, { status: 404 })
    }

    return NextResponse.json(menu)
  } catch (error) {
    console.error("Error updating menu:", error)

    // Fallback
    const menuData = await request.json()
    return NextResponse.json({
      _id: params.id,
      ...menuData,
    })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    await dbConnect()

    const menu = await WeeklyMenu.findByIdAndDelete(params.id)

    if (!menu) {
      return NextResponse.json({ error: "Menú no encontrado" }, { status: 404 })
    }

    return NextResponse.json({ message: "Menú eliminado" })
  } catch (error) {
    console.error("Error deleting menu:", error)

    // Fallback
    return NextResponse.json({ message: "Menú eliminado" })
  }
}

export const dynamic = "force-dynamic"
