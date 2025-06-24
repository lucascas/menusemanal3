import { NextResponse } from "next/server"
import dbConnect from "@/lib/dbConnect"
import Meal from "@/models/Meal"

export async function GET() {
  try {
    await dbConnect()
    const meals = await Meal.find({}).lean()
    return NextResponse.json(meals)
  } catch (error) {
    console.error("Error fetching meals:", error)
    // Fallback a datos mock si falla la DB
    const mockMeals = [
      {
        _id: "1",
        name: "Pollo a la plancha",
        type: "pollo",
        ingredients: ["pollo", "sal", "pimienta", "aceite"],
        mealTime: "Almuerzo",
        casa: "mock-casa",
        user: "mock-user",
        nutritionalInfo: {
          calories: 250,
          protein: 30,
          carbs: 0,
          fat: 12,
        },
      },
      {
        _id: "2",
        name: "Pasta con tomate",
        type: "pastas",
        ingredients: ["pasta", "tomate", "albahaca", "ajo"],
        mealTime: "Cena",
        casa: "mock-casa",
        user: "mock-user",
        nutritionalInfo: {
          calories: 350,
          protein: 12,
          carbs: 65,
          fat: 8,
        },
      },
      {
        _id: "3",
        name: "Ensalada mixta",
        type: "vegetariano",
        ingredients: ["lechuga", "tomate", "zanahoria", "aceite de oliva"],
        mealTime: "Almuerzo",
        casa: "mock-casa",
        user: "mock-user",
        nutritionalInfo: {
          calories: 120,
          protein: 3,
          carbs: 15,
          fat: 6,
        },
      },
    ]
    return NextResponse.json(mockMeals)
  }
}

export async function POST(request: Request) {
  try {
    await dbConnect()
    const mealData = await request.json()

    const newMeal = new Meal({
      ...mealData,
      user: "mock-user",
      casa: "mock-casa",
    })

    const savedMeal = await newMeal.save()
    return NextResponse.json(savedMeal)
  } catch (error) {
    console.error("Error creating meal:", error)
    return NextResponse.json({ error: "Error al crear la comida" }, { status: 500 })
  }
}

export const dynamic = "force-dynamic"
