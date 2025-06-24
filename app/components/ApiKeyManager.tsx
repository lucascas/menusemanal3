"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trash2, Copy, Plus } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface ApiKey {
  _id: string
  name: string
  key: string
  createdAt: string
  lastUsed?: string
}

export default function ApiKeyManager() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([])
  const [loading, setLoading] = useState(false)
  const [newKeyName, setNewKeyName] = useState("")
  const { toast } = useToast()

  // Mock data para desarrollo
  useEffect(() => {
    setApiKeys([
      {
        _id: "1",
        name: "Clave de Desarrollo",
        key: "pk_test_1234567890abcdef",
        createdAt: new Date().toISOString(),
        lastUsed: new Date().toISOString(),
      },
      {
        _id: "2",
        name: "Clave de Producción",
        key: "pk_live_0987654321fedcba",
        createdAt: new Date().toISOString(),
      },
    ])
  }, [])

  const handleCreateKey = async () => {
    if (!newKeyName.trim()) {
      toast({
        title: "Error",
        description: "Por favor ingresa un nombre para la clave API.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      // Simular creación de clave
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const newKey: ApiKey = {
        _id: Date.now().toString(),
        name: newKeyName,
        key: `pk_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`,
        createdAt: new Date().toISOString(),
      }

      setApiKeys([...apiKeys, newKey])
      setNewKeyName("")

      toast({
        title: "Clave API creada",
        description: "La nueva clave API ha sido creada exitosamente.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo crear la clave API.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteKey = async (keyId: string) => {
    setLoading(true)
    try {
      // Simular eliminación
      await new Promise((resolve) => setTimeout(resolve, 500))

      setApiKeys(apiKeys.filter((key) => key._id !== keyId))

      toast({
        title: "Clave eliminada",
        description: "La clave API ha sido eliminada exitosamente.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar la clave API.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key)
    toast({
      title: "Copiado",
      description: "La clave API ha sido copiada al portapapeles.",
    })
  }

  return (
    <div className="space-y-6">
      {/* Crear nueva clave */}
      <Card>
        <CardHeader>
          <CardTitle>Crear Nueva Clave API</CardTitle>
          <CardDescription>
            Las claves API te permiten acceder a tus datos de comidas desde aplicaciones externas.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="Nombre de la clave (ej: Mi App)"
              value={newKeyName}
              onChange={(e) => setNewKeyName(e.target.value)}
              disabled={loading}
            />
            <Button onClick={handleCreateKey} disabled={loading || !newKeyName.trim()}>
              <Plus className="h-4 w-4 mr-2" />
              {loading ? "Creando..." : "Crear"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Lista de claves existentes */}
      <Card>
        <CardHeader>
          <CardTitle>Claves API Existentes</CardTitle>
          <CardDescription>
            Gestiona tus claves API existentes. Mantén tus claves seguras y no las compartas.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {apiKeys.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No tienes claves API creadas.</p>
          ) : (
            <div className="space-y-4">
              {apiKeys.map((apiKey) => (
                <div key={apiKey._id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-medium">{apiKey.name}</h3>
                      <Badge variant="outline">{apiKey.lastUsed ? "Activa" : "Sin usar"}</Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <code className="bg-gray-100 px-2 py-1 rounded text-xs">{apiKey.key.substring(0, 20)}...</code>
                      <Button variant="ghost" size="sm" onClick={() => handleCopyKey(apiKey.key)}>
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      Creada: {new Date(apiKey.createdAt).toLocaleDateString()}
                      {apiKey.lastUsed && (
                        <span className="ml-2">Último uso: {new Date(apiKey.lastUsed).toLocaleDateString()}</span>
                      )}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteKey(apiKey._id)}
                    disabled={loading}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
