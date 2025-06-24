import mongoose from "mongoose"

const WeeklyMenuSchema = new mongoose.Schema({
  fecha: {
    type: Date,
    required: [true, "Please provide a date for this menu"],
    default: Date.now,
  },
  menu: {
    type: Map,
    of: {
      fecha: Date,
      almuerzo: String,
      cena: String,
    },
    required: [true, "Please provide a menu for the week"],
  },
  ingredientes: {
    type: [String],
    default: [],
  },
  user: {
    type: String,
    ref: "User",
    required: true,
  },
  casa: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Casa",
    required: true,
  },
})

export default mongoose.models.WeeklyMenu || mongoose.model("WeeklyMenu", WeeklyMenuSchema)
