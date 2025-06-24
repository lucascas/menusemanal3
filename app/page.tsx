"use client"

import { useState } from "react"
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
  const [activeTab, setActiveTab] = useState(defaultTab)

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
