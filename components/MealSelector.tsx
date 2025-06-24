"use client"

import { Dialog, DialogContent, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Lightbulb } from "lucide-react"
import { formatIngredient } from "@/utils/formatIngredient"
import { useIsMobile } from "@/hooks/use-mobile"

interface MealSelectorProps {
  onSelect: (meal: string) => void
  meals: any[]
  searchTerm: string
  onSearchChange: (value: string) => void
  selectedType: string
  onTypeChange: (value: string) => void
  selectedMealTime: string
  onMealTimeChange: (value: string) => void
  getMealCounts: (meals: any[]) => any
  mealTimes: Array<{ value: string; label: string; icon: string }>
  getFilteredAndSortedMeals: (meals: any[]) => any[]
}

export function MealSelector({
  onSelect,
  meals,
  searchTerm,
  onSearchChange,
  selectedType,
  onTypeChange,
  selectedMealTime,
  onMealTimeChange,
  getMealCounts,
  mealTimes,
  getFilteredAndSortedMeals,
}: MealSelectorProps) {
  const isMobile = useIsMobile()

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size={isMobile ? "sm" : "icon"} className={isMobile ? "px-2" : "ml-2"}>
          <Lightbulb className="h-4 w-4" />
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
            <DialogTitle className="relative z-10 text-white text-xl font-bold">Seleccionar Comida</DialogTitle>
          </div>

          <div className="flex flex-col gap-3 p-4 overflow-hidden">
            <div className="space-y-3">
              <Input
                placeholder="Buscar comidas..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="border-primary/20 focus:border-primary"
              />

              <Select value={selectedType} onValueChange={onTypeChange}>
                <SelectTrigger className="bg-muted/50">
                  <SelectValue placeholder={`Todas (${getMealCounts(meals).all})`} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas ({getMealCounts(meals).all})</SelectItem>
                  <SelectItem value="carne">Carne ({getMealCounts(meals).carne})</SelectItem>
                  <SelectItem value="pollo">Pollo ({getMealCounts(meals).pollo})</SelectItem>
                  <SelectItem value="pescado">Pescado ({getMealCounts(meals).pescado})</SelectItem>
                  <SelectItem value="vegetariano">Vegetariano ({getMealCounts(meals).vegetariano})</SelectItem>
                  <SelectItem value="pastas">Pastas ({getMealCounts(meals).pastas})</SelectItem>
                  <SelectItem value="otros">Otros ({getMealCounts(meals).otros})</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedMealTime} onValueChange={onMealTimeChange}>
                <SelectTrigger className="bg-muted/50">
                  <SelectValue placeholder="Todas las comidas" />
                </SelectTrigger>
                <SelectContent>
                  {mealTimes.map((time) => (
                    <SelectItem key={time.value} value={time.value}>
                      {time.icon} {time.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="overflow-y-auto flex-1 min-h-0">
              <div className="space-y-1">
                {getFilteredAndSortedMeals(meals).map((meal) => (
                  <DialogClose key={meal._id} asChild>
                    <button
                      className="w-full px-4 py-2 text-left hover:bg-muted/50 rounded-sm flex justify-between items-center"
                      onClick={() => onSelect(meal.name)}
                    >
                      <div className="flex flex-col flex-1 truncate">
                        <span className="font-medium">{meal.name}</span>
                        {meal.ingredients && meal.ingredients.length > 0 && (
                          <span className="text-xs text-muted-foreground">
                            {meal.ingredients.slice(0, 2).map((ing: any, i: number) => (
                              <span key={i}>
                                {formatIngredient(ing)}
                                {i < Math.min(1, meal.ingredients.length - 1) ? ", " : ""}
                              </span>
                            ))}
                            {meal.ingredients.length > 2 ? "..." : ""}
                          </span>
                        )}
                      </div>
                      {meal.nutritionalInfo && (
                        <span className="text-sm text-muted-foreground ml-2 shrink-0">
                          ({meal.nutritionalInfo.calories} cal)
                        </span>
                      )}
                    </button>
                  </DialogClose>
                ))}
              </div>
            </div>
          </div>

          <div className="px-4 py-2 text-sm text-muted-foreground border-t">
            Mostrando {getFilteredAndSortedMeals(meals).length} de {meals.length} platos
            {searchTerm || selectedType !== "all" || selectedMealTime !== "all" ? " (con filtros aplicados)" : ""}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

