import mongoose from "mongoose"
import bcrypt from "bcryptjs"
import { logger } from "../lib/logger"

// Definir el esquema de Admin
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

// Middleware pre-save para hashear contraseña
AdminSchema.pre("save", async function (next) {
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

// Crear el modelo
const Admin = mongoose.models.Admin || mongoose.model("Admin", AdminSchema)

async function createAdmin() {
  try {
    // Conectar a MongoDB
    if (!process.env.MONGODB_URI) {
      throw new Error('Variable de entorno inválida/faltante: "MONGODB_URI"')
    }

    // Verificar ADMIN_JWT_SECRET
    if (!process.env.ADMIN_JWT_SECRET) {
      logger.warn(
        'Variable de entorno inválida/faltante: "ADMIN_JWT_SECRET". Se recomienda configurarla para la autenticación de administradores.',
      )
    }

    await mongoose.connect(process.env.MONGODB_URI)
    logger.info("Conexión a MongoDB establecida")

    // Verificar si ya existe un superadmin
    const existingAdmin = await Admin.findOne({ role: "superadmin" })
    if (existingAdmin) {
      logger.info("Ya existe un superadmin en la base de datos")
      return
    }

    // Crear el superadmin
    const username = "admin"
    const password = "admin123" // Cambiar esto en producción

    const admin = await Admin.create({
      username,
      password, // Se hasheará automáticamente gracias al middleware
      role: "superadmin",
    })

    logger.info(`Superadmin creado con éxito: ${username}`)
    logger.info("Por favor, cambie la contraseña después del primer inicio de sesión")
  } catch (error) {
    logger.error("Error al crear el superadmin:", error)
  } finally {
    // Cerrar la conexión
    await mongoose.disconnect()
    logger.info("Conexión a MongoDB cerrada")
  }
}

// Ejecutar la función
createAdmin()
