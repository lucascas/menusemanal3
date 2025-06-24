"use client"

import { useAuth } from "@/hooks/useAuth"
import HomeContent from "./components/HomeContent"

export default function Home() {
  const { user, isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div>Cargando...</div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div>No autenticado</div>
      </div>
    )
  }

  return <HomeContent />
}
