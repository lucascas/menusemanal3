import { NextResponse } from "next/server"
import { getTestEmails, clearTestEmails } from "@/lib/testEmails"

export async function GET() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not available in production" }, { status: 403 })
  }

  const emails = getTestEmails()
  return NextResponse.json(emails)
}

export async function DELETE() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not available in production" }, { status: 403 })
  }

  clearTestEmails()
  return NextResponse.json({ message: "Test emails cleared" })
}

