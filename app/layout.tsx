import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"
import { MockSessionProvider } from "./components/MockSession"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Planneat - Planificador de Comidas",
  description: "Planifica tus comidas semanales de forma fácil y organizada",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <MockSessionProvider>
          {children}
          <Toaster />
        </MockSessionProvider>
      </body>
    </html>
  )
}
