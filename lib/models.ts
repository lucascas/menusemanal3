// Este archivo asegura que todos los modelos estén registrados correctamente
import mongoose from "mongoose"
import { logger } from "./logger"

// Importar todos los modelos para asegurar que estén registrados
import "../models/User"
import "../models/Casa"
import "../models/Meal"
import "../models/Admin"
import "../models/Invitation"
import "../models/WeeklyMenu"

export function ensureModelsRegistered() {
  // Verificar si los modelos están registrados
  const registeredModels = Object.keys(mongoose.models)
  logger.info(`Modelos registrados: ${registeredModels.join(", ")}`)

  // Verificar modelos específicos
  if (!mongoose.models.User) {
    logger.warn("Modelo User no registrado")
  }

  if (!mongoose.models.Casa) {
    logger.warn("Modelo Casa no registrado")
  }

  if (!mongoose.models.Admin) {
    logger.warn("Modelo Admin no registrado")
  }

  return registeredModels
}
