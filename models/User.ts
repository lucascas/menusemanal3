import mongoose from "mongoose"
import bcrypt from "bcryptjs"

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, "Por favor, proporciona un email"],
    unique: true,
    lowercase: true,
    trim: true,
  },
  name: {
    type: String,
    trim: true,
  },
  password: {
    type: String,
    required: [
      function (this: any) {
        return !this.googleId
      },
      "Por favor, proporciona una contraseña",
    ],
    select: false,
    minlength: [6, "La contraseña debe tener al menos 6 caracteres"],
  },
  googleId: {
    type: String,
    sparse: true,
    index: true,
  },
  emailVerified: {
    type: Boolean,
    default: false,
  },
  casa: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Casa",
    required: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  lastLogin: {
    type: Date,
  },
})

// Middleware pre-save para hashear contraseña
UserSchema.pre("save", async function (next) {
  if (this.isModified("password") && this.password) {
    try {
      const salt = await bcrypt.genSalt(10)
      this.password = await bcrypt.hash(this.password, salt)
    } catch (error) {
      return next(error as Error)
    }
  }
  next()
})

// Método para comparar contraseñas
UserSchema.methods.comparePassword = async function (candidatePassword: string) {
  if (!this.password) return false
  try {
    return await bcrypt.compare(candidatePassword, this.password)
  } catch (error) {
    return false
  }
}

// Asegurarse de que el modelo no se registre más de una vez
const User = mongoose.models.User || mongoose.model("User", UserSchema)

export default User

