import mongoose from "mongoose"

const MealSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please provide a name for this meal"],
    maxlength: [60, "Name cannot be more than 60 characters"],
  },
  type: {
    type: String,
    required: [true, "Please specify the type of meal"],
    enum: ["carne", "carnes", "pollo", "pescado", "vegetariano", "pastas", "otros"],
    lowercase: true, // Esto asegurará que los valores se guarden en minúsculas
  },
  ingredients: {
    type: [String], // Cambiado a array de strings
    required: [true, "Please provide the ingredients for this meal"],
  },
  mealTime: {
    type: String,
    required: [true, "Please specify if this is for lunch or dinner"],
    enum: ["Almuerzo", "Cena"],
  },
  casa: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Casa",
    required: true,
  },
  user: {
    type: String,
    ref: "User",
    required: true,
  },
  nutritionalInfo: {
    calories: Number,
    protein: Number,
    carbs: Number,
    fat: Number,
  },
})

export default mongoose.models.Meal || mongoose.model("Meal", MealSchema)
