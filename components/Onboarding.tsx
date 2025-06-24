"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "@/components/ui/use-toast"
import { Loader2, Plus, X } from "lucide-react"

const steps = ["Bienvenida", "Crear casa", "Invitar personas", "Crear"]

export default function Onboarding() {
  const [currentStep, setCurrentStep] = useState(0)
  const [houseName, setHouseName] = useState("")
  const [invitees, setInvitees] = useState([""])
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { data: session, update } = useSession()

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleAddInvitee = () => {
    setInvitees([...invitees, ""])
  }

  const handleRemoveInvitee = (index: number) => {
    const newInvitees = invitees.filter((_, i) => i !== index)
    setInvitees(newInvitees)
  }

  const handleInviteeChange = (index: number, value: string) => {
    const newInvitees = [...invitees]
    newInvitees[index] = value
    setInvitees(newInvitees)
  }

  const handleCreateHouse = async () => {
    if (!houseName.trim()) {
      toast({
        title: "Error",
        description: "El nombre de la casa es requerido",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      // Primero creamos la casa
      const createHouseResponse = await fetch("/api/casa", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nombre: houseName.trim(),
        }),
      })

      const houseData = await createHouseResponse.json()

      if (!createHouseResponse.ok) {
        throw new Error(houseData.error || "Error al crear la casa")
      }

      // Luego enviamos las invitaciones una por una
      const validInvitees = invitees.filter((email) => email.trim() !== "")
      for (const email of validInvitees) {
        const inviteResponse = await fetch("/api/casa/invitar", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email.trim(),
          }),
        })

        if (!inviteResponse.ok) {
          console.error(`Error al invitar a ${email}:`, await inviteResponse.text())
        }
      }

      // Update the session with the new casa information
      await update({
        ...session,
        user: {
          ...session?.user,
          casa: {
            id: houseData.casa.id,
            nombre: houseData.casa.nombre,
          },
        },
      })

      // Set onboarding complete flag
      localStorage.setItem("onboardingComplete", "true")

      toast({
        title: "Casa creada con éxito",
        description:
          validInvitees.length > 0
            ? "Se han enviado las invitaciones a los miembros."
            : "La casa se ha creado correctamente.",
      })

      // Redirect to home with planner tab
      router.push("/?tab=planner")
      router.refresh()
    } catch (error: any) {
      console.error("Error detallado:", error)
      toast({
        title: "Error",
        description: error.message || "Hubo un problema al crear la casa. Por favor, inténtalo de nuevo.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="text-center">
            <p className="mb-4">¡Bienvenido! Vamos a crear tu casa.</p>
            <Button onClick={handleNext}>Siguiente</Button>
          </div>
        )
      case 1:
        return (
          <div>
            <label htmlFor="houseName" className="block text-sm font-medium text-gray-700 mb-2">
              Nombre de la casa
            </label>
            <Input
              id="houseName"
              type="text"
              value={houseName}
              onChange={(e) => setHouseName(e.target.value)}
              placeholder="Ingresa el nombre de tu casa"
              className="mb-4"
            />
            <Button onClick={handleNext} disabled={!houseName.trim()}>
              Siguiente
            </Button>
          </div>
        )
      case 2:
        return (
          <div>
            <p className="mb-4">Ingresa los correos de las personas que quieres invitar:</p>
            {invitees.map((email, index) => (
              <div key={index} className="flex mb-2">
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => handleInviteeChange(index, e.target.value)}
                  placeholder="correo@ejemplo.com"
                  className="mr-2"
                />
                {index === invitees.length - 1 ? (
                  <Button onClick={handleAddInvitee} size="icon" variant="outline">
                    <Plus className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button onClick={() => handleRemoveInvitee(index)} size="icon" variant="outline">
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
            <Button onClick={handleNext} className="mt-4">
              Siguiente
            </Button>
          </div>
        )
      case 3:
        return (
          <div className="text-center">
            <p className="mb-4">¿Listo para crear tu casa?</p>
            <Button onClick={handleCreateHouse} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creando...
                </>
              ) : (
                "Crear"
              )}
            </Button>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">{steps[currentStep]}</CardTitle>
        </CardHeader>
        <CardContent>{renderStepContent()}</CardContent>
        <CardFooter className="flex justify-between">
          {currentStep > 0 && (
            <Button onClick={handlePrevious} variant="outline">
              Anterior
            </Button>
          )}
          <div className="flex-1" />
          <div className="flex space-x-1">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full ${index === currentStep ? "bg-primary" : "bg-gray-300"}`}
              />
            ))}
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
