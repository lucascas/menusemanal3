import dbConnect from "../lib/dbConnect"
import Meal from "../models/Meal"
import WeeklyMenu from "../models/WeeklyMenu"

const sampleMeals = [
  {
    name: "Pollo a la plancha",
    type: "pollo",
    ingredients: ["pollo", "sal", "pimienta", "aceite de oliva", "limón"],
    mealTime: "Almuerzo",
    casa: "default-casa",
    user: "default-user",
    nutritionalInfo: {
      calories: 250,
      protein: 30,
      carbs: 0,
      fat: 12,
    },
  },
  {
    name: "Pasta con tomate",
    type: "pastas",
    ingredients: ["pasta", "tomate", "albahaca", "ajo", "aceite de oliva"],
    mealTime: "Cena",
    casa: "default-casa",
    user: "default-user",
    nutritionalInfo: {
      calories: 350,
      protein: 12,
      carbs: 65,
      fat: 8,
    },
  },
  {
    name: "Ensalada mixta",
    type: "vegetariano",
    ingredients: ["lechuga", "tomate", "zanahoria", "aceite de oliva", "vinagre"],
    mealTime: "Almuerzo",
    casa: "default-casa",
    user: "default-user",
    nutritionalInfo: {
      calories: 120,
      protein: 3,
      carbs: 15,
      fat: 6,
    },
  },
  {
    name: "Salmón al horno",
    type: "pescado",
    ingredients: ["salmón", "limón", "hierbas", "aceite de oliva", "sal"],
    mealTime: "Cena",
    casa: "default-casa",
    user: "default-user",
    nutritionalInfo: {
      calories: 300,
      protein: 25,
      carbs: 0,
      fat: 20,
    },
  },
  {
    name: "Arroz con pollo",
    type: "pollo",
    ingredients: ["arroz", "pollo", "verduras", "caldo", "especias"],
    mealTime: "Almuerzo",
    casa: "default-casa",
    user: "default-user",
    nutritionalInfo: {
      calories: 400,
      protein: 28,
      carbs: 45,
      fat: 10,
    },
  },
]

const sampleMenus = [
  {
    fecha: new Date("2024-01-15"),
    menu: {
      Lunes: {
        almuerzo: "Pollo a la plancha",
        cena: "Pasta con tomate",
      },
      Martes: {
        almuerzo: "Ensalada mixta",
        cena: "Salmón al horno",
      },
      Miércoles: {
        almuerzo: "Arroz con pollo",
        cena: "Pasta con tomate",
      },
      Jueves: {
        almuerzo: "Pollo a la plancha",
        cena: "Ensalada mixta",
      },
      Viernes: {
        almuerzo: "Salmón al horno",
        cena: "Arroz con pollo",
      },
    },
    ingredientes: [
      "pollo",
      "pasta",
      "tomate",
      "lechuga",
      "salmón",
      "arroz",
      "verduras",
      "aceite de oliva",
      "sal",
      "pimienta",
    ],
    user: "default-user",
    casa: "default-casa",
  },
  {
    fecha: new Date("2024-01-08"),
    menu: {
      Lunes: {
        almuerzo: "Arroz con pollo",
        cena: "Ensalada mixta",
      },
      Martes: {
        almuerzo: "Salmón al horno",
        cena: "Pasta con tomate",
      },
      Miércoles: {
        almuerzo: "Pollo a la plancha",
        cena: "Arroz con pollo",
      },
    },
    ingredientes: ["arroz", "pollo", "salmón", "pasta", "tomate", "lechuga", "aceite de oliva"],
    user: "default-user",
    casa: "default-casa",
  },
]

async function seedDatabase() {
  try {
    await dbConnect()
    console.log("Conectado a la base de datos")

    // Limpiar datos existentes
    await Meal.deleteMany({})
    await WeeklyMenu.deleteMany({})
    console.log("Datos existentes eliminados")

    // Insertar comidas de ejemplo
    const createdMeals = await Meal.insertMany(sampleMeals)
    console.log(`${createdMeals.length} comidas creadas`)

    // Insertar menús de ejemplo
    const createdMenus = await WeeklyMenu.insertMany(sampleMenus)
    console.log(`${createdMenus.length} menús creados`)

    console.log("Base de datos poblada exitosamente")
  } catch (error) {
    console.error("Error poblando la base de datos:", error)
  }
}

seedDatabase()
