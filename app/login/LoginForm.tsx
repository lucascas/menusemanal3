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
import { logger } from "@/lib/logger"

const isValidEmail = (email: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export default function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get("callbackUrl") || "/?tab=planner"
  const error = searchParams.get("error")
  const invitationToken = searchParams.get("invite") || localStorage.getItem("invitationToken") || ""

  useEffect(() => {
    if (error) {
      logger.error("Error de autenticación:", error)
      let errorMessage = "Ha ocurrido un error durante la autenticación"

      switch (error) {
        case "AccessDenied":
          errorMessage = "Acceso denegado. Por favor, verifica tus credenciales."
          break
        case "Verification":
          errorMessage = "El enlace de verificación ha expirado o es inválido."
          break
        case "Configuration":
          errorMessage = "Hay un problema con la configuración del servidor."
          break
        case "OAuthSignin":
          errorMessage = "Error al iniciar sesión con Google. Por favor, intenta de nuevo."
          break
        default:
          errorMessage = `Error: ${error}`
          break
      }

      toast({
        title: "Error de autenticación",
        description: errorMessage,
        variant: "destructive",
      })
    }

    // Limpiar el token de invitación del localStorage después de usarlo
    return () => {
      localStorage.removeItem("invitationToken")
    }
  }, [error])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!isValidEmail(email)) {
      logger.warn("Intento de inicio de sesión con email inválido:", email)
      toast({
        title: "Error en el inicio de sesión",
        description: "Por favor, introduce un email válido.",
        variant: "destructive",
      })
      return
    }

    try {
      setIsLoading(true)
      logger.info("Iniciando sesión con credenciales para:", email)

      const result = await signIn("credentials", {
        redirect: false,
        email,
        password,
        callbackUrl: window.location.origin + callbackUrl,
      })

      if (result?.error) {
        logger.error("Error en inicio de sesión:", result.error)
        toast({
          title: "Error en el inicio de sesión",
          description: "Email o contraseña incorrectos. Por favor, verifica tus credenciales.",
          variant: "destructive",
        })
      } else {
        logger.info("Inicio de sesión exitoso para:", email)

        // Si hay un token de invitación, verificar si el usuario ya existe y asociarlo
        if (invitationToken) {
          try {
            const response = await fetch("/api/auth/associate-user", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ email, invitationToken }),
            })

            if (response.ok) {
              logger.info("Usuario asociado correctamente a casa")
            }
          } catch (error) {
            logger.error("Error al asociar usuario a casa:", error)
          }
        }

        router.push(callbackUrl)
        router.refresh()
      }
    } catch (error) {
      logger.error("Error inesperado en inicio de sesión:", error)
      toast({
        title: "Error en el inicio de sesión",
        description: "Ocurrió un error inesperado",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    try {
      setIsGoogleLoading(true)
      logger.info("Iniciando sesión con Google")

      // Si hay token de invitación, guardarlo en localStorage antes de redirigir
      if (invitationToken) {
        localStorage.setItem("invitationToken", invitationToken)
      }

      const baseUrl = window.location.origin
      const finalCallbackUrl = `${baseUrl}${callbackUrl}`

      logger.debug("URL de callback para Google:", finalCallbackUrl)

      await signIn("google", {
        callbackUrl: finalCallbackUrl,
      })
    } catch (error) {
      logger.error("Error al iniciar sesión con Google:", error)
      toast({
        title: "Error",
        description: "Ocurrió un error al intentar iniciar sesión con Google",
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
          <h1 className="text-2xl font-bold text-center">Planneat</h1>
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
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Iniciando sesión...
                </>
              ) : (
                "Iniciar Sesión"
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
                "Iniciar sesión con Google"
              )}
            </Button>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button variant="link" onClick={() => router.push("/register")} disabled={isLoading}>
            ¿No tienes una cuenta? Regístrate
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

