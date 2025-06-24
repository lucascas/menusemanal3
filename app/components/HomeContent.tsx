"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import MainLayout from "./MainLayout"
import Planificador from "./planificador"
import Catalogo from "./catalogo"
import MenuesAnteriores from "./menues-anteriores"
import { useAuth } from "@/hooks/useAuth"

interface HomeContentProps {
  defaultTab?: string
}

export default function HomeContent({ defaultTab }: HomeContentProps) {
  const { user, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [activeTab, setActiveTab] = useState(defaultTab || "planner")

  useEffect(() => {
    const tab = searchParams.get("tab")
    if (tab) {
      setActiveTab(tab)
    }
  }, [searchParams])

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
        <div>Acceso libre - Usuario mock</div>
      </div>
    )
  }

  const renderContent = () => {
    switch (activeTab) {
      case "planner":
        return <Planificador />
      case "catalog":
        return <Catalogo />
      case "previous":
        return <MenuesAnteriores />
      default:
        return <Planificador />
    }
  }

  return <MainLayout activeTab={activeTab}>{renderContent()}</MainLayout>
}
