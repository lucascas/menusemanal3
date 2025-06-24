import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../../auth/[...nextauth]/route"
import dbConnect from "@/lib/dbConnect"
import Meal from "@/models/Meal"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.casa?.id) {
      return NextResponse.json({ error: "No autorizado o sin casa asignada" }, { status: 401 })
    }

    await dbConnect()

    const count = await Meal.countDocuments({ casa: session.user.casa.id })
    return NextResponse.json({ count })
  } catch (error) {
    console.error("Error fetching meal count:", error)
    return NextResponse.json({ error: "Error al obtener el conteo de comidas" }, { status: 500 })
  }
}

export const dynamic = "force-dynamic"
