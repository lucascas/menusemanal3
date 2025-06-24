"use client"

import type React from "react"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { X, Plus } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"

// Define the ingredient structure as simple strings
export type Ingredient = string

interface IngredientInputProps {
  ingredients: Ingredient[]
  onChange: (ingredients: Ingredient[]) => void
}

export function IngredientInput({ ingredients, onChange }: IngredientInputProps) {
  const [newIngredient, setNewIngredient] = useState("")

  const addIngredient = () => {
    if (newIngredient.trim()) {
      onChange([...ingredients, newIngredient.trim()])
      setNewIngredient("")
    }
  }

  const removeIngredient = (index: number) => {
    const updatedIngredients = ingredients.filter((_, i) => i !== index)
    onChange(updatedIngredients)
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault()
      addIngredient()
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2 items-center">
        <div className="flex-1">
          <Input
            placeholder="Ingrediente"
            value={newIngredient}
            onChange={(e) => setNewIngredient(e.target.value)}
            onKeyPress={handleKeyPress}
          />
        </div>
        <Button type="button" size="icon" onClick={addIngredient} className="flex-shrink-0">
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      <ScrollArea className="h-[150px] w-full rounded-md border p-2">
        <div className="space-y-2">
          {ingredients.map((ingredient, index) => (
            <div key={index} className="flex items-center justify-between bg-gray-100 p-2 rounded">
              <div className="flex flex-1 items-center">
                <span className="font-medium">{ingredient}</span>
              </div>
              <Button variant="ghost" size="sm" onClick={() => removeIngredient(index)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}

