"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { toast } from "@/components/ui/use-toast"
import { Loader2, Plus, Pencil, Trash2, Users, Search } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
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

interface Casa {
  _id: string
  nombre: string
  creador: {
    _id: string
    name: string
    email: string
  }
  createdAt: string
  usuariosCount: number
}

interface AdminCasasProps {
  updateStats: () => void
}

export default function AdminCasas({ updateStats }: AdminCasasProps) {
  const [casas, setCasas] = useState<Casa[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [nuevaCasa, setNuevaCasa] = useState({ nombre: "", creadorEmail: "" })
  const [editingCasa, setEditingCasa] = useState<Casa | null>(null)
  const [usuariosCasa, setUsuariosCasa] = useState<any[]>([])
  const [isUsuariosDialogOpen, setIsUsuariosDialogOpen] = useState(false)
  const [selectedCasaId, setSelectedCasaId] = useState<string | null>(null)

  useEffect(() => {
    fetchCasas()
  }, [])

  const fetchCasas = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/admin/casas")
      if (!response.ok) {
        throw new Error("Error al cargar las casas")
      }
      const data = await response.json()
      setCasas(data)

      // Actualizar el contador en el dashboard
      const totalCasasElement = document.getElementById("total-casas")
      if (totalCasasElement) {
        totalCasasElement.textContent = data.length.toString()
      }

      updateStats()
    } catch (error) {
      console.error("Error:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar las casas",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateCasa = async () => {
    if (!nuevaCasa.nombre) {
      toast({
        title: "Error",
        description: "El nombre de la casa es obligatorio",
        variant: "destructive",
      })
      return
    }

    try {
      setIsLoading(true)
      const response = await fetch("/api/admin/casas", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(nuevaCasa),
      })

      if (!response.ok) {
        throw new Error("Error al crear la casa")
      }

      await fetchCasas()
      setIsDialogOpen(false)
      setNuevaCasa({ nombre: "", creadorEmail: "" })
      toast({
        title: "Éxito",
        description: "Casa creada correctamente",
      })
    } catch (error: any) {
      console.error("Error:", error)
      toast({
        title: "Error",
        description: error.message || "No se pudo crear la casa",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateCasa = async () => {
    if (!editingCasa || !editingCasa.nombre) {
      toast({
        title: "Error",
        description: "El nombre de la casa es obligatorio",
        variant: "destructive",
      })
      return
    }

    try {
      setIsLoading(true)
      const response = await fetch(`/api/admin/casas/${editingCasa._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ nombre: editingCasa.nombre }),
      })

      if (!response.ok) {
        throw new Error("Error al actualizar la casa")
      }

      await fetchCasas()
      setIsDialogOpen(false)
      setEditingCasa(null)
      toast({
        title: "Éxito",
        description: "Casa actualizada correctamente",
      })
    } catch (error: any) {
      console.error("Error:", error)
      toast({
        title: "Error",
        description: error.message || "No se pudo actualizar la casa",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteCasa = async (casaId: string) => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/admin/casas/${casaId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Error al eliminar la casa")
      }

      await fetchCasas()
      toast({
        title: "Éxito",
        description: "Casa eliminada correctamente",
      })
    } catch (error: any) {
      console.error("Error:", error)
      toast({
        title: "Error",
        description: error.message || "No se pudo eliminar la casa",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const fetchUsuariosCasa = async (casaId: string) => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/admin/casas/${casaId}/usuarios`)
      if (!response.ok) {
        throw new Error("Error al cargar los usuarios de la casa")
      }
      const data = await response.json()
      setUsuariosCasa(data)
      setSelectedCasaId(casaId)
      setIsUsuariosDialogOpen(true)
    } catch (error) {
      console.error("Error:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los usuarios de la casa",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const filteredCasas = casas.filter(
    (casa) =>
      casa.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (casa.creador?.email && casa.creador.email.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  return (
    <Card className="w-full shadow-[0_2px_8px_rgba(0,0,0,0.1)]">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Gestión de Casas</CardTitle>
        <Button
          onClick={() => {
            setNuevaCasa({ nombre: "", creadorEmail: "" })
            setEditingCasa(null)
            setIsDialogOpen(true)
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          Nueva Casa
        </Button>
      </CardHeader>
      <CardContent>
        <div className="mb-4 relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Buscar por nombre o email del creador..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>

        {isLoading ? (
          <div className="flex justify-center my-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Creador</TableHead>
                  <TableHead>Fecha de Creación</TableHead>
                  <TableHead>Usuarios</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCasas.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-4">
                      No se encontraron casas
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCasas.map((casa) => (
                    <TableRow key={casa._id}>
                      <TableCell className="font-medium">{casa.nombre}</TableCell>
                      <TableCell>{casa.creador?.email || "No disponible"}</TableCell>
                      <TableCell>{new Date(casa.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => fetchUsuariosCasa(casa._id)}
                          className="flex items-center"
                        >
                          <Users className="h-4 w-4 mr-1" />
                          {casa.usuariosCount}
                        </Button>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setEditingCasa(casa)
                              setIsDialogOpen(true)
                            }}
                          >
                            <Pencil className="h-4 w-4" />
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
                                  Esta acción eliminará la casa "{casa.nombre}" y desvinculará a todos sus usuarios.
                                  Esta acción no se puede deshacer.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeleteCasa(casa._id)}>
                                  Eliminar
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>

      {/* Dialog para crear/editar casa */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingCasa ? "Editar Casa" : "Nueva Casa"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="nombre" className="text-sm font-medium">
                Nombre de la Casa
              </label>
              <Input
                id="nombre"
                value={editingCasa ? editingCasa.nombre : nuevaCasa.nombre}
                onChange={(e) => {
                  if (editingCasa) {
                    setEditingCasa({ ...editingCasa, nombre: e.target.value })
                  } else {
                    setNuevaCasa({ ...nuevaCasa, nombre: e.target.value })
                  }
                }}
              />
            </div>
            {!editingCasa && (
              <div className="space-y-2">
                <label htmlFor="creadorEmail" className="text-sm font-medium">
                  Email del Creador (opcional)
                </label>
                <Input
                  id="creadorEmail"
                  type="email"
                  value={nuevaCasa.creadorEmail}
                  onChange={(e) => setNuevaCasa({ ...nuevaCasa, creadorEmail: e.target.value })}
                  placeholder="Si se deja vacío, se creará un usuario automáticamente"
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={editingCasa ? handleUpdateCasa : handleCreateCasa} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {editingCasa ? "Actualizando..." : "Creando..."}
                </>
              ) : editingCasa ? (
                "Actualizar"
              ) : (
                "Crear"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog para ver usuarios de una casa */}
      <Dialog open={isUsuariosDialogOpen} onOpenChange={setIsUsuariosDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Usuarios de la Casa: {casas.find((c) => c._id === selectedCasaId)?.nombre}</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            {usuariosCasa.length === 0 ? (
              <p className="text-center py-4">Esta casa no tiene usuarios</p>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nombre</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Rol</TableHead>
                      <TableHead>Último Acceso</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {usuariosCasa.map((usuario) => (
                      <TableRow key={usuario._id}>
                        <TableCell className="font-medium">{usuario.name || "Sin nombre"}</TableCell>
                        <TableCell>{usuario.email}</TableCell>
                        <TableCell>
                          {usuario.isCreator ? (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                              Propietario
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              Miembro
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          {usuario.lastLogin ? new Date(usuario.lastLogin).toLocaleString() : "Nunca"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button onClick={() => setIsUsuariosDialogOpen(false)}>Cerrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}

