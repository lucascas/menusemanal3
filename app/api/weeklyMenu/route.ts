import { NextResponse } from "next/server"
import dbConnect from "@/lib/dbConnect"
import WeeklyMenu from "@/models/WeeklyMenu"

export async function GET() {
  try {
    await dbConnect()

    const menus = await WeeklyMenu.find({}).limit(20)
    return NextResponse.json(menus)
  } catch (error) {
    console.error("Error fetching weekly menus:", error)

    // Datos mock si falla la BD
    return NextResponse.json([])
  }
}

export async function POST(request: Request) {
  try {
    await dbConnect()
    const menuData = await request.json()

    const menu = await WeeklyMenu.create({
      ...menuData,
      user: "mock-user",
      casa: "mock-casa",
    })
    return NextResponse.json(menu)
  } catch (error) {
    console.error("Error creating weekly menu:", error)

    const menuData = await request.json()
    return NextResponse.json({
      _id: Date.now().toString(),
      ...menuData,
      user: "mock-user",
      casa: "mock-casa",
    })
  }
}

export const dynamic = "force-dynamic"
