import { NextResponse } from "next/server"
import dbConnect from "@/lib/dbConnect"

export async function GET() {
  try {
    await dbConnect()
    return NextResponse.json({ status: "Conexión exitosa a MongoDB" })
  } catch (error) {
    console.error("Error de conexión a la base de datos:", error)
    return NextResponse.json({ error: "Fallo en la conexión a la base de datos", details: error }, { status: 500 })
  }
}
