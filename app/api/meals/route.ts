import { NextResponse } from "next/server"
import dbConnect from "@/lib/dbConnect"
import Meal from "@/models/Meal"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../auth/[...nextauth]/route"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.casa?.id) {
      return NextResponse.json({ error: "No autorizado o sin casa asignada" }, { status: 401 })
    }

    await dbConnect()

    const meals = await Meal.find({ casa: session.user.casa.id })
    return NextResponse.json(meals)
  } catch (error) {
    console.error("Error fetching meals:", error)
    return NextResponse.json({ error: "Error al obtener las comidas" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.casa?.id) {
      return NextResponse.json({ error: "No autorizado o sin casa asignada" }, { status: 401 })
    }

    await dbConnect()
    const mealData = await request.json()

    const meal = await Meal.create({
      ...mealData,
      user: session.user.id,
      casa: session.user.casa.id,
    })
    return NextResponse.json(meal)
  } catch (error) {
    console.error("Error creating meal:", error)
    return NextResponse.json({ error: "Error al crear la comida" }, { status: 500 })
  }
}

export const dynamic = "force-dynamic"
