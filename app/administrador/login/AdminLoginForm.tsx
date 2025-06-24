"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardHeader, CardContent, CardFooter, CardTitle } from "@/components/ui/card"
import { toast } from "@/components/ui/use-toast"
import { Loader2, Lock, AlertTriangle } from "lucide-react"

export default function AdminLoginForm() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!username || !password) {
      setError("Por favor, completa todos los campos")
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch("/api/admin/auth", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
        credentials: "include", // Importante para incluir cookies
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Error al iniciar sesión")
      }

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.message || "Error al iniciar sesión")
      }

      toast({
        title: "Éxito",
        description: "Has iniciado sesión correctamente",
      })

      // Redirección directa usando window.location para una recarga completa
      window.location.href = "/administrador/dashboard"
    } catch (error: any) {
      console.error("Error al iniciar sesión:", error)
      setError(error.message || "Credenciales inválidas o usuario sin permisos de administrador")

      toast({
        title: "Error de autenticación",
        description: error.message || "Credenciales inválidas o usuario sin permisos de administrador",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Función para crear un administrador (solo en desarrollo)
  const handleCreateAdmin = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/admin/setup", {
        method: "GET",
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Administrador creado",
          description: `Usuario: ${data.admin.username}, Contraseña: admin123`,
        })
        setUsername("admin")
        setPassword("admin123")
      } else {
        toast({
          title: "Información",
          description: data.message,
        })
      }
    } catch (error: any) {
      console.error("Error al crear administrador:", error)
      toast({
        title: "Error",
        description: "No se pudo crear el administrador",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Panel de Administración</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center mb-4">
            <div className="p-3 rounded-full bg-primary/10">
              <Lock className="h-6 w-6 text-primary" />
            </div>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="username" className="text-sm font-medium">
                Usuario
              </label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Contraseña
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Iniciando sesión...
                </>
              ) : (
                "Iniciar Sesión"
              )}
            </Button>

            <Button
              type="button"
              variant="outline"
              className="w-full mt-2"
              onClick={handleCreateAdmin}
              disabled={isLoading}
            >
              Crear Admin (Solo Dev)
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-muted-foreground">Acceso restringido solo para administradores</p>
        </CardFooter>
      </Card>
    </div>
  )
}

