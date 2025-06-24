"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "@/components/ui/use-toast"
import { Loader2, LogOut, Home, Users, RefreshCw } from "lucide-react"
import AdminCasas from "../components/AdminCasas"
import AdminUsuarios from "../components/AdminUsuarios"

export default function AdminDashboard() {
  const [isLoading, setIsLoading] = useState(true)
  const [admin, setAdmin] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const fetchStats = async () => {
    try {
      setError(null)

      // Cargar estadísticas de casas
      const casasResponse = await fetch("/api/admin/casas", {
        credentials: "include", // Importante para incluir cookies
      })

      if (!casasResponse.ok) {
        if (casasResponse.status === 401) {
          throw new Error("No autorizado. Por favor, inicie sesión nuevamente.")
        }
        throw new Error("Error al cargar las casas")
      }

      const casasData = await casasResponse.json()
      const totalCasasElement = document.getElementById("total-casas")
      if (totalCasasElement) {
        totalCasasElement.textContent = casasData.length.toString()
      }

      // Cargar estadísticas de usuarios
      const usuariosResponse = await fetch("/api/admin/usuarios", {
        credentials: "include",
      })

      if (!usuariosResponse.ok) {
        if (usuariosResponse.status === 401) {
          throw new Error("No autorizado. Por favor, inicie sesión nuevamente.")
        }
        throw new Error("Error al cargar los usuarios")
      }

      const usuariosData = await usuariosResponse.json()
      const totalUsuariosElement = document.getElementById("total-usuarios")
      if (totalUsuariosElement) {
        totalUsuariosElement.textContent = usuariosData.length.toString()
      }

      // Cargar estadísticas de comidas
      const comidasResponse = await fetch("/api/admin/comidas/count", {
        credentials: "include",
      })

      if (!comidasResponse.ok) {
        if (comidasResponse.status === 401) {
          throw new Error("No autorizado. Por favor, inicie sesión nuevamente.")
        }
        throw new Error("Error al cargar el conteo de comidas")
      }

      const comidasData = await comidasResponse.json()
      const totalComidasElement = document.getElementById("total-comidas")
      if (totalComidasElement) {
        totalComidasElement.textContent = comidasData.count.toString()
      }
    } catch (error: any) {
      console.error("Error al cargar estadísticas:", error)
      setError(error.message || "Error al cargar los datos")

      if (error.message.includes("No autorizado")) {
        toast({
          title: "Sesión expirada",
          description: "Su sesión ha expirado. Por favor, inicie sesión nuevamente.",
          variant: "destructive",
        })
        setTimeout(() => {
          router.push("/administrador/login")
        }, 2000)
      }
    }
  }

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/admin/auth", {
          credentials: "include", // Importante para incluir cookies
        })
        const data = await response.json()

        if (!data.isAuthenticated) {
          router.push("/administrador/login")
          return
        }

        setAdmin(data.admin)
        // Cargar estadísticas después de verificar la autenticación
        await fetchStats()
      } catch (error) {
        console.error("Error al verificar autenticación:", error)
        router.push("/administrador/login")
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [router])

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/auth", {
        method: "DELETE",
        credentials: "include", // Importante para incluir cookies
      })
      router.push("/administrador/login")
    } catch (error) {
      console.error("Error al cerrar sesión:", error)
      toast({
        title: "Error",
        description: "No se pudo cerrar la sesión",
        variant: "destructive",
      })
    }
  }

  const handleRefresh = () => {
    fetchStats()
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold">Panel de Administración</h1>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualizar
          </Button>
          <div className="text-sm font-medium">
            Usuario: <span className="font-bold">{admin?.username}</span>
          </div>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Cerrar sesión
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p className="font-bold">Error</p>
          <p>{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total de Casas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" id="total-casas">
              Cargando...
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total de Usuarios</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" id="total-usuarios">
              Cargando...
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total de Comidas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" id="total-comidas">
              Cargando...
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="casas" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="casas" className="flex items-center gap-2">
            <Home className="h-4 w-4" />
            <span>Casas</span>
          </TabsTrigger>
          <TabsTrigger value="usuarios" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span>Usuarios</span>
          </TabsTrigger>
        </TabsList>
        <TabsContent value="casas">
          <AdminCasas updateStats={fetchStats} />
        </TabsContent>
        <TabsContent value="usuarios">
          <AdminUsuarios updateStats={fetchStats} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
