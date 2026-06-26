import { NextResponse } from "next/server"
import dbConnect from "@/lib/dbConnect"
import Meal from "@/models/Meal"
import WeeklyMenu from "@/models/WeeklyMenu"
import User from "@/models/User"
import Casa from "@/models/Casa"

const DEMO_EMAIL = "demo@demo.com"
const DEMO_PASSWORD = "demo1234"
const DEMO_CASA = "Casa Demo"

const sampleMeals = [
  {
    name: "Pollo a la plancha",
    type: "pollo",
    ingredients: ["pollo", "sal", "pimienta", "aceite de oliva", "limón"],
    mealTime: "Almuerzo",
    nutritionalInfo: { calories: 250, protein: 30, carbs: 0, fat: 12 },
  },
  {
    name: "Pasta con tomate",
    type: "pastas",
    ingredients: ["pasta", "tomate", "albahaca", "ajo", "aceite de oliva"],
    mealTime: "Cena",
    nutritionalInfo: { calories: 350, protein: 12, carbs: 65, fat: 8 },
  },
  {
    name: "Ensalada mixta",
    type: "vegetariano",
    ingredients: ["lechuga", "tomate", "zanahoria", "aceite de oliva", "vinagre"],
    mealTime: "Almuerzo",
    nutritionalInfo: { calories: 120, protein: 3, carbs: 15, fat: 6 },
  },
  {
    name: "Salmón al horno",
    type: "pescado",
    ingredients: ["salmón", "limón", "hierbas", "aceite de oliva", "sal"],
    mealTime: "Cena",
    nutritionalInfo: { calories: 300, protein: 25, carbs: 0, fat: 20 },
  },
  {
    name: "Arroz con pollo",
    type: "pollo",
    ingredients: ["arroz", "pollo", "verduras", "caldo", "especias"],
    mealTime: "Almuerzo",
    nutritionalInfo: { calories: 400, protein: 28, carbs: 45, fat: 10 },
  },
]

export async function POST() {
  try {
    await dbConnect()

    // Asegurarse de que los modelos estén registrados
    require("@/models/User")
    require("@/models/Casa")

    // Usuario demo (find-or-create). La contraseña va en texto plano: el hook
    // pre-save de User la hashea una sola vez para que el login funcione.
    let user = await User.findOne({ email: DEMO_EMAIL })
    if (!user) {
      user = await User.create({ email: DEMO_EMAIL, name: "Usuario Demo", password: DEMO_PASSWORD })
    }

    // Casa demo (find-or-create) ligada al usuario
    let casa = await Casa.findOne({ nombre: DEMO_CASA })
    if (!casa) {
      casa = await Casa.create({ nombre: DEMO_CASA, creador: user._id })
    }
    if (!user.casa) {
      user.casa = casa._id
      await user.save()
    }

    const casaId = casa._id
    const userId = user._id.toString()

    // Limpiar datos existentes de esta casa
    await Meal.deleteMany({ casa: casaId })
    await WeeklyMenu.deleteMany({ casa: casaId })

    // Insertar comidas de ejemplo con las referencias correctas
    const createdMeals = await Meal.insertMany(
      sampleMeals.map((m) => ({ ...m, casa: casaId, user: userId })),
    )

    // Insertar un menú semanal de ejemplo
    const createdMenus = await WeeklyMenu.insertMany([
      {
        fecha: new Date(),
        menu: {
          Lunes: { almuerzo: "Pollo a la plancha", cena: "Pasta con tomate" },
          Martes: { almuerzo: "Ensalada mixta", cena: "Salmón al horno" },
          Miércoles: { almuerzo: "Arroz con pollo", cena: "Pasta con tomate" },
          Jueves: { almuerzo: "Pollo a la plancha", cena: "Ensalada mixta" },
          Viernes: { almuerzo: "Salmón al horno", cena: "Arroz con pollo" },
        },
        ingredientes: ["pollo", "pasta", "tomate", "lechuga", "salmón", "arroz", "aceite de oliva"],
        user: userId,
        casa: casaId,
      },
    ])

    return NextResponse.json({
      success: true,
      message: "Base de datos poblada exitosamente",
      data: {
        mealsCreated: createdMeals.length,
        menusCreated: createdMenus.length,
        login: { email: DEMO_EMAIL, password: DEMO_PASSWORD },
        casa: DEMO_CASA,
      },
    })
  } catch (error) {
    console.error("Error poblando la base de datos:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Error al poblar la base de datos",
        details: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 },
    )
  }
}

export const dynamic = "force-dynamic"
