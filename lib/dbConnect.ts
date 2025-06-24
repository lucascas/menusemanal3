import mongoose from "mongoose"
import { logger } from "@/lib/logger"

if (!process.env.MONGODB_URI) {
  throw new Error('Variable de entorno inválida/faltante: "MONGODB_URI"')
}

const uri = process.env.MONGODB_URI
let cached = global.mongoose

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null }
}

async function dbConnect() {
  if (cached.conn) {
    return cached.conn
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    }

    cached.promise = mongoose.connect(uri, opts).then((mongoose) => {
      logger.info("Conexión a MongoDB establecida")
      return mongoose
    })
  }

  try {
    cached.conn = await cached.promise
  } catch (e) {
    logger.error("Error al conectar a MongoDB:", e)
    cached.promise = null
    throw e
  }

  return cached.conn
}

async function preloadModels() {
  try {
    await dbConnect()
    logger.info("Base de datos conectada y modelos precargados.")
  } catch (error) {
    logger.error("Error al conectar a la base de datos durante la precarga:", error)
  }
}

export default dbConnect
export { preloadModels }

