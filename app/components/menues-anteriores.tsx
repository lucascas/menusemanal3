"use client"

import { useState, useEffect } from "react"
import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog"
// Cambiar:
// import { useRouter } from "next/navigation"
// Por:
import { useRouter } from "next/router"
import { toast } from "@/components/ui/use-toast"
import { Pencil, Trash2, Loader2, Bug } from "lucide-react"
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
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { useIsMobile } from "@/hooks/use-mobile"

interface MenuSemanal {
  _id: string
  fecha: string
  menu: {
    [key: string]: {
      almuerzo: string
      cena: string
    }
  }
  ingredientes?: string[]
}

export default function MenuesAnteriores() {
  const [menues, setMenues] = useState<MenuSemanal[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [editingMenu, setEditingMenu] = useState<MenuSemanal | null>(null)
  const [debugMode, setDebugMode] = useState(false)
  const router = useRouter()
  const isMobile = useIsMobile()

  useEffect(() => {
    const fetchMenus = async () => {
      try {
        setIsLoading(true)
        const response = await fetch("/api/weeklyMenu")
        if (!response.ok) {
          throw new Error("Error al cargar los menús")
        }
        const data = await response.json()
        console.log("Menús cargados:", JSON.stringify(data, null, 2))
        setMenues(data)
      } catch (error) {
        console.error("Error:", error)
        toast({
          title: "Error",
          description: "No se pudieron cargar los menús anteriores",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchMenus()
  }, [])

  const usarMenuNuevamente = (menu: MenuSemanal) => {
    localStorage.setItem("weeklyMenu", JSON.stringify(menu.menu))
    // Cambiar router.push por window.location
    window.location.href = "/?tab=planner"
    toast({
      title: "Menú cargado",
      description: "El menú ha sido cargado en el planificador",
    })
  }

  const editarMenu = async (menu: MenuSemanal) => {
    setEditingMenu(menu)
  }

  const guardarCambios = async () => {
    if (!editingMenu) return

    try {
      const response = await fetch(`/api/weeklyMenu/${editingMenu._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editingMenu),
      })

      if (!response.ok) {
        throw new Error("Error al actualizar el menú")
      }

      const updatedMenu = await response.json()
      setMenues(menues.map((m) => (m._id === updatedMenu._id ? updatedMenu : m)))
      setEditingMenu(null)
      toast({
        title: "Menú actualizado",
        description: "Los cambios han sido guardados exitosamente",
      })
    } catch (error) {
      console.error("Error al actualizar el menú:", error)
      toast({
        title: "Error",
        description: "No se pudo actualizar el menú",
        variant: "destructive",
      })
    }
  }

  const borrarMenu = async (menuId: string) => {
    try {
      const response = await fetch(`/api/weeklyMenu/${menuId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Error al borrar el menú")
      }

      setMenues(menues.filter((m) => m._id !== menuId))
      toast({
        title: "Menú eliminado",
        description: "El menú ha sido eliminado exitosamente",
      })
    } catch (error) {
      console.error("Error al borrar el menú:", error)
      toast({
        title: "Error",
        description: "No se pudo eliminar el menú",
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return (
      <Card className="w-full shadow-[0_2px_8px_rgba(0,0,0,0.1)]">
        <CardContent className="p-6">
          <div className="flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full shadow-[0_2px_8px_rgba(0,0,0,0.1)]">
      <CardHeader className="flex flex-row items-center justify-between">
        <h2 className="text-2xl font-bold">Menús Anteriores</h2>
        <Button variant="outline" size="sm" onClick={() => setDebugMode(!debugMode)}>
          <Bug className="h-4 w-4 mr-2" />
          {debugMode ? "Ocultar Debug" : "Mostrar Debug"}
        </Button>
      </CardHeader>
      <CardContent>
        {debugMode && (
          <div className="mb-6 p-4 bg-gray-100 rounded-lg">
            <h3 className="font-bold mb-2">Información de depuración:</h3>
            <pre className="text-xs overflow-auto max-h-40">{JSON.stringify(menues, null, 2)}</pre>
          </div>
        )}

        {menues.length === 0 ? (
          <p>No hay menús guardados.</p>
        ) : (
          <div className={`grid grid-cols-1 ${isMobile ? "" : "md:grid-cols-2 lg:grid-cols-3"} gap-4`}>
            {menues.map((menu) => (
              <Card key={menu._id} className="p-4 shadow-[0_2px_8px_rgba(0,0,0,0.1)]">
                <h3 className="font-semibold mb-2">Semana del {new Date(menu.fecha).toLocaleDateString()}</h3>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full mb-2">
                      Ver detalles
                    </Button>
                  </DialogTrigger>
                  <DialogContent className={`${isMobile ? "w-[95%] max-w-[95%]" : "max-w-[400px]"} p-0`}>
                    <div className="grid grid-rows-[auto,1fr,auto] h-full max-h-[80vh]">
                      <div
                        className="relative py-6 px-4 text-center border-b"
                        style={{
                          backgroundImage: `url(https://hebbkx1anhila5yf.public.blob.vercel-storage.com/openart-image_2AaNge0F_1740438376698_raw-PmsHJhjheSfVWiqPCCZBPTPtPlwVPi.png)`,
                          backgroundSize: "cover",
                          backgroundPosition: "center",
                        }}
                      >
                        <div className="absolute inset-0 bg-black/50" />
                        <DialogTitle className="relative z-10 text-white text-xl font-bold">
                          Menú de la semana del {new Date(menu.fecha).toLocaleDateString()}
                        </DialogTitle>
                        <DialogDescription className="sr-only">Detalles del menú semanal</DialogDescription>
                      </div>

                      <div className="flex flex-col gap-3 p-4 overflow-hidden">
                        <div className="overflow-y-auto flex-1 min-h-0">
                          {Object.entries(menu.menu).map(([dia, comidas]) => (
                            <div key={dia} className="mb-6 last:mb-0">
                              <h4 className="font-medium text-lg mb-3">{dia}</h4>
                              <div className="space-y-3">
                                <div className="p-3 bg-muted/50 rounded-lg">
                                  <p className="font-medium">Almuerzo</p>
                                  <p className="text-muted-foreground">{comidas.almuerzo || "No especificado"}</p>
                                </div>
                                <div className="p-3 bg-muted/50 rounded-lg">
                                  <p className="font-medium">Cena</p>
                                  <p className="text-muted-foreground">{comidas.cena || "No especificado"}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                          {menu.ingredientes && menu.ingredientes.length > 0 && (
                            <div className="mt-6 pt-4 border-t">
                              <h4 className="font-medium text-lg mb-3">Ingredientes a comprar</h4>
                              <div className="p-3 bg-muted/50 rounded-lg">
                                <ul className="list-disc pl-5 space-y-1">
                                  {menu.ingredientes.map((ingrediente, index) => (
                                    <li key={index}>{ingrediente}</li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="p-4 border-t">
                        <Button onClick={() => usarMenuNuevamente(menu)} className="w-full">
                          Usar este menú nuevamente
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
                <div className="flex justify-between mt-2">
                  <Button variant="outline" size="sm" onClick={() => editarMenu(menu)}>
                    <Pencil className="w-4 h-4 mr-2" />
                    Editar
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm">
                        <Trash2 className="w-4 h-4 mr-2" />
                        Borrar
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className={isMobile ? "w-[95%] max-w-[95%]" : undefined}>
                      <AlertDialogHeader>
                        <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Esta acción no se puede deshacer. Se eliminará permanentemente este menú semanal.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={() => borrarMenu(menu._id)}>Borrar</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
      {editingMenu && (
        <Dialog open={!!editingMenu} onOpenChange={() => setEditingMenu(null)}>
          <DialogContent className={`${isMobile ? "w-[95%] max-w-[95%]" : "max-w-[400px]"} p-0`}>
            <div className="grid grid-rows-[auto,1fr,auto] h-full max-h-[80vh]">
              <div
                className="relative py-6 px-4 text-center border-b"
                style={{
                  backgroundImage: `url(https://hebbkx1anhila5yf.public.blob.vercel-storage.com/openart-image_2AaNge0F_1740438376698_raw-PmsHJhjheSfVWiqPCCZBPTPtPlwVPi.png)`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              >
                <div className="absolute inset-0 bg-black/50" />
                <DialogTitle className="relative z-10 text-white text-xl font-bold">Editar Menú</DialogTitle>
                <DialogDescription className="sr-only">Editar detalles del menú semanal</DialogDescription>
              </div>

              <div className="flex flex-col gap-3 p-4 overflow-hidden">
                <div className="overflow-y-auto flex-1 min-h-0">
                  {Object.entries(editingMenu.menu).map(([dia, comidas]) => (
                    <div key={dia} className="mb-6 last:mb-0">
                      <h4 className="font-medium text-lg mb-3">{dia}</h4>
                      <div className="space-y-3">
                        <div className="space-y-2">
                          <Label htmlFor={`almuerzo-${dia}`}>Almuerzo</Label>
                          <Input
                            id={`almuerzo-${dia}`}
                            value={comidas.almuerzo}
                            onChange={(e) =>
                              setEditingMenu({
                                ...editingMenu,
                                menu: {
                                  ...editingMenu.menu,
                                  [dia]: { ...comidas, almuerzo: e.target.value },
                                },
                              })
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`cena-${dia}`}>Cena</Label>
                          <Input
                            id={`cena-${dia}`}
                            value={comidas.cena}
                            onChange={(e) =>
                              setEditingMenu({
                                ...editingMenu,
                                menu: {
                                  ...editingMenu.menu,
                                  [dia]: { ...comidas, cena: e.target.value },
                                },
                              })
                            }
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-4 border-t">
                <Button onClick={guardarCambios} className="w-full">
                  Guardar cambios
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </Card>
  )
}
