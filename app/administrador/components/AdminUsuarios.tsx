"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { toast } from "@/components/ui/use-toast"
import { Loader2, Plus, Pencil, Trash2, Home, Search, AlertTriangle } from "lucide-react"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Usuario {
  _id: string
  name: string
  email: string
  casa: {
    _id: string
    nombre: string
  } | null
  createdAt: string
  lastLogin: string
}

interface Casa {
  _id: string
  nombre: string
}

interface AdminUsuariosProps {
  updateStats: () => void
}

export default function AdminUsuarios({ updateStats }: AdminUsuariosProps) {
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [casas, setCasas] = useState<Casa[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [nuevoUsuario, setNuevoUsuario] = useState({
    name: "",
    email: "",
    password: "",
    casaId: "",
  })
  const [editingUsuario, setEditingUsuario] = useState<Usuario | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)

  useEffect(() => {
    fetchUsuarios()
    fetchCasas()
  }, [retryCount])

  const fetchUsuarios = async () => {
    try {
      setError(null)
      setIsLoading(true)
      const response = await fetch("/api/admin/usuarios", {
        credentials: "include", // Importante para incluir cookies
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Error desconocido" }))
        throw new Error(errorData.error || `Error al cargar los usuarios (${response.status})`)
      }

      const data = await response.json()
      setUsuarios(data)

      // Actualizar el contador en el dashboard
      const totalUsuariosElement = document.getElementById("total-usuarios")
      if (totalUsuariosElement) {
        totalUsuariosElement.textContent = data.length.toString()
      }

      updateStats()
    } catch (error: any) {
      console.error("Error al cargar los usuarios:", error)
      setError(error.message || "Error al cargar los usuarios")

      // No mostrar toast para evitar spam
      if (retryCount === 0) {
        toast({
          title: "Error",
          description: "No se pudieron cargar los usuarios. Intentando nuevamente...",
          variant: "destructive",
        })
      }
    } finally {
      setIsLoading(false)
    }
  }

  const fetchCasas = async () => {
    try {
      const response = await fetch("/api/admin/casas", {
        credentials: "include",
      })

      if (!response.ok) {
        throw new Error("Error al cargar las casas")
      }

      const data = await response.json()
      setCasas(data)
    } catch (error) {
      console.error("Error al cargar las casas:", error)
      // No mostrar toast para evitar spam
    }
  }

  const handleCreateUsuario = async () => {
    if (!nuevoUsuario.email || !nuevoUsuario.password) {
      toast({
        title: "Error",
        description: "El email y la contraseña son obligatorios",
        variant: "destructive",
      })
      return
    }

    try {
      setIsLoading(true)
      const response = await fetch("/api/admin/usuarios", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(nuevoUsuario),
        credentials: "include",
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Error desconocido" }))
        throw new Error(errorData.error || "Error al crear el usuario")
      }

      await fetchUsuarios()
      setIsDialogOpen(false)
      setNuevoUsuario({
        name: "",
        email: "",
        password: "",
        casaId: "",
      })
      toast({
        title: "Éxito",
        description: "Usuario creado correctamente",
      })
    } catch (error: any) {
      console.error("Error:", error)
      toast({
        title: "Error",
        description: error.message || "No se pudo crear el usuario",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateUsuario = async () => {
    if (!editingUsuario || !editingUsuario.email) {
      toast({
        title: "Error",
        description: "El email es obligatorio",
        variant: "destructive",
      })
      return
    }

    try {
      setIsLoading(true)
      const response = await fetch(`/api/admin/usuarios/${editingUsuario._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: editingUsuario.name,
          casaId: editingUsuario.casa?._id || null,
        }),
        credentials: "include",
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Error desconocido" }))
        throw new Error(errorData.error || "Error al actualizar el usuario")
      }

      await fetchUsuarios()
      setIsDialogOpen(false)
      setEditingUsuario(null)
      toast({
        title: "Éxito",
        description: "Usuario actualizado correctamente",
      })
    } catch (error: any) {
      console.error("Error:", error)
      toast({
        title: "Error",
        description: error.message || "No se pudo actualizar el usuario",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteUsuario = async (usuarioId: string) => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/admin/usuarios/${usuarioId}`, {
        method: "DELETE",
        credentials: "include",
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Error desconocido" }))
        throw new Error(errorData.error || "Error al eliminar el usuario")
      }

      await fetchUsuarios()
      toast({
        title: "Éxito",
        description: "Usuario eliminado correctamente",
      })
    } catch (error: any) {
      console.error("Error:", error)
      toast({
        title: "Error",
        description: error.message || "No se pudo eliminar el usuario",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleRetry = () => {
    setRetryCount((prev) => prev + 1)
  }

  const filteredUsuarios = usuarios.filter(
    (usuario) =>
      usuario.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      usuario.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      usuario.casa?.nombre.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <Card className="w-full shadow-[0_2px_8px_rgba(0,0,0,0.1)]">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Gestión de Usuarios</CardTitle>
        <Button
          onClick={() => {
            setNuevoUsuario({
              name: "",
              email: "",
              password: "",
              casaId: "",
            })
            setEditingUsuario(null)
            setIsDialogOpen(true)
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Usuario
        </Button>
      </CardHeader>
      <CardContent>
        <div className="mb-4 relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Buscar por nombre, email o casa..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 flex justify-between items-center">
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2" />
              <span>{error}</span>
            </div>
            <Button variant="outline" size="sm" onClick={handleRetry}>
              Reintentar
            </Button>
          </div>
        )}

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
                  <TableHead>Email</TableHead>
                  <TableHead>Casa</TableHead>
                  <TableHead>Fecha de Registro</TableHead>
                  <TableHead>Último Acceso</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsuarios.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-4">
                      No se encontraron usuarios
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsuarios.map((usuario) => (
                    <TableRow key={usuario._id}>
                      <TableCell className="font-medium">{usuario.name || "Sin nombre"}</TableCell>
                      <TableCell>{usuario.email}</TableCell>
                      <TableCell>
                        {usuario.casa ? (
                          <div className="flex items-center">
                            <Home className="h-4 w-4 mr-1 text-primary" />
                            {usuario.casa.nombre}
                          </div>
                        ) : (
                          <span className="text-gray-500">Sin casa</span>
                        )}
                      </TableCell>
                      <TableCell>{new Date(usuario.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                        {usuario.lastLogin ? new Date(usuario.lastLogin).toLocaleString() : "Nunca"}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setEditingUsuario(usuario)
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
                                  Esta acción eliminará al usuario "{usuario.email}". Esta acción no se puede deshacer.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeleteUsuario(usuario._id)}>
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

      {/* Dialog para crear/editar usuario */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingUsuario ? "Editar Usuario" : "Nuevo Usuario"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">
                Nombre (opcional)
              </label>
              <Input
                id="name"
                value={editingUsuario ? editingUsuario.name : nuevoUsuario.name}
                onChange={(e) => {
                  if (editingUsuario) {
                    setEditingUsuario({ ...editingUsuario, name: e.target.value })
                  } else {
                    setNuevoUsuario({ ...nuevoUsuario, name: e.target.value })
                  }
                }}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <Input
                id="email"
                type="email"
                value={editingUsuario ? editingUsuario.email : nuevoUsuario.email}
                onChange={(e) => {
                  if (!editingUsuario) {
                    setNuevoUsuario({ ...nuevoUsuario, email: e.target.value })
                  }
                }}
                disabled={!!editingUsuario}
              />
            </div>
            {!editingUsuario && (
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium">
                  Contraseña
                </label>
                <Input
                  id="password"
                  type="password"
                  value={nuevoUsuario.password}
                  onChange={(e) => setNuevoUsuario({ ...nuevoUsuario, password: e.target.value })}
                />
              </div>
            )}
            <div className="space-y-2">
              <label htmlFor="casa" className="text-sm font-medium">
                Casa (opcional)
              </label>
              <Select
                value={editingUsuario ? editingUsuario.casa?._id : nuevoUsuario.casaId}
                onValueChange={(value) => {
                  if (editingUsuario) {
                    const selectedCasa = casas.find((c) => c._id === value)
                    setEditingUsuario({
                      ...editingUsuario,
                      casa: value ? { _id: value, nombre: selectedCasa?.nombre || "" } : null,
                    })
                  } else {
                    setNuevoUsuario({ ...nuevoUsuario, casaId: value })
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar casa" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sin casa</SelectItem>
                  {casas.map((casa) => (
                    <SelectItem key={casa._id} value={casa._id}>
                      {casa.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={editingUsuario ? handleUpdateUsuario : handleCreateUsuario} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {editingUsuario ? "Actualizando..." : "Creando..."}
                </>
              ) : editingUsuario ? (
                "Actualizar"
              ) : (
                "Crear"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}

