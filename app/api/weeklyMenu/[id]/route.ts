import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../../auth/[...nextauth]/route"
import dbConnect from "@/lib/dbConnect"
import WeeklyMenu from "@/models/WeeklyMenu"

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    await dbConnect()
    const menuData = await request.json()

    // Verify the menu exists and belongs to the user
    const existingMenu = await WeeklyMenu.findOne({
      _id: params.id,
      user: session.user.id,
    })

    if (!existingMenu) {
      return NextResponse.json({ error: "Menú no encontrado" }, { status: 404 })
    }

    // Update the menu
    const updatedMenu = await WeeklyMenu.findByIdAndUpdate(
      params.id,
      {
        ...menuData,
        user: session.user.id, // Ensure user doesn't change
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
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    await dbConnect()

    // Verify the menu exists and belongs to the user
    const menu = await WeeklyMenu.findOne({
      _id: params.id,
      user: session.user.id,
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
