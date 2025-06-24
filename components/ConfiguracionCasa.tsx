"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast"
import { ChevronRight, Pencil, Trash2, Check, X, Crown, ChevronDown, Plus, Loader2, UserPlus } from "lucide-react"
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
import { Collapsible, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Badge } from "@/components/ui/badge"
import { useIsMobile } from "@/hooks/use-mobile"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface Usuario {
  id: string
  name: string
  email: string
  isCurrentUser: boolean
  isCreator: boolean
}

export default function ConfiguracionCasa() {
  const { data: session, update } = useSession()
  const router = useRouter()
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [nuevoUsuario, setNuevoUsuario] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(true)
  const [editingCasaNombre, setEditingCasaNombre] = useState(false)
  const [casaNombre, setCasaNombre] = useState(session?.user?.casa?.nombre || "")
  const [mealCount, setMealCount] = useState(0)
  const [isGeneralOpen, setIsGeneralOpen] = useState(true)
  const [isUsersOpen, setIsUsersOpen] = useState(true)
  const [isInviteOpen, setIsInviteOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("general")
  const isMobile = useIsMobile()

  // Datos de ejemplo
  const casaInfo = {
    nombre: "El Búnker",
  }

  const usuariosEjemplo = [
    {
      id: 1,
      nombre: "Lucas Castillo",
      email: "lucas.castillo@invera.com.ar",
      esAdmin: false,
      esTu: false,
    },
    {
      id: 2,
      nombre: "Lucas Castillo",
      email: "lucas.castillo@gmail.com",
      esAdmin: true,
      esTu: true,
    },
    {
      id: 3,
      nombre: "Lucas Castilo",
      email: "lucasdeep1985@gmail.com",
      esAdmin: false,
      esTu: false,
    },
  ]

  useEffect(() => {
    const fetchUsuarios = async () => {
      try {
        setIsFetching(true)
        // const response = await fetch("/api/casa/usuarios")
        // if (!response.ok) {
        //   throw new Error("Error al cargar los usuarios")
        // }
        // const data = await response.json()
        // setUsuarios(data)
        setUsuarios(usuariosEjemplo)
      } catch (error) {
        console.error("Error al cargar los usuarios:", error)
        toast({
          title: "Error",
          description: "No se pudieron cargar los usuarios de la casa.",
          variant: "destructive",
        })
      } finally {
        setIsFetching(false)
      }
    }

    // Fetch meal count
    const fetchMealCount = async () => {
      try {
        const response = await fetch("/api/meals/count")
        if (response.ok) {
          const data = await response.json()
          setMealCount(data.count)
        }
      } catch (error) {
        console.error("Error fetching meal count:", error)
      }
    }

    fetchUsuarios()
    fetchMealCount()
  }, [])

  const agregarUsuario = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!nuevoUsuario.trim()) {
      toast({
        title: "Error",
        description: "Por favor, ingresa un email válido.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch("/api/casa/invitar", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: nuevoUsuario }),
      })

      if (!response.ok) {
        throw new Error("Error al invitar al usuario")
      }

      setNuevoUsuario("")
      toast({
        title: "Usuario invitado",
        description: "Se ha enviado una invitación al nuevo usuario.",
      })

      // Recargar la lista de usuarios
      const usuariosResponse = await fetch("/api/casa/usuarios")
      const usuariosData = await usuariosResponse.json()
      setUsuarios(usuariosData)
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo invitar al usuario. Inténtalo de nuevo.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const eliminarUsuario = async (userId: string) => {
    try {
      const response = await fetch(`/api/casa/usuarios/${userId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Error al eliminar el usuario")
      }

      setUsuarios(usuarios.filter((user) => user.id !== userId))
      toast({
        title: "Usuario eliminado",
        description: "El usuario ha sido eliminado de la casa.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar al usuario. Inténtalo de nuevo.",
        variant: "destructive",
      })
    }
  }

  const actualizarNombreCasa = async () => {
    try {
      const response = await fetch("/api/casa", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ nombre: casaNombre }),
      })

      if (!response.ok) {
        throw new Error("Error al actualizar el nombre de la casa")
      }

      // Update session
      await update({
        ...session,
        user: {
          ...session?.user,
          casa: {
            ...session?.user?.casa,
            nombre: casaNombre,
          },
        },
      })

      setEditingCasaNombre(false)
      toast({
        title: "Éxito",
        description: "El nombre de la casa ha sido actualizado.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo actualizar el nombre de la casa.",
        variant: "destructive",
      })
    }
  }

  const asignarPropietario = async (userId: string) => {
    try {
      const response = await fetch(`/api/casa/propietario`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId }),
      })

      if (!response.ok) {
        throw new Error("Error al asignar el propietario")
      }

      // Actualizar la lista de usuarios
      const usuariosResponse = await fetch("/api/casa/usuarios")
      const usuariosData = await usuariosResponse.json()
      setUsuarios(usuariosData)

      toast({
        title: "Propietario asignado",
        description: "Se ha cambiado el propietario de la casa.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo asignar el propietario. Inténtalo de nuevo.",
        variant: "destructive",
      })
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("onboardingComplete")
    router.push("/login")
  }

  if (isFetching) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  // Mobile view
  if (isMobile) {
    return (
      <div className="w-full">
        <h1 className="text-2xl font-bold mb-6">Configuración de Casa</h1>

        <Tabs defaultValue="general" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="usuarios">Usuarios</TabsTrigger>
            <TabsTrigger value="invitaciones">Invitaciones</TabsTrigger>
          </TabsList>

          <TabsContent value="general">
            <Card>
              <CardHeader>
                <CardTitle>Información General</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="nombre-casa" className="text-sm font-medium block mb-1">
                      Nombre de la Casa
                    </label>
                    <div className="flex items-center gap-2">
                      <Input id="nombre-casa" defaultValue={casaInfo.nombre} className="max-w-md" />
                      <Button size="icon" variant="ghost">
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="usuarios">
            <Card>
              <CardHeader>
                <CardTitle>Usuarios de la Casa</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {usuarios.map((usuario) => (
                    <div
                      key={usuario.id}
                      className="p-4 border rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-3"
                    >
                      <div>
                        <div className="font-medium">{usuario.name}</div>
                        <div className="text-sm text-muted-foreground">{usuario.email}</div>
                      </div>
                      <div className="flex items-center gap-2 self-end md:self-auto">
                        {usuario.isCreator && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                            <Crown className="h-3 w-3 mr-1" /> Propietario
                          </span>
                        )}
                        {usuario.isCurrentUser && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            Tú
                          </span>
                        )}
                        {!usuario.isCurrentUser && (
                          <Button
                            size="icon"
                            variant="ghost"
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                        {!usuario.isCreator && !usuario.isCurrentUser && (
                          <Button
                            size="icon"
                            variant="ghost"
                            className="text-amber-500 hover:text-amber-700 hover:bg-amber-50"
                          >
                            <Crown className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="invitaciones">
            <Card>
              <CardHeader>
                <CardTitle>Invitar Usuarios</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="email-invitacion" className="text-sm font-medium block mb-1">
                      Email del usuario a invitar
                    </label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="email-invitacion"
                        placeholder="usuario@ejemplo.com"
                        type="email"
                        className="max-w-md"
                      />
                      <Button>
                        <UserPlus className="h-4 w-4 mr-2" />
                        Invitar
                      </Button>
                    </div>
                  </div>

                  <div className="mt-6">
                    <h3 className="text-lg font-medium mb-2">Invitaciones Pendientes</h3>
                    <div className="text-sm text-muted-foreground">No hay invitaciones pendientes</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    )
  }

  // Desktop view
  return (
    <div className="max-w-5xl mx-auto">
      <div className="grid grid-cols-3 gap-6">
        {/* Left Column - Categories */}
        <div className="col-span-1">
          <div className="bg-white rounded-md shadow-sm">
            <div className="p-4 border-b">
              <h2 className="text-lg font-medium">Configuración de Casa</h2>
            </div>
            <div className="p-2">
              <Collapsible open={isGeneralOpen} onOpenChange={setIsGeneralOpen}>
                <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-gray-50 rounded">
                  <div className="flex items-center">
                    <span className="font-medium">General</span>
                  </div>
                  <Badge variant="outline" className="ml-auto mr-2">
                    1
                  </Badge>
                  {isGeneralOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </CollapsibleTrigger>
              </Collapsible>

              <Collapsible open={isUsersOpen} onOpenChange={setIsUsersOpen}>
                <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-gray-50 rounded">
                  <div className="flex items-center">
                    <span className="font-medium">Usuarios</span>
                  </div>
                  <Badge variant="outline" className="ml-auto mr-2">
                    {usuarios.length}
                  </Badge>
                  {isUsersOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </CollapsibleTrigger>
              </Collapsible>

              <Collapsible open={isInviteOpen} onOpenChange={setIsInviteOpen}>
                <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-gray-50 rounded">
                  <div className="flex items-center">
                    <span className="font-medium">Invitaciones</span>
                  </div>
                  <Badge variant="outline" className="ml-auto mr-2">
                    1
                  </Badge>
                  {isInviteOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </CollapsibleTrigger>
              </Collapsible>
            </div>
          </div>
        </div>

        {/* Right Column - Content */}
        <div className="col-span-2">
          {isGeneralOpen && (
            <Card className="mb-6">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium">Información General</h3>
                  <Badge variant="outline">General</Badge>
                </div>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="houseName" className="text-sm font-medium text-gray-700">
                      Nombre de la Casa
                    </Label>
                    {editingCasaNombre ? (
                      <div className="flex mt-1 gap-2">
                        <Input
                          id="houseName"
                          value={casaNombre}
                          onChange={(e) => setCasaNombre(e.target.value)}
                          className="flex-grow"
                        />
                        <Button
                          onClick={actualizarNombreCasa}
                          size="sm"
                          variant="outline"
                          className="bg-green-50 hover:bg-green-100 text-green-600"
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          onClick={() => {
                            setCasaNombre(session?.user?.casa?.nombre || "")
                            setEditingCasaNombre(false)
                          }}
                          size="sm"
                          variant="outline"
                          className="bg-red-50 hover:bg-red-100 text-red-600"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center mt-1">
                        <span className="text-lg">{casaNombre}</span>
                        <Button onClick={() => setEditingCasaNombre(true)} size="sm" variant="ghost" className="ml-2">
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {isUsersOpen && (
            <Card className="mb-6">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium">Usuarios de la Casa</h3>
                  <Badge variant="outline">Usuarios</Badge>
                </div>
                <div className="space-y-4">
                  {usuarios.length === 0 ? (
                    <p className="text-gray-500">No hay usuarios en la casa.</p>
                  ) : (
                    <div className="space-y-3">
                      {usuarios.map((usuario) => (
                        <div
                          key={usuario.id}
                          className="flex justify-between items-center p-3 rounded-lg border bg-white"
                        >
                          <div className="flex flex-col">
                            <span className="font-medium">{usuario.name}</span>
                            <span className="text-sm text-gray-500">{usuario.email}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            {usuario.isCreator && (
                              <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">
                                <Crown className="h-3 w-3 mr-1" />
                                Propietario
                              </Badge>
                            )}
                            {usuario.isCurrentUser && <Badge variant="outline">Tú</Badge>}
                            {!usuario.isCurrentUser && (
                              <div className="flex gap-2">
                                {!usuario.isCreator && (
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        className="bg-amber-50 hover:bg-amber-100 text-amber-600"
                                      >
                                        <Crown className="h-4 w-4" />
                                      </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>¿Asignar como propietario?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                          Esta acción transferirá la propiedad de la casa a {usuario.name}. Tú seguirás
                                          siendo miembro pero perderás los privilegios de propietario.
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => asignarPropietario(usuario.id)}>
                                          Confirmar
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                )}
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
                                        Esta acción eliminará al usuario de la casa y no se puede deshacer.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                      <AlertDialogAction onClick={() => eliminarUsuario(usuario.id)}>
                                        Eliminar
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {isInviteOpen && (
            <Card className="mb-6">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium">Invitar Usuarios</h3>
                  <Badge variant="outline">Invitaciones</Badge>
                </div>
                <form onSubmit={agregarUsuario} className="space-y-4">
                  <div>
                    <Label htmlFor="nuevoUsuario" className="text-sm font-medium text-gray-700">
                      Email del nuevo usuario
                    </Label>
                    <div className="flex mt-1 gap-2">
                      <Input
                        id="nuevoUsuario"
                        type="email"
                        placeholder="correo@ejemplo.com"
                        value={nuevoUsuario}
                        onChange={(e) => setNuevoUsuario(e.target.value)}
                        className="flex-grow"
                      />
                      <Button type="submit" disabled={isLoading}>
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Invitando...
                          </>
                        ) : (
                          <>
                            <Plus className="mr-2 h-4 w-4" />
                            Invitar
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

