// Seed de demostración: crea una Casa, un usuario que puede loguearse,
// comidas y un menú semanal, todo con las relaciones (ObjectId) correctas.
// Inserta los documentos en crudo para evitar el doble-hash del pre-save de User.
const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")

const URI = process.env.MONGODB_URI || "mongodb://localhost:27017/menusemanal"
const EMAIL = "demo@demo.com"
const PASSWORD = "demo1234"

async function main() {
  await mongoose.connect(URI)
  const db = mongoose.connection.db
  const { ObjectId } = mongoose.Types

  const users = db.collection("users")
  const casas = db.collection("casas")
  const meals = db.collection("meals")
  const weeklymenus = db.collection("weeklymenus")

  // Limpiar datos previos del demo
  const existing = await users.findOne({ email: EMAIL })
  if (existing) {
    await casas.deleteMany({ creador: existing._id })
    await meals.deleteMany({ user: existing._id.toString() })
    await weeklymenus.deleteMany({ user: existing._id.toString() })
    await users.deleteOne({ _id: existing._id })
  }

  const userId = new ObjectId()
  const casaId = new ObjectId()
  const hashed = await bcrypt.hash(PASSWORD, 10) // un solo hash -> login funciona

  await users.insertOne({
    _id: userId,
    email: EMAIL,
    name: "Usuario Demo",
    password: hashed,
    emailVerified: true,
    casa: casaId,
    createdAt: new Date(),
  })

  await casas.insertOne({
    _id: casaId,
    nombre: "Casa Demo",
    creador: userId,
    createdAt: new Date(),
  })

  const uid = userId.toString()
  const sampleMeals = [
    { name: "Pollo a la plancha", type: "pollo", mealTime: "Almuerzo", ingredients: ["pollo", "sal", "pimienta", "aceite de oliva", "limón"], nutritionalInfo: { calories: 250, protein: 30, carbs: 0, fat: 12 } },
    { name: "Pasta con tomate", type: "pastas", mealTime: "Cena", ingredients: ["pasta", "tomate", "albahaca", "ajo", "aceite de oliva"], nutritionalInfo: { calories: 350, protein: 12, carbs: 65, fat: 8 } },
    { name: "Ensalada mixta", type: "vegetariano", mealTime: "Almuerzo", ingredients: ["lechuga", "tomate", "zanahoria", "aceite de oliva", "vinagre"], nutritionalInfo: { calories: 120, protein: 3, carbs: 15, fat: 6 } },
    { name: "Salmón al horno", type: "pescado", mealTime: "Cena", ingredients: ["salmón", "limón", "hierbas", "aceite de oliva", "sal"], nutritionalInfo: { calories: 300, protein: 25, carbs: 0, fat: 20 } },
    { name: "Arroz con pollo", type: "pollo", mealTime: "Almuerzo", ingredients: ["arroz", "pollo", "verduras", "caldo", "especias"], nutritionalInfo: { calories: 400, protein: 28, carbs: 45, fat: 10 } },
    { name: "Milanesa con puré", type: "carne", mealTime: "Cena", ingredients: ["carne", "pan rallado", "huevo", "papa", "leche"], nutritionalInfo: { calories: 520, protein: 32, carbs: 40, fat: 24 } },
  ].map((m) => ({ ...m, casa: casaId, user: uid }))

  await meals.insertMany(sampleMeals)

  await weeklymenus.insertOne({
    fecha: new Date(),
    menu: {
      Lunes: { almuerzo: "Pollo a la plancha", cena: "Pasta con tomate" },
      Martes: { almuerzo: "Ensalada mixta", cena: "Salmón al horno" },
      Miércoles: { almuerzo: "Arroz con pollo", cena: "Milanesa con puré" },
      Jueves: { almuerzo: "Pollo a la plancha", cena: "Ensalada mixta" },
      Viernes: { almuerzo: "Salmón al horno", cena: "Arroz con pollo" },
    },
    ingredientes: ["pollo", "pasta", "tomate", "lechuga", "salmón", "arroz", "carne", "papa"],
    user: uid,
    casa: casaId,
  })

  console.log("✓ Seed completo")
  console.log(`  Casa:   Casa Demo (${casaId})`)
  console.log(`  Comidas: ${sampleMeals.length}`)
  console.log(`  Login:  ${EMAIL} / ${PASSWORD}`)

  await mongoose.disconnect()
}

main().catch((e) => {
  console.error("Error en el seed:", e)
  process.exit(1)
})
