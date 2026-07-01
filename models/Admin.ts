import mongoose from "mongoose"
import bcrypt from "bcryptjs"

const AdminSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, "Por favor, proporciona un nombre de usuario"],
    unique: true,
    trim: true,
  },
  password: {
    type: String,
    required: [true, "Por favor, proporciona una contraseña"],
    select: false,
    minlength: [6, "La contraseña debe tener al menos 6 caracteres"],
  },
  role: {
    type: String,
    enum: ["admin", "superadmin"],
    default: "admin",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  lastLogin: {
    type: Date,
  },
})

// Middleware pre-save para hashear contraseña.
// Hook async: en la versión actual de Mongoose NO recibe `next` (lanzar el error
// directamente). Mismo criterio que el hook de `models/User.ts`.
AdminSchema.pre("save", async function () {
  if (this.isModified("password") && this.password) {
    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt)
  }
})

// Método para comparar contraseñas
AdminSchema.methods.comparePassword = async function (candidatePassword: string) {
  if (!this.password) return false
  try {
    return await bcrypt.compare(candidatePassword, this.password)
  } catch (error) {
    return false
  }
}

// Asegurarse de que el modelo no se registre más de una vez
const Admin = mongoose.models.Admin || mongoose.model("Admin", AdminSchema)

export default Admin
