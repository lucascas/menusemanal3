"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { toast } from "@/components/ui/use-toast"
import { Loader2, Plus, Trash2, Copy, Key } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { useIsMobile } from "@/hooks/use-mobile"

interface ApiKey {
  id: string
  name: string
  key: string
  createdAt: string
  lastUsed?: string
}

export default function ApiKeyManager() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newKeyName, setNewKeyName] = useState("")
  const [newKey, setNewKey] = useState<ApiKey | null>(null)
  const isMobile = useIsMobile()

  useEffect(() => {
    fetchApiKeys()
  }, [])

  const fetchApiKeys = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/apikeys")
      if (!response.ok) {
        throw new Error("Error al cargar las claves API")
      }
      const data = await response.json()
      setApiKeys(data)
    } catch (error) {
      console.error("Error:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar las claves API",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const createApiKey = async () => {
    if (!newKeyName.trim()) {
      toast({
        title: "Error",
        description: "El nombre de la clave es requerido",
        variant: "destructive",
      })
      return
    }

    try {
      setIsLoading(true)
      const response = await fetch("/api/apikeys", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: newKeyName }),
      })

      if (!response.ok) {
        throw new Error("Error al crear la clave API")
      }

      const newKey = await response.json()
      setNewKey(newKey)
      await fetchApiKeys()
      setNewKeyName("")
    } catch (error) {
      console.error("Error:", error)
      toast({
        title: "Error",
        description: "No se pudo crear la clave API",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const deleteApiKey = async (keyId: string) => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/apikeys/${keyId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Error al eliminar la clave API")
      }

      await fetchApiKeys()
      toast({
        title: "Éxito",
        description: "Clave API eliminada correctamente",
      })
    } catch (error) {
      console.error("Error:", error)
      toast({
        title: "Error",
        description: "No se pudo eliminar la clave API",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copiado",
      description: "Clave API copiada al portapapeles",
    })
  }

  if (isLoading && apiKeys.length === 0) {
    return (
      <div className="flex justify-center my-4">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-end mb-4">
        <Button onClick={() => setIsDialogOpen(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Nueva Clave API
        </Button>
      </div>

      {apiKeys.length === 0 ? (
        <div className="text-center py-8 border rounded-lg bg-gray-50">
          <Key className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-medium">No tienes claves API</h3>
          <p className="text-gray-500 mt-1">Crea una clave API para integrar con otras aplicaciones</p>
        </div>
      ) : (
        <div className="space-y-4">
          {apiKeys.map((key) => (
            <div
              key={key.id}
              className={`flex ${isMobile ? "flex-col" : "justify-between"} items-start p-4 border rounded-lg bg-white`}
            >
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-medium">{key.name}</h3>
                  {key.lastUsed && (
                    <Badge variant="outline" className="text-xs">
                      Activa
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-gray-500 mt-1 break-all">{key.key}</p>
                <p className="text-xs text-gray-400 mt-1">
                  Creada: {new Date(key.createdAt).toLocaleDateString()}
                  {key.lastUsed && ` • Último uso: ${new Date(key.lastUsed).toLocaleString()}`}
                </p>
              </div>
              <div className={`flex gap-2 ${isMobile ? "mt-3 w-full justify-end" : ""}`}>
                <Button variant="outline" size="sm" onClick={() => copyToClipboard(key.key)}>
                  <Copy className="h-4 w-4" />
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Esta acción eliminará la clave API "{key.name}" y no se puede deshacer. Las aplicaciones que
                        usen esta clave dejarán de funcionar.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction onClick={() => deleteApiKey(key.id)}>Eliminar</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Dialog para crear nueva clave API */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className={isMobile ? "w-[95%] max-w-[95%]" : undefined}>
          <DialogHeader>
            <DialogTitle>Crear Nueva Clave API</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="keyName" className="text-sm font-medium">
                Nombre de la Clave
              </label>
              <Input
                id="keyName"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                placeholder="Ej: Integración con Calendario"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={createApiKey} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creando...
                </>
              ) : (
                "Crear"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog para mostrar la nueva clave creada */}
      {newKey && (
        <Dialog open={!!newKey} onOpenChange={() => setNewKey(null)}>
          <DialogContent className={isMobile ? "w-[95%] max-w-[95%]" : undefined}>
            <DialogHeader>
              <DialogTitle>Clave API Creada</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="bg-yellow-50 p-4 rounded-md border border-yellow-200">
                <p className="text-yellow-800 font-medium mb-2">¡Importante!</p>
                <p className="text-yellow-700 text-sm">
                  Esta es la única vez que verás la clave completa. Cópiala y guárdala en un lugar seguro.
                </p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Nombre</label>
                <p className="p-2 bg-gray-100 rounded">{newKey.name}</p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Clave API</label>
                <div className="flex">
                  <input
                    type="text"
                    readOnly
                    value={newKey.key}
                    className="flex-1 p-2 bg-gray-100 rounded-l border border-r-0 text-sm break-all"
                  />
                  <Button onClick={() => copyToClipboard(newKey.key)} className="rounded-l-none">
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={() => setNewKey(null)}>Cerrar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

