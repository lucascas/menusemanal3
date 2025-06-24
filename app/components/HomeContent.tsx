"use client"

import { useSession } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import Planificador from "./planificador"
import Catalogo from "./catalogo"
import MenuesAnteriores from "./menues-anteriores"
import MainLayout from "./MainLayout"

interface HomeContentProps {
  defaultTab?: string
}

export default function HomeContent({ defaultTab = "planner" }: HomeContentProps) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const searchParams = useSearchParams()
  const wasInvited = searchParams.get("invited") === "true"
  const currentTab = searchParams.get("tab") || defaultTab

  useEffect(() => {
    if (status === "authenticated") {
      if (!session.user.casa && !wasInvited && !localStorage.getItem("onboardingComplete")) {
        router.push("/onboarding")
        return
      }
      setIsLoading(false)
    }
  }, [status, session, router, wasInvited])

  if (status === "loading" || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </div>
    )
  }

  if (!session?.user?.casa && !wasInvited && !localStorage.getItem("onboardingComplete")) {
    return null
  }

  return (
    <MainLayout activeTab={currentTab}>
      {currentTab === "planner" && <Planificador />}
      {currentTab === "catalog" && <Catalogo />}
      {currentTab === "previous" && <MenuesAnteriores />}
    </MainLayout>
  )
}

