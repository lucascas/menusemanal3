"use client"

import type React from "react"

import { useState } from "react"
import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Calendar, Utensils, Book, Settings, LogOut, User, Home, Key, ChevronDown, Menu, X } from "lucide-react"
import { useIsMobile } from "@/hooks/use-mobile"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

interface MainLayoutProps {
  children: React.ReactNode
  activeTab?: string
}

export default function MainLayout({ children, activeTab = "planner" }: MainLayoutProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const isMobile = useIsMobile()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const handleLogout = () => {
    localStorage.removeItem("onboardingComplete")
    signOut()
  }

  const navItems = [
    {
      icon: <Calendar className="h-5 w-5" />,
      label: "Planificador",
      onClick: () => {
        router.push("/?tab=planner")
        setIsSidebarOpen(false)
      },
      active: activeTab === "planner",
    },
    {
      icon: <Utensils className="h-5 w-5" />,
      label: "Catálogo",
      onClick: () => {
        router.push("/?tab=catalog")
        setIsSidebarOpen(false)
      },
      active: activeTab === "catalog",
    },
    {
      icon: <Book className="h-5 w-5" />,
      label: "Menús Anteriores",
      onClick: () => {
        router.push("/?tab=previous")
        setIsSidebarOpen(false)
      },
      active: activeTab === "previous",
    },
    {
      icon: <Settings className="h-5 w-5" />,
      label: "Configuración",
      onClick: () => {
        router.push("/configuracion-casa")
        setIsSidebarOpen(false)
      },
      active: activeTab === "config",
    },
    {
      icon: <Key className="h-5 w-5" />,
      label: "API",
      onClick: () => {
        router.push("/configuracion/api")
        setIsSidebarOpen(false)
      },
      active: activeTab === "api",
    },
  ]

  const renderNavItems = () => (
    <div className="py-2">
      {navItems.map((item, index) => (
        <button
          key={index}
          onClick={item.onClick}
          className={`flex items-center w-full px-4 py-3 text-sm ${
            item.active ? "text-primary border-l-4 border-primary bg-primary/5" : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          <span className="mr-3">{item.icon}</span>
          {item.label}
        </button>
      ))}
    </div>
  )

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Mobile Header */}
      {isMobile && (
        <header className="bg-white border-b px-4 py-3 flex justify-between items-center sticky top-0 z-30">
          <div className="flex items-center">
            <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="mr-2">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[250px] p-0">
                <div className="flex flex-col h-full">
                  <div className="p-4 border-b flex items-center justify-between">
                    <div className="flex items-center">
                      <img
                        src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Frame%2039-ipnECCEA7dyYwJlyF5UCHTZiKGycig.png"
                        alt="Planneat Logo"
                        className="h-8"
                      />
                      <span className="ml-2 font-semibold text-lg">Planneat</span>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(false)}>
                      <X className="h-5 w-5" />
                    </Button>
                  </div>
                  <ScrollArea className="flex-1">
                    {renderNavItems()}
                    <div className="p-4 border-t">
                      <Button
                        variant="outline"
                        className="w-full flex items-center justify-start"
                        onClick={handleLogout}
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        Cerrar sesión
                      </Button>
                    </div>
                  </ScrollArea>
                </div>
              </SheetContent>
            </Sheet>
            <h1 className="text-lg font-semibold">
              {activeTab === "planner" && "Planificador"}
              {activeTab === "catalog" && "Catálogo"}
              {activeTab === "previous" && "Menús"}
              {activeTab === "config" && "Configuración"}
              {activeTab === "api" && "API"}
            </h1>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <User className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Home className="mr-2 h-4 w-4" />
                <span className="truncate max-w-[200px]">Casa: {session?.user?.casa?.nombre}</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Cerrar sesión</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>
      )}

      {/* Desktop Layout */}
      {!isMobile && (
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <div className="flex flex-col w-64 border-r bg-white">
            <div className="p-4 border-b">
              <div className="flex items-center">
                <img
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Frame%2039-ipnECCEA7dyYwJlyF5UCHTZiKGycig.png"
                  alt="Planneat Logo"
                  className="h-8"
                />
                <span className="ml-2 font-semibold text-lg">Planneat</span>
              </div>
            </div>
            <ScrollArea className="flex-1">{renderNavItems()}</ScrollArea>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Header */}
            <header className="bg-white border-b px-6 py-3 flex justify-between items-center">
              <h1 className="text-xl font-semibold">
                {activeTab === "planner" && "Planificador Semanal"}
                {activeTab === "catalog" && "Catálogo de Comidas"}
                {activeTab === "previous" && "Menús Anteriores"}
                {activeTab === "config" && "Configuración"}
                {activeTab === "api" && "API"}
              </h1>
              <div className="flex items-center gap-4">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <span>{session?.user?.name || "Usuario"}</span>
                      <ChevronDown className="h-4 w-4 opacity-50" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <Home className="mr-2 h-4 w-4" />
                      <span>Casa: {session?.user?.casa?.nombre}</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Cerrar sesión</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 p-6 bg-gray-50 overflow-auto">{children}</main>
          </div>
        </div>
      )}

      {/* Mobile Content */}
      {isMobile && <main className="flex-1 p-4 bg-gray-50 overflow-auto pb-16">{children}</main>}
    </div>
  )
}

