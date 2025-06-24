"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

export default function AdminRedirect() {
  const router = useRouter()

  useEffect(() => {
    // Redirigir al dashboard después de un breve retraso
    const timer = setTimeout(() => {
      router.push("/administrador/dashboard")
    }, 100)

    return () => clearTimeout(timer)
  }, [router])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <Loader2 className="h-8 w-8 animate-spin mb-4" />
      <p className="text-lg">Redirigiendo al panel de administración...</p>
    </div>
  )
}
