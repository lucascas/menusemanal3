"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { CalendarDays, BookOpen, History, Settings, Menu, X } from "lucide-react"
import Link from "next/link"

interface MainLayoutProps {
  children: React.ReactNode
  activeTab: string
  setActiveTab?: (tab: string) => void
}

export default function MainLayout({ children, activeTab, setActiveTab }: MainLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const navigation = [
    { name: "Planificador", href: "/?tab=planner", icon: CalendarDays, current: activeTab === "planner" },
    { name: "Catálogo", href: "/?tab=catalog", icon: BookOpen, current: activeTab === "catalog" },
    { name: "Menús Anteriores", href: "/?tab=previous", icon: History, current: activeTab === "previous" },
  ]

  const handleNavClick = (tab: string, href: string) => {
    if (setActiveTab) {
      setActiveTab(tab)
    }
    // También actualizar la URL
    window.history.pushState({}, "", href)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? "block" : "hidden"}`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 flex w-64 flex-col bg-white">
          <div className="flex h-16 items-center justify-between px-4">
            <h1 className="text-xl font-bold text-gray-900">Planneat</h1>
            <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(false)}>
              <X className="h-6 w-6" />
            </Button>
          </div>
          <nav className="flex-1 space-y-1 px-2 py-4">
            {navigation.map((item) => (
              <button
                key={item.name}
                onClick={() => {
                  handleNavClick(
                    item.href.includes("planner") ? "planner" : item.href.includes("catalog") ? "catalog" : "previous",
                    item.href,
                  )
                  setSidebarOpen(false)
                }}
                className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md w-full text-left ${
                  item.current ? "bg-gray-100 text-gray-900" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <item.icon className="mr-3 h-6 w-6" />
                {item.name}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow bg-white border-r border-gray-200">
          <div className="flex h-16 items-center px-4">
            <h1 className="text-xl font-bold text-gray-900">Planneat</h1>
          </div>
          <nav className="flex-1 space-y-1 px-2 py-4">
            {navigation.map((item) => (
              <button
                key={item.name}
                onClick={() =>
                  handleNavClick(
                    item.href.includes("planner") ? "planner" : item.href.includes("catalog") ? "catalog" : "previous",
                    item.href,
                  )
                }
                className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md w-full text-left ${
                  item.current ? "bg-gray-100 text-gray-900" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <item.icon className="mr-3 h-6 w-6" />
                {item.name}
              </button>
            ))}
          </nav>
          <div className="flex-shrink-0 p-4">
            <Link href="/configuracion-casa">
              <Button variant="outline" className="w-full">
                <Settings className="mr-2 h-4 w-4" />
                Configuración
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        <div className="flex h-16 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm lg:px-6">
          <Button variant="ghost" size="sm" className="lg:hidden" onClick={() => setSidebarOpen(true)}>
            <Menu className="h-6 w-6" />
          </Button>
          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <div className="flex flex-1 items-center">
              <h2 className="text-lg font-semibold text-gray-900">
                {navigation.find((item) => item.current)?.name || "Planneat"}
              </h2>
            </div>
          </div>
        </div>

        <main className="py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">{children}</div>
        </main>
      </div>
    </div>
  )
}
