"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast"
import { Wand2, Trash2, Share2, ShoppingCart, Calendar, ChevronDown, ChevronRight } from "lucide-react"
import { MealSelector } from "@/components/MealSelector"
import { format, startOfWeek, addDays } from "date-fns"
import { es } from "date-fns/locale"
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
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Badge } from "@/components/ui/badge"
import { useIsMobile } from "@/hooks/use-mobile"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function Planificador() {
  const [menu, setMenu] = useState({})
  const [weekStartDate, setWeekStartDate] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }))
  const [showShoppingList, setShowShoppingList] = useState(false)
  const [shoppingList, setShoppingList] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedType, setSelectedType] = useState("all")
  const [selectedMealTime, setSelectedMealTime] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [meals, setMeals] = useState([])
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false)
  const [debugMode, setDebugMode] = useState(false)
  const [debugInfo, setDebugInfo] = useState(null)
  const [apiResponse, setApiResponse] = useState(null)
  const [isDaysOpen, setIsDaysOpen] = useState(true)
  const [isShoppingOpen, setIsShoppingOpen] = useState(false)
  const [isActionsOpen, setIsActionsOpen] = useState(true)
  const [activeTab, setActiveTab] = useState("days")
  const isMobile = useIsMobile()

  // Add useEffect to fetch meals from the database
  useEffect(() => {
    const fetchMeals = async () => {
      try {
        const response = await fetch("/api/meals")
        if (!response.ok) {
          throw new Error("Error al cargar las comidas")
        }
        const data = await response.json()
        setMeals(data)
      } catch (error) {
        console.error("Error fetching meals:", error)
      }
    }

    fetchMeals()
  }, [])

  // Add this function to get counts by category
  const getMealCounts = (meals) => {
    const counts = {
      all: meals.length,
      carne: meals.filter((m) => m.type === "carne").length,
      pollo: meals.filter((m) => m.type === "pollo").length,
      pescado: meals.filter((m) => m.type === "pescado").length,
      vegetariano: meals.filter((m) => m.type === "vegetariano").length,
      pastas: meals.filter((m) => m.type === "pastas").length,
      otros: meals.filter((m) => m.type === "otros").length,
    }
    return counts
  }

  const dias = ["lunes", "martes", "miércoles", "jueves", "viernes"]
  const comidas = ["Almuerzo", "Cena"] // Removed "desayuno"

  const mealTimes = [
    { value: "all", label: "Todas las comidas", icon: "🍽️" },
    { value: "Almuerzo", label: "Almuerzo", icon: "🌞" },
    { value: "Cena", label: "Cena", icon: "🌙" },
  ]

  // Generar los días de la semana con fechas específicas
  const diasConFechas = Array.from({ length: 5 }, (_, i) => {
    const date = addDays(weekStartDate, i)
    return {
      nombre: format(date, "EEEE", { locale: es }),
      fecha: date,
      key: format(date, "yyyy-MM-dd"),
    }
  })

  const cambiarSemana = (direccion) => {
    const nuevaFecha = addDays(weekStartDate, direccion * 7)
    setWeekStartDate(nuevaFecha)
    // Limpiar el menú al cambiar de semana
    setMenu({})
  }

  const agregarComida = (dia, comida, alimento) => {
    setMenu((prevMenu) => {
      const updatedMenu = { ...prevMenu }
      if (!updatedMenu[dia.key]) {
        updatedMenu[dia.key] = {
          fecha: dia.fecha,
          nombre: dia.nombre,
        }
      }
      updatedMenu[dia.key][comida.toLowerCase()] = alimento
      return updatedMenu
    })
  }

  const borrarTodo = () => {
    setMenu({})
    setShowShoppingList(false)
    setShoppingList([])
  }

  const generarMenuAleatorio = () => {
    const nuevoMenu = {}
    diasConFechas.forEach((dia) => {
      nuevoMenu[dia.key] = {
        fecha: dia.fecha,
        nombre: dia.nombre,
      }
      comidas.forEach((comida) => {
        const comidasDisponibles = meals.filter((meal) => meal.mealTime === comida)
        if (comidasDisponibles.length > 0) {
          const comidaAleatoria = comidasDisponibles[Math.floor(Math.random() * comidasDisponibles.length)]
          nuevoMenu[dia.key][comida.toLowerCase()] = comidaAleatoria.name
        } else {
          nuevoMenu[dia.key][comida.toLowerCase()] = "No disponible"
        }
      })
    })
    setMenu(nuevoMenu)
  }

  const calcularResumenNutricional = (diaMenu) => {
    let totalCalories = 0
    let totalProtein = 0
    let totalCarbs = 0
    let totalFat = 0

    for (const comida in diaMenu) {
      if (comida === "almuerzo" || comida === "cena") {
        const alimento = diaMenu[comida]
        const meal = meals.find((m) => m.name === alimento)
        if (meal && meal.nutritionalInfo) {
          totalCalories += meal.nutritionalInfo.calories
          totalProtein += meal.nutritionalInfo.protein
          totalCarbs += meal.nutritionalInfo.carbs
          totalFat += meal.nutritionalInfo.fat
        }
      }
    }

    return {
      calories: totalCalories,
      protein: totalProtein,
      carbs: totalCarbs,
      fat: totalFat,
    }
  }

  const generarListaCompras = () => {
    const lista = []
    for (const dia in menu) {
      for (const comida in menu[dia]) {
        if (comida === "almuerzo" || comida === "cena") {
          const alimento = menu[dia][comida]
          const meal = meals.find((m) => m.name === alimento)
          if (meal) {
            meal.ingredients.forEach((ingredient) => {
              const existingIngredient = lista.find((item) => item.name === ingredient)
              if (!existingIngredient) {
                lista.push({ name: ingredient, checked: false })
              }
            })
          }
        }
      }
    }
    setShoppingList(lista)
    setShowShoppingList(true)
    setIsShoppingOpen(true)
    if (isMobile) {
      setActiveTab("shopping")
    }
  }

  // Función completamente reescrita para guardar el menú
  const guardarYEnviar = async () => {
    setIsLoading(true)
    try {
      // Verificar si hay al menos una comida en el menú
      let hayComidas = false
      for (const diaKey in menu) {
        if (menu[diaKey].almuerzo || menu[diaKey].cena) {
          hayComidas = true
          break
        }
      }

      if (!hayComidas) {
        toast({
          title: "Error",
          description: "Debes agregar al menos una comida al menú antes de guardar",
          variant: "destructive",
        })
        setIsLoading(false)
        return
      }

      // Crear el objeto de datos completo
      const menuData = {
        fecha: weekStartDate.toISOString(),
        menu: menu,
        ingredientes: shoppingList.map((item) => item.name),
      }

      console.log("Enviando menú a la API:", JSON.stringify(menuData, null, 2))
      setDebugInfo(menuData)

      const response = await fetch("/api/weeklyMenu", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(menuData),
      })

      const responseData = await response.json()
      setApiResponse(responseData)

      if (!response.ok) {
        console.error("Error al guardar el menú:", responseData)
        throw new Error(responseData.error || "Error al guardar el menú")
      }

      console.log("Respuesta del servidor:", responseData)

      toast({
        title: "Éxito",
        description: "Plan guardado correctamente",
      })
    } catch (error) {
      console.error("Error completo:", error)
      toast({
        title: "Error",
        description: "No se pudo guardar el plan: " + (error.message || "Error desconocido"),
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const generateShareMessage = () => {
    let message = "¡Nuestro plan de comidas semanal!\n\n"

    // Listado de comidas por día
    for (const dia in menu) {
      message += `*${dia.toUpperCase()}*\n`
      for (const comida in menu[dia]) {
        if (comida === "almuerzo" || comida === "cena") {
          message += `${comida}: ${menu[dia][comida]}\n`
        }
      }
      message += "\n"
    }

    // Lista de ingredientes
    message += "*LISTA DE COMPRAS:*\n"
    const ingredientes = []
    for (const dia in menu) {
      for (const comida in menu[dia]) {
        if (comida === "almuerzo" || comida === "cena") {
          const alimento = menu[dia][comida]
          const meal = meals.find((m) => m.name === alimento)
          if (meal) {
            meal.ingredients.forEach((ingredient) => {
              if (!ingredientes.includes(ingredient)) {
                ingredientes.push(ingredient)
              }
            })
          }
        }
      }
    }
    ingredientes.forEach((ingrediente) => {
      message += `- ${ingrediente}\n`
    })

    return encodeURIComponent(message)
  }

  const getFilteredAndSortedMeals = (meals) => {
    let filteredMeals = meals

    // Filter by search term
    if (searchTerm) {
      filteredMeals = filteredMeals.filter((meal) => meal.name.toLowerCase().includes(searchTerm.toLowerCase()))
    }

    // Filter by type (if not "all")
    if (selectedType !== "all") {
      filteredMeals = filteredMeals.filter((meal) => {
        // Make type comparison case insensitive
        const mealType = meal.type?.toLowerCase()
        const selectedTypeValue = selectedType.toLowerCase()
        return mealType === selectedTypeValue
      })
    }

    // Filter by mealTime (if not "all")
    if (selectedMealTime !== "all") {
      filteredMeals = filteredMeals.filter((meal) => {
        // Make mealTime comparison case insensitive and handle undefined
        const mealTime = meal.mealTime?.toLowerCase()
        const selectedTimeValue = selectedMealTime.toLowerCase()
        return mealTime === selectedTimeValue
      })
    }

    // Sort meals alphabetically
    const sortedMeals = filteredMeals.sort((a, b) => a.name.localeCompare(b.name))

    return sortedMeals
  }

  // Mobile view
  if (isMobile) {
    return (
      <div className="pb-16">
        {/* Week selector */}
        <div className="flex items-center justify-between mb-4 bg-white p-3 rounded-lg shadow-sm">
          <Button variant="outline" size="sm" onClick={() => cambiarSemana(-1)}>
            &lt;
          </Button>
          <div className="text-center">
            <div className="text-sm font-medium">
              {format(weekStartDate, "d MMM", { locale: es })} -
              {format(addDays(weekStartDate, 4), "d MMM", { locale: es })}
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={() => cambiarSemana(1)}>
            &gt;
          </Button>
        </div>

        {/* Tabs for mobile */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="days">Días</TabsTrigger>
            <TabsTrigger value="shopping">Compras</TabsTrigger>
            <TabsTrigger value="actions">Acciones</TabsTrigger>
          </TabsList>

          {/* Days Tab */}
          <TabsContent value="days" className="space-y-4">
            {diasConFechas.map((dia) => (
              <Card key={dia.key} id={`day-${dia.key}`} className="shadow-sm">
                <CardHeader className="pb-2 border-b">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-medium capitalize">
                      {dia.nombre}{" "}
                      <span className="text-xs text-gray-500 font-normal">
                        ({format(dia.fecha, "d MMM", { locale: es })})
                      </span>
                    </h3>
                  </div>
                </CardHeader>
                <CardContent className="p-3">
                  <div className="space-y-3">
                    {comidas.map((comida) => (
                      <div key={comida} className="space-y-1">
                        <Label className="text-sm font-medium text-gray-700 flex items-center">
                          {comida === "Almuerzo" ? "🌞" : "🌙"} {comida}
                        </Label>
                        <div className="flex">
                          <Input
                            type="text"
                            value={menu[dia.key]?.[comida.toLowerCase()] || ""}
                            onChange={(e) => agregarComida(dia, comida, e.target.value)}
                            placeholder={`${comida}...`}
                            className="flex-1 text-sm"
                          />
                          <MealSelector
                            onSelect={(meal) => agregarComida(dia, comida, meal)}
                            meals={meals}
                            searchTerm={searchTerm}
                            onSearchChange={(value) => setSearchTerm(value)}
                            selectedType={selectedType}
                            onTypeChange={(value) => setSelectedType(value)}
                            selectedMealTime={selectedMealTime}
                            onMealTimeChange={(value) => setSelectedMealTime(value)}
                            getMealCounts={getMealCounts}
                            mealTimes={mealTimes}
                            getFilteredAndSortedMeals={getFilteredAndSortedMeals}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                  {menu[dia.key] && (
                    <div className="mt-3 text-xs text-gray-600 bg-gray-50 p-2 rounded">
                      <span className="font-medium">Nutrición:</span>{" "}
                      {calcularResumenNutricional(menu[dia.key]).calories.toFixed(0)} cal |{" "}
                      {calcularResumenNutricional(menu[dia.key]).protein.toFixed(1)}g prot |{" "}
                      {calcularResumenNutricional(menu[dia.key]).carbs.toFixed(1)}g carb |{" "}
                      {calcularResumenNutricional(menu[dia.key]).fat.toFixed(1)}g grasas
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* Shopping List Tab */}
          <TabsContent value="shopping">
            <Card className="shadow-sm">
              <CardHeader className="pb-2 border-b">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-medium">Lista de Compras</h3>
                  <Button variant="outline" size="sm" onClick={generarListaCompras} className="text-xs">
                    <ShoppingCart className="h-3 w-3 mr-1" />
                    Generar
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-3">
                {shoppingList.length === 0 ? (
                  <div className="text-center py-6 text-gray-500">No hay ingredientes en la lista de compras</div>
                ) : (
                  <div className="space-y-2">
                    {shoppingList.map((ingrediente, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={`ingrediente-${index}`}
                          checked={ingrediente.checked}
                          onChange={() => {
                            const newList = [...shoppingList]
                            newList[index].checked = !newList[index].checked
                            setShoppingList(newList)
                          }}
                          className="rounded border-gray-300"
                        />
                        <label
                          htmlFor={`ingrediente-${index}`}
                          className="text-sm font-medium text-gray-700 capitalize"
                        >
                          {ingrediente.name}
                        </label>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Actions Tab */}
          <TabsContent value="actions">
            <Card className="shadow-sm">
              <CardHeader className="pb-2 border-b">
                <h3 className="text-base font-medium">Acciones</h3>
              </CardHeader>
              <CardContent className="p-3">
                <div className="space-y-3">
                  <Button
                    onClick={generarMenuAleatorio}
                    className="w-full flex items-center justify-center"
                    variant="outline"
                  >
                    <Wand2 className="h-4 w-4 mr-2" />
                    Generar Menú
                  </Button>

                  <Button
                    onClick={guardarYEnviar}
                    disabled={isLoading}
                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    {isLoading ? "Guardando..." : "Guardar y enviar"}
                  </Button>

                  <Button
                    onClick={() => window.open(`https://wa.me/?text=${generateShareMessage()}`, "_blank")}
                    className="w-full bg-[#25D366] hover:bg-[#25D366]/90 text-white"
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    Compartir por WhatsApp
                  </Button>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" className="w-full text-red-600 hover:text-red-700 hover:bg-red-50">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Borrar Todo
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Esta acción no se puede deshacer. Se borrará todo el menú actual.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={borrarTodo}>Sí, borrar</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Fixed bottom navigation for mobile */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-2 flex justify-around z-20">
          <Button
            variant={activeTab === "days" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("days")}
            className="flex flex-col items-center text-xs py-1 h-auto"
          >
            <Calendar className="h-5 w-5 mb-1" />
            <span>Días</span>
          </Button>
          <Button
            variant={activeTab === "shopping" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("shopping")}
            className="flex flex-col items-center text-xs py-1 h-auto"
          >
            <ShoppingCart className="h-5 w-5 mb-1" />
            <span>Compras</span>
          </Button>
          <Button
            variant={activeTab === "actions" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("actions")}
            className="flex flex-col items-center text-xs py-1 h-auto"
          >
            <Wand2 className="h-5 w-5 mb-1" />
            <span>Acciones</span>
          </Button>
        </div>
      </div>
    )
  }

  // Desktop view
  return (
    <div className="max-w-7xl mx-auto">
      <div className="grid grid-cols-3 gap-6">
        {/* Left Column - Categories */}
        <div className="col-span-1">
          <div className="bg-white rounded-md shadow-sm">
            <div className="p-4 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-medium">Planificación</h2>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => cambiarSemana(-1)}>
                    &lt;
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                    onClick={() => setIsDatePickerOpen(true)}
                  >
                    <Calendar className="h-4 w-4" />
                    <span className="text-xs">
                      {format(weekStartDate, "d MMM", { locale: es })} -
                      {format(addDays(weekStartDate, 4), "d MMM", { locale: es })}
                    </span>
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => cambiarSemana(1)}>
                    &gt;
                  </Button>
                </div>
              </div>
            </div>
            <div className="p-2">
              <Collapsible open={isDaysOpen} onOpenChange={setIsDaysOpen}>
                <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-gray-50 rounded">
                  <div className="flex items-center">
                    <span className="font-medium">Días</span>
                  </div>
                  <Badge variant="outline" className="ml-auto mr-2">
                    {diasConFechas.length}
                  </Badge>
                  {isDaysOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="pl-4 pr-2 py-2 space-y-1">
                    {diasConFechas.map((dia) => (
                      <div
                        key={dia.key}
                        className="flex items-center justify-between p-2 hover:bg-gray-50 rounded cursor-pointer"
                        onClick={() =>
                          document.getElementById(`day-${dia.key}`)?.scrollIntoView({ behavior: "smooth" })
                        }
                      >
                        <span className="capitalize">{dia.nombre}</span>
                        <span className="text-xs text-gray-500">{format(dia.fecha, "d MMM", { locale: es })}</span>
                      </div>
                    ))}
                  </div>
                </CollapsibleContent>
              </Collapsible>

              <Collapsible open={isShoppingOpen} onOpenChange={setIsShoppingOpen}>
                <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-gray-50 rounded">
                  <div className="flex items-center">
                    <span className="font-medium">Lista de Compras</span>
                  </div>
                  <Badge variant="outline" className="ml-auto mr-2">
                    {shoppingList.length}
                  </Badge>
                  {isShoppingOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </CollapsibleTrigger>
              </Collapsible>

              <Collapsible open={isActionsOpen} onOpenChange={setIsActionsOpen}>
                <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-gray-50 rounded">
                  <div className="flex items-center">
                    <span className="font-medium">Acciones</span>
                  </div>
                  <Badge variant="outline" className="ml-auto mr-2">
                    3
                  </Badge>
                  {isActionsOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="pl-4 pr-2 py-2 space-y-2">
                    <Button
                      onClick={generarMenuAleatorio}
                      className="w-full flex items-center justify-start"
                      variant="outline"
                      size="sm"
                    >
                      <Wand2 className="h-4 w-4 mr-2" />
                      Generar Menú
                    </Button>

                    <Button
                      onClick={generarListaCompras}
                      className="w-full flex items-center justify-start"
                      variant="outline"
                      size="sm"
                    >
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Lista de Compras
                    </Button>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full flex items-center justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Borrar Todo
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Esta acción no se puede deshacer. Se borrará todo el menú actual.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={borrarTodo}>Sí, borrar</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </div>
          </div>
        </div>

        {/* Right Column - Content */}
        <div className="col-span-2">
          {/* Days Section */}
          <div className="space-y-6">
            {diasConFechas.map((dia) => (
              <Card key={dia.key} id={`day-${dia.key}`} className="shadow-sm">
                <CardHeader className="pb-2 border-b">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium capitalize">
                      {dia.nombre}{" "}
                      <span className="text-sm text-gray-500 font-normal">
                        ({format(dia.fecha, "d 'de' MMMM", { locale: es })})
                      </span>
                    </h3>
                    <Badge variant="outline">Día</Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {comidas.map((comida) => (
                      <div key={comida} className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700 flex items-center">
                          {comida === "Almuerzo" ? "🌞" : "🌙"} {comida}
                        </Label>
                        <div className="flex">
                          <Input
                            type="text"
                            value={menu[dia.key]?.[comida.toLowerCase()] || ""}
                            onChange={(e) => agregarComida(dia, comida, e.target.value)}
                            placeholder={`Seleccionar ${comida.toLowerCase()}...`}
                            className="flex-1"
                          />
                          <MealSelector
                            onSelect={(meal) => agregarComida(dia, comida, meal)}
                            meals={meals}
                            searchTerm={searchTerm}
                            onSearchChange={(value) => setSearchTerm(value)}
                            selectedType={selectedType}
                            onTypeChange={(value) => setSelectedType(value)}
                            selectedMealTime={selectedMealTime}
                            onMealTimeChange={(value) => setSelectedMealTime(value)}
                            getMealCounts={getMealCounts}
                            mealTimes={mealTimes}
                            getFilteredAndSortedMeals={getFilteredAndSortedMeals}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 text-sm text-gray-600">
                    <h4 className="font-medium">Resumen Nutricional:</h4>
                    {menu[dia.key] && (
                      <p>
                        {calcularResumenNutricional(menu[dia.key]).calories.toFixed(0)} cal |{" "}
                        {calcularResumenNutricional(menu[dia.key]).protein.toFixed(1)}g prot |{" "}
                        {calcularResumenNutricional(menu[dia.key]).carbs.toFixed(1)}g carb |{" "}
                        {calcularResumenNutricional(menu[dia.key]).fat.toFixed(1)}g grasas
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Shopping List Section */}
          {showShoppingList && (
            <Card className="mt-6 shadow-sm">
              <CardHeader className="pb-2 border-b">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Lista de Compras</h3>
                  <Badge variant="outline">Ingredientes</Badge>
                </div>
              </CardHeader>
              <CardContent className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {shoppingList.map((ingrediente, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`ingrediente-${index}`}
                        checked={ingrediente.checked}
                        onChange={() => {
                          const newList = [...shoppingList]
                          newList[index].checked = !newList[index].checked
                          setShoppingList(newList)
                        }}
                        className="rounded border-gray-300"
                      />
                      <label htmlFor={`ingrediente-${index}`} className="text-sm font-medium text-gray-700 capitalize">
                        {ingrediente.name}
                      </label>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap justify-end gap-3 mt-6">
            <Button
              onClick={guardarYEnviar}
              disabled={isLoading}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {isLoading ? "Guardando..." : "Guardar y enviar"}
            </Button>
            <Button
              onClick={() => window.open(`https://wa.me/?text=${generateShareMessage()}`, "_blank")}
              className="bg-[#25D366] hover:bg-[#25D366]/90 text-white"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Compartir por WhatsApp
            </Button>
          </div>

          {/* Debug Section */}
          {debugMode && (
            <div className="mt-6 p-4 bg-gray-100 rounded-lg">
              <h3 className="font-bold mb-2">Información de depuración:</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold">Datos del menú:</h4>
                  <pre className="text-xs overflow-auto max-h-40">{JSON.stringify(menu, null, 2)}</pre>
                </div>
                {debugInfo && (
                  <div>
                    <h4 className="font-semibold">Último envío a la API:</h4>
                    <pre className="text-xs overflow-auto max-h-40">{JSON.stringify(debugInfo, null, 2)}</pre>
                  </div>
                )}
                {apiResponse && (
                  <div>
                    <h4 className="font-semibold">Respuesta de la API:</h4>
                    <pre className="text-xs overflow-auto max-h-40">{JSON.stringify(apiResponse, null, 2)}</pre>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

