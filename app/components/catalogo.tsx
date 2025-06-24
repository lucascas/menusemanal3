"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogTitle, DialogFooter, DialogHeader } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertBox } from "@/components/AlertBox"
import { Search, Pencil, Loader2, Plus, RefreshCwIcon as Refresh2, Trash2, ArrowUp } from "lucide-react"
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
import { ChevronDown } from "lucide-react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Actualizar la interfaz Ingredient para que sea un string simple
interface Ingredient {
  name: string
  quantity: string
  unit?: string
}

interface Meal {
  _id: string
  name: string
  type: string
  ingredients: string[] // Cambiado a string[]
  mealTime: string
  casa: string
  nutritionalInfo?: {
    calories: number
    protein: number
    carbs: number
    fat: number
  }
}

const mealTypes = {
  carne: { icon: "🥩", label: "Carne" },
  pollo: { icon: "🍗", label: "Pollo" },
  pescado: { icon: "🐟", label: "Pescado" },
  vegetariano: { icon: "🥗", label: "Vegetariano" },
  pastas: { icon: "🍝", label: "Pastas" },
  otros: { icon: "🍽️", label: "Otros" },
}

const getCategoryIcon = (category) => {
  return mealTypes[category]?.icon || "🍽️"
}

const getCategoryName = (category) => {
  return mealTypes[category]?.label || category
}

// Actualizar la función formatIngredient para que maneje strings directamente
const formatIngredient = (ingredient) => {
  if (typeof ingredient === "string") return ingredient
  if (ingredient && typeof ingredient === "object" && ingredient.name) return ingredient.name
  return String(ingredient)
}

export default function Catalogo() {
  const [meals, setMeals] = useState([])
  const [busqueda, setBusqueda] = useState("")
  const [nuevaComida, setNuevaComida] = useState({
    nombre: "",
    ingredientes: [],
    tipo: "",
    comida: "",
    nutritionalInfo: null,
  })
  const [comidasFiltradas, setComidasFiltradas] = useState({})
  const [editingMeal, setEditingMeal] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isCalculating, setIsCalculating] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [alert, setAlert] = useState(null)
  const [errorDetails, setErrorDetails] = useState(null)
  const catalogRef = useRef(null)

  // Eliminar estas líneas:
  // const { data: session } = useSession()

  // Y reemplazar por:
  // Sin autenticación - acceso directo
  const session = { user: { casa: { id: "mock-casa" } } } // Mock session

  useEffect(() => {
    const fetchMeals = async () => {
      try {
        const response = await fetch("/api/meals")
        if (!response.ok) {
          throw new Error("Error al cargar las comidas")
        }
        const data = await response.json()
        setMeals(data)
        setComidasFiltradas(groupMealsByCategory(data))
      } catch (error) {
        console.error("Error:", error)
        setAlert({ message: "No se pudieron cargar las comidas", type: "error" })
      } finally {
        setIsLoading(false)
      }
    }

    fetchMeals()
  }, []) // Eliminar session de las dependencias

  const groupMealsByCategory = useCallback((meals) => {
    return meals.reduce((acc, meal) => {
      if (!acc[meal.type]) {
        acc[meal.type] = []
      }
      acc[meal.type].push(meal)
      return acc
    }, {})
  }, [])

  const buscarComidas = (termino) => {
    setBusqueda(termino)
    const filtradas = meals.filter(
      (comida) =>
        comida.name.toLowerCase().includes(termino.toLowerCase()) ||
        comida.type.toLowerCase().includes(termino.toLowerCase()),
    )
    setComidasFiltradas(groupMealsByCategory(filtradas))
  }

  const agregarOEditarComida = async () => {
    if (!nuevaComida.nombre || nuevaComida.ingredientes.length === 0 || !nuevaComida.tipo || !nuevaComida.comida) {
      setAlert({ message: "Todos los campos son obligatorios", type: "error" })
      return
    }

    if (!"mock-casa") {
      setAlert({ message: "Debes pertenecer a una casa para agregar o editar comidas", type: "error" })
      return
    }

    setIsLoading(true)

    try {
      const mealData = {
        name: nuevaComida.nombre,
        type: nuevaComida.tipo,
        ingredients: nuevaComida.ingredientes,
        mealTime: nuevaComida.comida,
        casa: "mock-casa",
        nutritionalInfo: nuevaComida.nutritionalInfo,
      }

      let response
      if (editingMeal) {
        response = await fetch(`/api/meals/${editingMeal._id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(mealData),
        })
      } else {
        response = await fetch("/api/meals", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(mealData),
        })
      }

      if (!response.ok) {
        throw new Error(editingMeal ? "Error al editar la comida" : "Error al agregar la comida")
      }

      const updatedMeal = await response.json()

      if (editingMeal) {
        setMeals(meals.map((meal) => (meal._id === updatedMeal._id ? updatedMeal : meal)))
      } else {
        setMeals([...meals, updatedMeal])
      }

      setComidasFiltradas(
        groupMealsByCategory(
          editingMeal
            ? meals.map((meal) => (meal._id === updatedMeal._id ? updatedMeal : meal))
            : [...meals, updatedMeal],
        ),
      )
      setNuevaComida({ nombre: "", ingredientes: [], tipo: "", comida: "", nutritionalInfo: null })
      setEditingMeal(null)
      setIsDialogOpen(false)

      setAlert({ message: editingMeal ? "Comida editada con éxito" : "Comida agregada con éxito", type: "success" })
    } catch (error) {
      console.error("Error:", error)
      setAlert({ message: editingMeal ? "No se pudo editar la comida" : "No se pudo agregar la comida", type: "error" })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteMeal = async (mealId) => {
    try {
      const response = await fetch(`/api/meals/${mealId}`, {
        method: "DELETE",
      })
      if (!response.ok) {
        throw new Error("Error al borrar la comida")
      }
      const updatedMeals = meals.filter((meal) => meal._id !== mealId)
      setMeals(updatedMeals)
      setComidasFiltradas(groupMealsByCategory(updatedMeals))
      setAlert({ message: "Comida eliminada con éxito", type: "success" })
    } catch (error) {
      console.error("Error:", error)
      setAlert({ message: "No se pudo eliminar la comida", type: "error" })
    }
  }

  const calcularValorEnergetico = async () => {
    if (nuevaComida.ingredientes.length === 0) {
      setAlert({ message: "Por favor, ingrese los ingredientes antes de calcular el valor energético", type: "error" })
      return
    }

    setIsCalculating(true)
    try {
      const response = await fetch("/api/nutrition", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ingredients: nuevaComida.ingredientes }),
      })

      if (!response.ok) {
        throw new Error("Error al calcular el valor energético")
      }

      const nutritionalInfo = await response.json()
      setNuevaComida({ ...nuevaComida, nutritionalInfo })
      setAlert({ message: "Valor energético calculado", type: "success" })
    } catch (error) {
      console.error("Error:", error)
      setAlert({
        message: "Ha habido un error al momento de realizar el análisis de valor energético.",
        type: "error",
        error: error instanceof Error ? error.message : "Error desconocido",
      })
    } finally {
      setIsCalculating(false)
    }
  }

  const openEditDialog = (meal) => {
    setEditingMeal(meal)

    // Convertir ingredientes a strings si es necesario
    let formattedIngredients = []

    if (meal.ingredients && Array.isArray(meal.ingredients)) {
      // Asegurarse de que todos los ingredientes sean strings
      formattedIngredients = meal.ingredients.map((ing) => {
        if (typeof ing === "string") return ing
        if (typeof ing === "object" && ing.name) return ing.name
        return String(ing)
      })
    }

    setNuevaComida({
      nombre: meal.name,
      ingredientes: formattedIngredients,
      tipo: meal.type,
      comida: meal.mealTime,
      nutritionalInfo: meal.nutritionalInfo || null,
    })
    setIsDialogOpen(true)
  }

  const calcularValorEnergeticoTodas = async () => {
    setIsAnalyzing(true)
    setAlert({ message: "Se está realizando el análisis de valor energético...", type: "info" })
    const mealsSinInfo = meals.filter((meal) => !meal.nutritionalInfo)
    const errors = []
    for (const meal of mealsSinInfo) {
      try {
        const response = await fetch("/api/nutrition", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ ingredients: meal.ingredients }),
        })

        if (!response.ok) {
          throw new Error(`Error al calcular el valor energético para ${meal.name}`)
        }

        const nutritionalInfo = await response.json()
        const updatedMeal = { ...meal, nutritionalInfo }

        const updateResponse = await fetch(`/api/meals/${meal._id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedMeal),
        })

        if (!updateResponse.ok) {
          throw new Error(`Error al actualizar la comida ${meal.name}`)
        }

        setMeals((prevMeals) => prevMeals.map((m) => (m._id === meal._id ? updatedMeal : m)))
      } catch (error) {
        console.error(`Error al procesar ${meal.name}:`, error)
        errors.push(`Error al procesar ${meal.name}: ${error instanceof Error ? error.message : "Error desconocido"}`)
      }
    }
    setComidasFiltradas(groupMealsByCategory(meals))
    setIsAnalyzing(false)
    if (errors.length > 0) {
      setAlert({
        message: "Ha habido errores al momento de realizar el análisis de valor energético.",
        type: "error",
        error: errors.join("\n"),
      })
    } else {
      setAlert({
        message: "Se ha calculado el valor energético de todas las comidas sin información nutricional",
        type: "success",
      })
    }
  }

  const scrollToTop = () => {
    catalogRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const getMealCounts = (meals) => {
    const counts = { all: meals.length }
    Object.keys(mealTypes).forEach((type) => {
      counts[type] = meals.filter((meal) => meal.type === type).length
    })
    return counts
  }

  const renderMealCard = (meal) => {
    return (
      <div
        key={meal._id}
        className="p-2 rounded border hover:bg-gray-50 transition-colors shadow-[0_2px_8px_rgba(0,0,0,0.1)]"
      >
        <div className="flex flex-col">
          <span className="font-semibold">{meal.name}</span>
          {meal.nutritionalInfo && (
            <span className="text-sm text-gray-500">
              {meal.nutritionalInfo.calories} cal | {meal.nutritionalInfo.protein}g prot |{meal.nutritionalInfo.carbs}g
              carb | {meal.nutritionalInfo.fat}g grasas
            </span>
          )}
        </div>
        <div className="text-sm text-gray-600 mt-1">
          {meal.ingredients &&
            meal.ingredients.slice(0, 2).map((ing, i) => (
              <span key={i}>
                {formatIngredient(ing)}
                {i < Math.min(1, meal.ingredients.length - 1) ? ", " : ""}
              </span>
            ))}
          {meal.ingredients && meal.ingredients.length > 2 ? "..." : ""}
        </div>
        <div className="flex justify-end mt-2 space-x-2">
          <Button variant="outline" size="sm" onClick={() => openEditDialog(meal)}>
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
                  Esta acción no se puede deshacer. Se eliminará la comida permanentemente.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={() => handleDeleteMeal(meal._id)}>Eliminar</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    )
  }

  return (
    <Card className="w-full shadow-[0_2px_8px_rgba(0,0,0,0.1)]" ref={catalogRef}>
      <CardHeader className="border-b">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold">Catálogo de Comidas</h2>
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative w-full">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Buscar comidas..."
                value={busqueda}
                onChange={(e) => buscarComidas(e.target.value)}
                className="pl-8"
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <Button
                onClick={() => setIsDialogOpen(true)}
                className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Plus className="h-4 w-4 mr-2" />
                Agregar Comida
              </Button>
              <Button
                onClick={calcularValorEnergeticoTodas}
                disabled={isAnalyzing}
                className="w-full sm:w-auto bg-secondary text-secondary-foreground hover:bg-secondary/90"
              >
                <Refresh2 className="h-4 w-4 mr-2" />
                Calcular Valor Energético
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        {isAnalyzing && (
          <div className="mb-4 p-2 bg-blue-100 text-blue-700 rounded">
            Se está realizando el análisis de valor energético...
          </div>
        )}
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="w-full border-b mb-4">
            <TabsTrigger value="all" className="flex items-center gap-2">
              <span>🍽️</span>
              <span>Todas las comidas ({getMealCounts(meals).all})</span>
            </TabsTrigger>
            {Object.entries(mealTypes).map(([key, value]) => (
              <TabsTrigger key={key} value={key} className="flex items-center gap-2">
                <span>{value.icon}</span>
                <span>
                  {value.label} ({getMealCounts(meals)[key]})
                </span>
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="all">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {Object.values(comidasFiltradas).flat().map(renderMealCard)}
            </div>
          </TabsContent>

          {Object.entries(mealTypes).map(([key, value]) => (
            <TabsContent key={key} value={key}>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {(comidasFiltradas[key] || []).map(renderMealCard)}
              </div>
            </TabsContent>
          ))}
          <TabsContent value="otros">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {(comidasFiltradas["otros"] || []).map(renderMealCard)}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-[600px] p-0">
          <div className="grid grid-rows-[auto,1fr,auto] h-full max-h-[600px]">
            <div
              className="relative py-6 px-4 text-center border-b"
              style={{
                backgroundImage:
                  "url('https://hebbkx1anhila5yf.public.blob.vercel-storage.com/openart-image_2AaNge0F_1740438376698_raw-PmsHJhjheSfVWiqPCCZBPTPtPlwVPi.png')",
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              <div className="absolute inset-0 bg-black/50" />
              <DialogTitle className="relative z-10 text-white text-xl font-bold">
                {editingMeal ? "Editar Comida" : "Agregar Nueva Comida"}
              </DialogTitle>
            </div>

            <div className="flex flex-col gap-3 p-4 overflow-hidden">
              <div className="overflow-y-auto flex-1 min-h-0">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="nombre">Nombre</Label>
                    <Input
                      id="nombre"
                      value={nuevaComida.nombre}
                      onChange={(e) => setNuevaComida({ ...nuevaComida, nombre: e.target.value })}
                    />
                  </div>

                  <Collapsible className="space-y-2">
                    <CollapsibleTrigger className="flex items-center justify-between w-full">
                      <Label className="font-semibold">Ingredientes</Label>
                      <ChevronDown className="h-4 w-4" />
                    </CollapsibleTrigger>
                    <CollapsibleContent className="overflow-hidden transition-all duration-300 ease-in-out">
                      <div className="pt-2 space-y-2">
                        <Input
                          value={nuevaComida.ingredientes.join(", ")}
                          onChange={(e) => setNuevaComida({ ...nuevaComida, ingredientes: e.target.value.split(",") })}
                        />
                      </div>
                    </CollapsibleContent>
                  </Collapsible>

                  <div className="space-y-2">
                    <Label htmlFor="tipo">Tipo</Label>
                    <Select
                      value={nuevaComida.tipo}
                      onValueChange={(value) => setNuevaComida({ ...nuevaComida, tipo: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="carne">Carne</SelectItem>
                        <SelectItem value="pollo">Pollo</SelectItem>
                        <SelectItem value="pescado">Pescado</SelectItem>
                        <SelectItem value="vegetariano">Vegetariano</SelectItem>
                        <SelectItem value="pastas">Pastas</SelectItem>
                        <SelectItem value="otros">Otros</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="comida">Comida</Label>
                    <Select
                      value={nuevaComida.comida}
                      onValueChange={(value) => setNuevaComida({ ...nuevaComida, comida: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un tipo de comida" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Almuerzo">Almuerzo</SelectItem>
                        <SelectItem value="Cena">Cena</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button onClick={calcularValorEnergetico} disabled={isCalculating} className="w-full">
                    {isCalculating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Calculando...
                      </>
                    ) : (
                      "Calcular valor energético"
                    )}
                  </Button>

                  {nuevaComida.nutritionalInfo && (
                    <Collapsible className="space-y-2">
                      <CollapsibleTrigger className="flex items-center justify-between w-full">
                        <span className="font-semibold">Información nutricional calculada</span>
                        <ChevronDown className="h-4 w-4" />
                      </CollapsibleTrigger>
                      <CollapsibleContent className="overflow-hidden transition-all duration-300 ease-in-out">
                        <div className="pt-2">
                          <div className="grid grid-cols-2 gap-2 p-3 bg-muted/50 rounded-lg">
                            <div>Calorías: {nuevaComida.nutritionalInfo.calories} kcal</div>
                            <div>Proteínas: {nuevaComida.nutritionalInfo.protein}g</div>
                            <div>Carbohidratos: {nuevaComida.nutritionalInfo.carbs}g</div>
                            <div>Grasas: {nuevaComida.nutritionalInfo.fat}g</div>
                          </div>
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  )}
                </div>
              </div>
            </div>

            <div className="p-4 border-t">
              <Button onClick={agregarOEditarComida} disabled={isLoading} className="w-full">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {editingMeal ? "Editando..." : "Agregando..."}
                  </>
                ) : editingMeal ? (
                  "Guardar Cambios"
                ) : (
                  "Agregar Comida"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      <Button className="fixed bottom-4 right-4 rounded-full p-2" onClick={scrollToTop} variant="outline">
        <ArrowUp className="h-6 w-6" />
      </Button>
      {alert && (
        <AlertBox
          message={alert.message}
          type={alert.type}
          error={alert.error}
          onViewError={() => setErrorDetails(alert.error || null)}
        />
      )}
      {errorDetails && (
        <Dialog open={!!errorDetails} onOpenChange={() => setErrorDetails(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Detalles del error</DialogTitle>
            </DialogHeader>
            <div className="mt-2 whitespace-pre-wrap">{errorDetails}</div>
            <DialogFooter>
              <Button onClick={() => setErrorDetails(null)}>Cerrar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </Card>
  )
}
