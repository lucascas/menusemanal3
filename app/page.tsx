"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import MainLayout from "./components/MainLayout"
import Planificador from "./components/planificador"
import Catalogo from "./components/catalogo"
import MenuesAnteriores from "./components/menues-anteriores"

export default function Home({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const defaultTab = (searchParams.tab as string) || "planner"

  return <HomeContent defaultTab={defaultTab} />
}

function HomeContent({ defaultTab }: { defaultTab: string }) {
  const searchParams = useSearchParams()
  const [activeTab, setActiveTab] = useState(defaultTab)

  // Sincronizar con los cambios de URL
  useEffect(() => {
    const tab = searchParams.get("tab") || "planner"
    setActiveTab(tab)
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
