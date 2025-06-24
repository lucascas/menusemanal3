"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "@/components/ui/use-toast"
import { ArrowLeft } from "lucide-react"

export default function ConfiguracionCasa() {
  const [houseName, setHouseName] = useState("Casa de Prueba")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSave = async () => {
    setIsLoading(true)
    // Simular guardado
    setTimeout(() => {
      toast({
        title: "Configuración guardada",
        description: "Los cambios se han guardado correctamente.",
      })
      setIsLoading(false)
    }, 1000)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Button variant="ghost" onClick={() => router.back()} className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">Configuración de Casa</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Información de la Casa</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label htmlFor="houseName" className="block text-sm font-medium text-gray-700 mb-2">
                Nombre de la casa
              </label>
              <Input
                id="houseName"
                type="text"
                value={houseName}
                onChange={(e) => setHouseName(e.target.value)}
                placeholder="Ingresa el nombre de tu casa"
              />
            </div>

            <div className="flex justify-end">
              <Button onClick={handleSave} disabled={isLoading}>
                {isLoading ? "Guardando..." : "Guardar cambios"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
