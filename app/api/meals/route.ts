import { NextResponse } from "next/server"
import dbConnect from "@/lib/dbConnect"
import Meal from "@/models/Meal"

export async function GET() {
  try {
    await dbConnect()

    // Sin autenticación, devolvemos todas las comidas o creamos datos mock
    const meals = await Meal.find({}).limit(50) // Limitamos para no sobrecargar
    return NextResponse.json(meals)
  } catch (error) {
    console.error("Error fetching meals:", error)

    // Si falla la BD, devolvemos datos mock
    const mockMeals = [
      {
        _id: "1",
        name: "Pollo a la plancha",
        type: "pollo",
        ingredients: ["pollo", "sal", "pimienta"],
        mealTime: "Almuerzo",
        casa: "mock-casa",
        user: "mock-user",
      },
      {
        _id: "2",
        name: "Pasta con tomate",
        type: "pastas",
        ingredients: ["pasta", "tomate", "albahaca"],
        mealTime: "Cena",
        casa: "mock-casa",
        user: "mock-user",
      },
    ]

    return NextResponse.json(mockMeals)
  }
}

export async function POST(request: Request) {
  try {
    await dbConnect()
    const mealData = await request.json()

    const meal = await Meal.create({
      ...mealData,
      user: "mock-user",
      casa: "mock-casa",
    })
    return NextResponse.json(meal)
  } catch (error) {
    console.error("Error creating meal:", error)

    // Si falla, devolvemos la comida con un ID mock
    const mealData = await request.json()
    return NextResponse.json({
      _id: Date.now().toString(),
      ...mealData,
      user: "mock-user",
      casa: "mock-casa",
    })
  }
}

export const dynamic = "force-dynamic"
