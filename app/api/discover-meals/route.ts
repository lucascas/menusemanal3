import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../auth/[...nextauth]/route"

const HUGGING_FACE_API_URL = "https://api-inference.huggingface.co/models/facebook/bart-large-mnli"
const API_TIMEOUT = 10000 // 10 seconds timeout

interface MealSuggestion {
  name: string
  ingredients: string[]
  type: string
  nutritionalInfo: {
    calories: number
    protein: number
    carbs: number
    fat: number
  }
}

// Helper function to handle API request with timeout
async function fetchWithTimeout(url: string, options: RequestInit, timeout: number) {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    })
    clearTimeout(timeoutId)
    return response
  } catch (error) {
    clearTimeout(timeoutId)
    throw error
  }
}

// Helper function to get fallback suggestions based on query
function getFallbackSuggestions(query: string, mealDatabase: { [key: string]: MealSuggestion[] }) {
  // Convert query to lowercase for case-insensitive matching
  const searchTerm = query.toLowerCase()

  // Search through all meals and return matches
  const matches = Object.values(mealDatabase)
    .flat()
    .filter(
      (meal) =>
        meal.name.toLowerCase().includes(searchTerm) ||
        meal.type.toLowerCase().includes(searchTerm) ||
        meal.ingredients.some((ing) => ing.toLowerCase().includes(searchTerm)),
    )
    .slice(0, 12) // Limit to 12 suggestions

  return matches
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.casa?.id) {
      return NextResponse.json({ error: "No autorizado o sin casa asignada" }, { status: 401 })
    }

    const { query } = await request.json()

    console.log("Iniciando solicitud a Hugging Face API")
    console.log("Query:", query)

    try {
      const response = await fetchWithTimeout(
        HUGGING_FACE_API_URL,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.HUGGING_FACE_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            inputs: query,
            parameters: {
              candidate_labels: Object.keys(mealDatabase),
            },
          }),
        },
        API_TIMEOUT,
      )

      if (!response.ok) {
        throw new Error(`Error en la API de Hugging Face: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      console.log("Respuesta de Hugging Face API:", data)

      // Get suggestions based on API response
      const suggestions = data.labels
        .slice(0, 3)
        .flatMap((label) => mealDatabase[label] || [])
        .slice(0, 12)

      return NextResponse.json({ suggestions })
    } catch (error: any) {
      console.log("Error en Hugging Face API, usando fallback:", error.message)

      // If there's a timeout or any other API error, use fallback search
      const fallbackSuggestions = getFallbackSuggestions(query, mealDatabase)

      return NextResponse.json({
        suggestions: fallbackSuggestions,
        usedFallback: true,
      })
    }
  } catch (error) {
    console.error("Error detallado al descubrir comidas:", error)
    return NextResponse.json({ error: "Error al procesar la solicitud", details: error.message }, { status: 500 })
  }
}

const mealDatabase: { [key: string]: MealSuggestion[] } = {
  pasta: [
    {
      name: "Espaguetis a la boloñesa",
      ingredients: [
        "espaguetis",
        "carne molida",
        "salsa de tomate",
        "cebolla",
        "ajo",
        "zanahoria",
        "apio",
        "aceite de oliva",
      ],
      type: "pasta",
      nutritionalInfo: { calories: 500, protein: 30, carbs: 60, fat: 20 }, // Valores actualizados
    },
    {
      name: "Lasaña de verduras",
      ingredients: [
        "pasta de lasaña",
        "berenjena",
        "calabacín",
        "espinacas",
        "salsa bechamel",
        "queso",
        "salsa de tomate",
      ],
      type: "pasta",
      nutritionalInfo: { calories: 380, protein: 15, carbs: 45, fat: 18 },
    },
  ],
  carne: [
    {
      name: "Lomo saltado",
      ingredients: ["lomo de res", "cebolla", "tomate", "papa", "ají amarillo", "sillao", "vinagre", "arroz"],
      type: "carne",
      nutritionalInfo: { calories: 550, protein: 35, carbs: 45, fat: 25 },
    },
    {
      name: "Estofado de ternera",
      ingredients: ["ternera", "patatas", "zanahorias", "cebolla", "ajo", "vino tinto", "caldo de carne", "laurel"],
      type: "carne",
      nutritionalInfo: { calories: 480, protein: 32, carbs: 30, fat: 22 },
    },
  ],
  pollo: [
    {
      name: "Pollo al ajillo",
      ingredients: ["pechugas de pollo", "ajo", "perejil", "aceite de oliva", "vino blanco", "limón"],
      type: "pollo",
      nutritionalInfo: { calories: 320, protein: 38, carbs: 5, fat: 15 },
    },
    {
      name: "Fajitas de pollo",
      ingredients: ["pechuga de pollo", "pimientos", "cebolla", "tortillas de trigo", "especias mexicanas", "limón"],
      type: "pollo",
      nutritionalInfo: { calories: 400, protein: 30, carbs: 35, fat: 18 },
    },
  ],
  pescado: [
    {
      name: "Salmón al horno",
      ingredients: ["salmón", "limón", "eneldo", "aceite de oliva", "ajo", "pimienta"],
      type: "pescado",
      nutritionalInfo: { calories: 350, protein: 34, carbs: 0, fat: 22 },
    },
    {
      name: "Bacalao a la vizcaína",
      ingredients: ["bacalao", "pimientos rojos", "cebolla", "ajo", "salsa de tomate", "aceite de oliva"],
      type: "pescado",
      nutritionalInfo: { calories: 380, protein: 32, carbs: 15, fat: 20 },
    },
  ],
  vegetariano: [
    {
      name: "Curry de garbanzos",
      ingredients: ["garbanzos", "leche de coco", "especias curry", "cebolla", "tomate", "espinacas"],
      type: "vegetariano",
      nutritionalInfo: { calories: 380, protein: 15, carbs: 52, fat: 14 },
    },
    {
      name: "Hamburguesa de lentejas",
      ingredients: ["lentejas", "cebolla", "zanahoria", "avena", "especias", "ajo"],
      type: "vegetariano",
      nutritionalInfo: { calories: 320, protein: 12, carbs: 45, fat: 10 },
    },
  ],
  ensalada: [
    {
      name: "Ensalada César",
      ingredients: ["lechuga romana", "pollo", "pan tostado", "queso parmesano", "salsa césar"],
      type: "ensalada",
      nutritionalInfo: { calories: 280, protein: 22, carbs: 12, fat: 16 },
    },
    {
      name: "Ensalada caprese",
      ingredients: ["tomate", "mozzarella fresca", "albahaca", "aceite de oliva", "vinagre balsámico"],
      type: "ensalada",
      nutritionalInfo: { calories: 250, protein: 12, carbs: 8, fat: 18 },
    },
  ],
  sopa: [
    {
      name: "Sopa de tomate",
      ingredients: ["tomates", "cebolla", "ajo", "caldo de verduras", "albahaca", "crema"],
      type: "sopa",
      nutritionalInfo: { calories: 180, protein: 5, carbs: 25, fat: 8 },
    },
    {
      name: "Crema de calabaza",
      ingredients: ["calabaza", "cebolla", "ajo", "caldo de verduras", "crema", "jengibre"],
      type: "sopa",
      nutritionalInfo: { calories: 200, protein: 4, carbs: 30, fat: 10 },
    },
  ],
  arroz: [
    {
      name: "Paella valenciana",
      ingredients: ["arroz", "pollo", "conejo", "judías verdes", "garrofón", "azafrán", "tomate"],
      type: "arroz",
      nutritionalInfo: { calories: 520, protein: 28, carbs: 65, fat: 15 },
    },
    {
      name: "Risotto de champiñones",
      ingredients: ["arroz arborio", "champiñones", "cebolla", "vino blanco", "caldo", "queso parmesano"],
      type: "arroz",
      nutritionalInfo: { calories: 450, protein: 12, carbs: 70, fat: 14 },
    },
  ],
  legumbres: [
    {
      name: "Lentejas estofadas",
      ingredients: ["lentejas", "zanahoria", "cebolla", "ajo", "pimentón", "laurel", "chorizo"],
      type: "legumbres",
      nutritionalInfo: { calories: 380, protein: 22, carbs: 50, fat: 8 },
    },
    {
      name: "Garbanzos con espinacas",
      ingredients: ["garbanzos", "espinacas", "ajo", "pimentón", "comino", "aceite de oliva"],
      type: "legumbres",
      nutritionalInfo: { calories: 350, protein: 18, carbs: 45, fat: 12 },
    },
  ],
  verduras: [
    {
      name: "Ratatouille",
      ingredients: ["berenjena", "calabacín", "pimiento", "tomate", "cebolla", "ajo", "hierbas provenzales"],
      type: "verduras",
      nutritionalInfo: { calories: 180, protein: 5, carbs: 25, fat: 8 },
    },
    {
      name: "Pisto manchego",
      ingredients: ["calabacín", "berenjena", "pimiento", "tomate", "cebolla", "ajo", "aceite de oliva"],
      type: "verduras",
      nutritionalInfo: { calories: 200, protein: 4, carbs: 22, fat: 12 },
    },
  ],
}

