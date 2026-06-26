"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import MainLayout from "./components/MainLayout"
import Planificador from "./components/planificador"
import Catalogo from "./components/catalogo"
import MenuesAnteriores from "./components/menues-anteriores"

export default function Home() {
  return <HomeContent />
}

function HomeContent() {
  // Leemos el tab activo desde la URL con useSearchParams (cliente).
  // Evitamos acceder a la prop `searchParams` directamente, que en Next 15
  // está deprecado y generaba cientos de warnings en consola.
  const searchParams = useSearchParams()
  const [activeTab, setActiveTab] = useState(searchParams.get("tab") || "planner")

  // Sincronizar con los cambios de URL
  useEffect(() => {
    setActiveTab(searchParams.get("tab") || "planner")
  }, [searchParams])

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

  return (
    <MainLayout activeTab={activeTab} setActiveTab={setActiveTab}>
      {renderContent()}
    </MainLayout>
  )
}
