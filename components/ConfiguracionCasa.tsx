"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/hooks/useAuth"

export default function ConfiguracionCasa() {
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [casaData, setCasaData] = useState({
    nombre: "",
    descripcion: "",
  })
  const [usuarios, setUsuarios] = useState([])
  const [inviteEmail, setInviteEmail] = useState("")

  useEffect(() => {
    if (user?.casa) {
      setCasaData({
        nombre: user.casa.nombre || "",
        descripcion: "Casa de prueba - datos mock",
      })
      // Mock usuarios
      setUsuarios([
        {
          _id: "1",
          email: "usuario1@ejemplo.com",
          name: "Usuario 1",
        },
        {
          _id: "2",
          email: "usuario2@ejemplo.com",
          name: "Usuario 2",
        },
      ])
    }
  }, [user])

  const handleSaveCasa = async () => {
    setLoading(true)
    try {
      // Simular guardado
      await new Promise((resolve) => setTimeout(resolve, 1000))
      toast({
        title: "Casa actualizada",
        description: "Los datos de la casa se han guardado correctamente (mock).",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo actualizar la casa.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleInviteUser = async () => {
    if (!inviteEmail) return

    setLoading(true)
    try {
      // Simular invitación
      await new Promise((resolve) => setTimeout(resolve, 1000))
      toast({
        title: "Invitación enviada",
        description: `Se ha enviado una invitación a ${inviteEmail} (mock).`,
      })
      setInviteEmail("")
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo enviar la invitación.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Configuración de Casa</h1>
        <Button variant="outline" onClick={() => router.back()}>
          Volver
        </Button>
      </div>

      <div className="grid gap-6">
        {/* Información de la Casa */}
        <Card>
          <CardHeader>
            <CardTitle>Información de la Casa</CardTitle>
            <CardDescription>Configura los datos básicos de tu casa</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre de la Casa</Label>
              <Input
                id="nombre"
                value={casaData.nombre}
                onChange={(e) => setCasaData({ ...casaData, nombre: e.target.value })}
                placeholder="Ej: Casa de la Familia García"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="descripcion">Descripción</Label>
              <Input
                id="descripcion"
                value={casaData.descripcion}
                onChange={(e) => setCasaData({ ...casaData, descripcion: e.target.value })}
                placeholder="Descripción opcional de la casa"
              />
            </div>
            <Button onClick={handleSaveCasa} disabled={loading}>
              {loading ? "Guardando..." : "Guardar Cambios"}
            </Button>
          </CardContent>
        </Card>

        {/* Usuarios de la Casa */}
        <Card>
          <CardHeader>
            <CardTitle>Usuarios de la Casa</CardTitle>
            <CardDescription>Gestiona los miembros de tu casa</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {usuarios.map((usuario) => (
                <div key={usuario._id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{usuario.name || usuario.email}</p>
                    <p className="text-sm text-gray-500">{usuario.email}</p>
                  </div>
                </div>
              ))}
            </div>

            <Separator className="my-6" />

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Invitar Usuario</h3>
              <div className="flex gap-2">
                <Input
                  type="email"
                  placeholder="email@ejemplo.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                />
                <Button onClick={handleInviteUser} disabled={loading || !inviteEmail}>
                  {loading ? "Enviando..." : "Invitar"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
