"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card"
import { toast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"

const isValidEmail = (email: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

const isStrongPassword = (password: string) => {
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
  return passwordRegex.test(password)
}

export default function RegisterForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const invitationToken = searchParams.get("invite") || localStorage.getItem("invitationToken") || ""

  useEffect(() => {
    // Si hay un token de invitación en los parámetros, guardarlo en localStorage
    if (searchParams.get("invite")) {
      localStorage.setItem("invitationToken", searchParams.get("invite") || "")
    }

    // Limpiar el token de invitación del localStorage al desmontar el componente
    return () => {
      localStorage.removeItem("invitationToken")
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!isValidEmail(email)) {
      toast({
        title: "Error en el registro",
        description: "Por favor, introduce un email válido.",
        variant: "destructive",
      })
      return
    }

    if (!isStrongPassword(password)) {
      toast({
        title: "Error en el registro",
        description:
          "La contraseña debe tener al menos 8 caracteres, incluir una mayúscula, una minúscula, un número y un carácter especial.",
        variant: "destructive",
      })
      return
    }

    if (password !== confirmPassword) {
      toast({
        title: "Error en el registro",
        description: "Las contraseñas no coinciden",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      // 1. Registrar al usuario
      const registerResponse = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, invitationToken }),
      })

      const registerData = await registerResponse.json()

      if (!registerResponse.ok) {
        throw new Error(registerData.message || "Error en el registro")
      }

      // 2. Iniciar sesión automáticamente
      const signInResult = await signIn("credentials", {
        redirect: false,
        email,
        password,
      })

      if (signInResult?.error) {
        throw new Error("Error al iniciar sesión automáticamente")
      }

      // 3. Redirigir según si fue invitado o no
      if (registerData.wasInvited) {
        router.push("/?tab=planner")
      } else {
        router.push("/onboarding")
      }

      router.refresh()
    } catch (error: any) {
      console.error("Error en el proceso de registro:", error)
      toast({
        title: "Error en el registro",
        description: error.message || "Ocurrió un error inesperado",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    try {
      setIsGoogleLoading(true)
      // Si hay token de invitación, guardarlo en localStorage antes de redirigir
      if (invitationToken) {
        localStorage.setItem("invitationToken", invitationToken)
      }
      await signIn("google", {
        callbackUrl: invitationToken ? "/?tab=planner" : "/onboarding",
      })
    } catch (error) {
      console.error("Error al registrarse con Google:", error)
      toast({
        title: "Error",
        description: "Ocurrió un error al intentar registrarse con Google",
        variant: "destructive",
      })
    } finally {
      setIsGoogleLoading(false)
    }
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-md">
        <CardHeader>
          <h1 className="text-2xl font-bold text-center">Únete a Planneat</h1>
          {invitationToken && (
            <p className="text-center text-sm text-muted-foreground">Has sido invitado a unirte a una casa</p>
          )}
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <Input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                className="mt-1"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Contraseña
              </label>
              <Input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                className="mt-1"
              />
              <p className="text-xs text-gray-500 mt-1">
                La contraseña debe tener al menos 8 caracteres, incluir una mayúscula, una minúscula, un número y un
                carácter especial.
              </p>
            </div>
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirmar Contraseña
              </label>
              <Input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={isLoading}
                className="mt-1"
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Registrando...
                </>
              ) : (
                "Registrarse"
              )}
            </Button>
          </form>
          <div className="mt-4">
            <Button
              onClick={handleGoogleSignIn}
              className="w-full"
              variant="outline"
              disabled={isLoading || isGoogleLoading}
            >
              {isGoogleLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Conectando con Google...
                </>
              ) : (
                "Registrarse con Google"
              )}
            </Button>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button variant="link" onClick={() => router.push("/login")} disabled={isLoading}>
            ¿Ya tienes una cuenta? Inicia sesión
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

