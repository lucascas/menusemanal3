import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../../auth/[...nextauth]/route"
import dbConnect from "@/lib/dbConnect"
import Meal from "@/models/Meal"

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.casa?.id) {
      return NextResponse.json({ error: "No autorizado o sin casa asignada" }, { status: 401 })
    }

    await dbConnect()
    const mealData = await request.json()

    // Verify the meal exists and belongs to the user's house
    const existingMeal = await Meal.findOne({
      _id: params.id,
      casa: session.user.casa.id,
    })

    if (!existingMeal) {
      return NextResponse.json({ error: "Comida no encontrada" }, { status: 404 })
    }

    // Update the meal
    const updatedMeal = await Meal.findByIdAndUpdate(
      params.id,
      {
        ...mealData,
        casa: session.user.casa.id, // Ensure casa doesn't change
      },
      { new: true, runValidators: true },
    )

    return NextResponse.json(updatedMeal)
  } catch (error) {
    console.error("Error updating meal:", error)
    return NextResponse.json({ error: "Error al actualizar la comida" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.casa?.id) {
      return NextResponse.json({ error: "No autorizado o sin casa asignada" }, { status: 401 })
    }

    await dbConnect()

    // Verify the meal exists and belongs to the user's house
    const meal = await Meal.findOne({
      _id: params.id,
      casa: session.user.casa.id,
    })

    if (!meal) {
      return NextResponse.json({ error: "Comida no encontrada" }, { status: 404 })
    }

    await Meal.findByIdAndDelete(params.id)
    return NextResponse.json({ message: "Comida eliminada con éxito" })
  } catch (error) {
    console.error("Error deleting meal:", error)
    return NextResponse.json({ error: "Error al eliminar la comida" }, { status: 500 })
  }
}

