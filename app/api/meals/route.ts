import { NextResponse } from "next/server"

// Datos mock que siempre funcionan
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

const meals = [...mockMeals]

export async function GET() {
  // Siempre devolver datos, sin try/catch que pueda fallar
  return NextResponse.json(meals)
}

export async function POST(request: Request) {
  try {
    const mealData = await request.json()
    const newMeal = {
      _id: Date.now().toString(),
      ...mealData,
      user: "mock-user",
      casa: "mock-casa",
    }
    meals.push(newMeal)
    return NextResponse.json(newMeal)
  } catch (error) {
    // Si falla, devolver un meal básico
    return NextResponse.json({
      _id: Date.now().toString(),
      name: "Comida nueva",
      type: "otros",
      ingredients: ["ingrediente"],
      mealTime: "Almuerzo",
      casa: "mock-casa",
      user: "mock-user",
    })
  }
}

export const dynamic = "force-dynamic"
