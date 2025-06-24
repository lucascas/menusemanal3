import mongoose from "mongoose"

// Define el esquema antes de exportarlo
const CasaSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: [true, "Por favor, proporciona un nombre para la casa"],
    unique: true,
  },
  creador: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

// Asegurarse de que el modelo se registre solo una vez
const Casa = mongoose.models.Casa || mongoose.model("Casa", CasaSchema)

export default Casa
