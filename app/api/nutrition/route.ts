import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../auth/[...nextauth]/route"

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

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.casa?.id) {
      return NextResponse.json({ error: "No autorizado o sin casa asignada" }, { status: 401 })
    }

    const { ingredients } = await request.json()

    // Extract ingredient names using the helper function
    const ingredientNames = extractIngredientNames(ingredients)

    if (ingredientNames.length === 0) {
      return NextResponse.json(
        {
          error: "No se pudieron extraer nombres de ingredientes válidos",
        },
        { status: 400 },
      )
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

    // Process the response to estimate nutritional values
    const nutritionEstimate = {
      calories: data.labels.includes("high calorie") ? 500 : 300,
      protein: data.labels.includes("high protein") ? 30 : 15,
      carbs: data.labels.includes("high carb") ? 60 : 30,
      fat: data.labels.includes("high fat") ? 20 : 10,
    }

    return NextResponse.json(nutritionEstimate)
  } catch (error) {
    console.error("Error al obtener información nutricional:", error)
    return NextResponse.json({ error: "Error al procesar la información nutricional" }, { status: 500 })
  }
}

