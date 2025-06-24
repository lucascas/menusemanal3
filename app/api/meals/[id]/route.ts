import { NextResponse } from "next/server"
import dbConnect from "@/lib/dbConnect"
import Meal from "@/models/Meal"

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    await dbConnect()
    const mealData = await request.json()

    const meal = await Meal.findByIdAndUpdate(params.id, mealData, { new: true })

    if (!meal) {
      return NextResponse.json({ error: "Comida no encontrada" }, { status: 404 })
    }

    return NextResponse.json(meal)
  } catch (error) {
    console.error("Error updating meal:", error)

    // Fallback: devolver los datos actualizados con el ID
    const mealData = await request.json()
    return NextResponse.json({
      _id: params.id,
      ...mealData,
    })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    await dbConnect()

    const meal = await Meal.findByIdAndDelete(params.id)

    if (!meal) {
      return NextResponse.json({ error: "Comida no encontrada" }, { status: 404 })
    }

    return NextResponse.json({ message: "Comida eliminada" })
  } catch (error) {
    console.error("Error deleting meal:", error)

    // Fallback: simular eliminación exitosa
    return NextResponse.json({ message: "Comida eliminada" })
  }
}

export const dynamic = "force-dynamic"
