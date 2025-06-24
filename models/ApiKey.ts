import mongoose from "mongoose"
import crypto from "crypto"

const ApiKeySchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  casa: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Casa",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  lastUsed: {
    type: Date,
  },
})

// Método estático para generar una nueva clave API
ApiKeySchema.statics.generateKey = () => crypto.randomBytes(32).toString("hex")

export default mongoose.models.ApiKey || mongoose.model("ApiKey", ApiKeySchema)
