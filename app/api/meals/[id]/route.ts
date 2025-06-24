import { NextResponse } from "next/server"
import dbConnect from "@/lib/dbConnect"
import Meal from "@/models/Meal"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    await dbConnect()
    const meal = await Meal.findById(params.id).lean()

    if (!meal) {
      return NextResponse.json({ error: "Comida no encontrada" }, { status: 404 })
    }

    return NextResponse.json(meal)
  } catch (error) {
    console.error("Error fetching meal:", error)
    return NextResponse.json({ error: "Error al obtener la comida" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    await dbConnect()
    const mealData = await request.json()

    const updatedMeal = await Meal.findByIdAndUpdate(params.id, mealData, { new: true, runValidators: true }).lean()

    if (!updatedMeal) {
      return NextResponse.json({ error: "Comida no encontrada" }, { status: 404 })
    }

    return NextResponse.json(updatedMeal)
  } catch (error) {
    console.error("Error updating meal:", error)
    return NextResponse.json({ error: "Error al actualizar la comida" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    await dbConnect()
    const deletedMeal = await Meal.findByIdAndDelete(params.id)

    if (!deletedMeal) {
      return NextResponse.json({ error: "Comida no encontrada" }, { status: 404 })
    }

    return NextResponse.json({ message: "Comida eliminada exitosamente" })
  } catch (error) {
    console.error("Error deleting meal:", error)
    return NextResponse.json({ error: "Error al eliminar la comida" }, { status: 500 })
  }
}

export const dynamic = "force-dynamic"
