import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../../auth/[...nextauth]/route"
import dbConnect from "@/lib/dbConnect"
import Meal from "@/models/Meal"

const HUGGING_FACE_API_URL = "https://api-inference.huggingface.co/models/facebook/bart-large-mnli"

// Helper function to extract ingredient names
function extractIngredientNames(ingredients: any[]): string[] {
  if (!ingredients || !Array.isArray(ingredients)) return []

  return ingredients
    .map((ing) => {
      if (typeof ing === "string") return ing
      if (ing && typeof ing === "object" && ing.name) return ing.name
      return ""
    })
    .filter((name) => name !== "")
}

async function calculateNutrition(ingredients: any[]) {
  // Extract ingredient names using the helper function
  const ingredientNames = extractIngredientNames(ingredients)

  if (ingredientNames.length === 0) {
    return {
      calories: 300,
      protein: 15,
      carbs: 30,
      fat: 10,
    }
  }

  const response = await fetch(HUGGING_FACE_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.HUGGING_FACE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      inputs: ingredientNames.join(", "),
      parameters: {
        candidate_labels: [
          "high calorie",
          "low calorie",
          "high protein",
          "low protein",
          "high carb",
          "low carb",
          "high fat",
          "low fat",
        ],
      },
    }),
  })

  if (!response.ok) {
    throw new Error("Error en la API de Hugging Face")
  }

  const data = await response.json()

  return {
    calories: data.labels.includes("high calorie") ? 500 : 300,
    protein: data.labels.includes("high protein") ? 30 : 15,
    carbs: data.labels.includes("high carb") ? 60 : 30,
    fat: data.labels.includes("high fat") ? 20 : 10,
  }
}

export async function POST() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.casa?.id) {
      return NextResponse.json({ error: "No autorizado o sin casa asignada" }, { status: 401 })
    }

    await dbConnect()

    const meals = await Meal.find({ casa: session.user.casa.id })

    for (const meal of meals) {
      const nutritionInfo = await calculateNutrition(meal.ingredients)
      meal.nutritionalInfo = nutritionInfo
      if (meal.type === "carnes") {
        meal.type = "carne"
      }
      meal.type = meal.type.toLowerCase()
      await meal.save()
    }

    const updatedMeals = await Meal.find({ casa: session.user.casa.id })

    return NextResponse.json(updatedMeals)
  } catch (error) {
    console.error("Error al calcular los valores nutritivos:", error)
    return NextResponse.json({ error: "Error al procesar la información nutricional" }, { status: 500 })
  }
}

