"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/MockSession"

const ConfiguracionCasa = () => {
  const router = useRouter()
  const [direccion, setDireccion] = useState("")
  const [ciudad, setCiudad] = useState("")
  const [codigoPostal, setCodigoPostal] = useState("")
  const [pais, setPais] = useState("")
  const [habitantes, setHabitantes] = useState(1)
  const [mascotas, setMascotas] = useState(false)

  // Antes
  // const { data } = useSession()
  // const user = data?.user

  // Después
  const { user } = useAuth()

  useEffect(() => {
    if (!user) {
      router.push("/")
    }
  }, [user, router])

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!user?.email) {
      console.error("User email is not available.")
      return
    }

    const casaData = {
      direccion,
      ciudad,
      codigoPostal,
      pais,
      habitantes,
      mascotas,
      email: user.email,
    }

    try {
      const response = await fetch("/api/casa", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(casaData),
      })

      if (response.ok) {
        // Redirect to dashboard or a success page
        router.push("/dashboard")
      } else {
        console.error("Error al guardar la configuración de la casa:", response.status)
      }
    } catch (error) {
      console.error("Error al enviar la solicitud:", error)
    }
  }

  if (!user) {
    return <div>Cargando...</div>
  }

  return (
    <div className="container mx-auto mt-8">
      <h1 className="text-2xl font-bold mb-4">Configuración de tu Casa</h1>
      <form onSubmit={handleSubmit} className="max-w-lg">
        <div className="mb-4">
          <label htmlFor="direccion" className="block text-gray-700 text-sm font-bold mb-2">
            Dirección:
          </label>
          <input
            type="text"
            id="direccion"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={direccion}
            onChange={(e) => setDireccion(e.target.value)}
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="ciudad" className="block text-gray-700 text-sm font-bold mb-2">
            Ciudad:
          </label>
          <input
            type="text"
            id="ciudad"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={ciudad}
            onChange={(e) => setCiudad(e.target.value)}
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="codigoPostal" className="block text-gray-700 text-sm font-bold mb-2">
            Código Postal:
          </label>
          <input
            type="text"
            id="codigoPostal"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={codigoPostal}
            onChange={(e) => setCodigoPostal(e.target.value)}
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="pais" className="block text-gray-700 text-sm font-bold mb-2">
            País:
          </label>
          <input
            type="text"
            id="pais"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={pais}
            onChange={(e) => setPais(e.target.value)}
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="habitantes" className="block text-gray-700 text-sm font-bold mb-2">
            Número de Habitantes:
          </label>
          <input
            type="number"
            id="habitantes"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={habitantes}
            onChange={(e) => setHabitantes(Number.parseInt(e.target.value, 10))}
            min="1"
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="mascotas" className="block text-gray-700 text-sm font-bold mb-2">
            ¿Tienes Mascotas?
          </label>
          <input
            type="checkbox"
            id="mascotas"
            className="shadow appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            checked={mascotas}
            onChange={(e) => setMascotas(e.target.checked)}
          />
        </div>
        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          Guardar Configuración
        </button>
      </form>
    </div>
  )
}

export default ConfiguracionCasa
