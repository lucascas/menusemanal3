"use client"

import { useState } from "react"
import ApiKeyManager from "@/app/components/ApiKeyManager"
import { Button } from "@/components/ui/button"
import { ChevronRight, Home, Settings, LogOut, ChevronDown, Key } from "lucide-react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Collapsible, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { useIsMobile } from "@/hooks/use-mobile"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function ApiKeysPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const [isEndpointsOpen, setIsEndpointsOpen] = useState(true)
  const [isAuthOpen, setIsAuthOpen] = useState(true)
  const [isExamplesOpen, setIsExamplesOpen] = useState(true)
  const [activeTab, setActiveTab] = useState("keys")
  const isMobile = useIsMobile()

  const navItems = [
    { icon: <Home className="h-5 w-5" />, label: "Home", onClick: () => router.push("/?tab=planner") },
    {
      icon: <Settings className="h-5 w-5" />,
      label: "Configuración",
      onClick: () => router.push("/configuracion-casa"),
    },
    { icon: <Key className="h-5 w-5" />, label: "API", onClick: () => router.push("/configuracion/api"), active: true },
    { icon: <LogOut className="h-5 w-5" />, label: "Cerrar sesión", onClick: () => router.push("/login") },
  ]

  // Mobile view
  if (isMobile) {
    return (
      <div className="pb-16">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="keys">Claves</TabsTrigger>
            <TabsTrigger value="endpoints">Endpoints</TabsTrigger>
            <TabsTrigger value="examples">Ejemplos</TabsTrigger>
          </TabsList>

          {/* Keys Tab */}
          <TabsContent value="keys" className="space-y-4">
            <Card className="shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium">Claves API</h3>
                </div>
                <ApiKeyManager />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Endpoints Tab */}
          <TabsContent value="endpoints" className="space-y-4">
            <Card className="shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium">Endpoint para obtener comidas</h3>
                </div>
                <p className="text-gray-700 mb-2">Obtiene las comidas planificadas en un rango de fechas.</p>
                <div className="bg-gray-800 text-white p-3 rounded text-sm overflow-auto">
                  <code>GET /api/public/meals?startDate=2023-04-01&endDate=2023-04-07</code>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium">Autenticación</h3>
                </div>
                <p className="text-gray-700 mb-2">
                  Todas las solicitudes deben incluir tu clave API en el encabezado <code>x-api-key</code>.
                </p>
                <div className="bg-gray-800 text-white p-3 rounded text-sm overflow-auto">
                  <code>x-api-key: tu-clave-api</code>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Examples Tab */}
          <TabsContent value="examples" className="space-y-4">
            <Card className="shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium">Ejemplo de respuesta</h3>
                </div>
                <div className="bg-gray-800 text-white p-3 rounded text-sm overflow-auto">
                  <pre className="text-xs">
                    {`[
  {
    "date": "2023-04-03",
    "dayOfWeek": "lunes",
    "meals": {
      "lunch": "Ensalada de pollo",
      "dinner": "Pasta con salsa boloñesa"
    }
  },
  {
    "date": "2023-04-04",
    "dayOfWeek": "martes",
    "meals": {
      "lunch": "Salmón con espárragos",
      "dinner": "Tortilla española"
    }
  }
]`}
                  </pre>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium">Ejemplo de uso</h3>
                </div>
                <div className="bg-gray-800 text-white p-3 rounded text-sm overflow-auto">
                  <pre className="text-xs">
                    {`// JavaScript
fetch('https://planneat.vercel.app/api/public/meals?startDate=2023-04-01&endDate=2023-04-07', {
  headers: {
    'x-api-key': 'tu-clave-api'
  }
})
.then(response => response.json())
.then(data => console.log(data))
.catch(error => console.error('Error:', error));`}
                  </pre>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Fixed bottom navigation for mobile */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-2 flex justify-around z-20">
          <Button
            variant={activeTab === "keys" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("keys")}
            className="flex flex-col items-center text-xs py-1 h-auto"
          >
            <Key className="h-5 w-5 mb-1" />
            <span>Claves</span>
          </Button>
          <Button
            variant={activeTab === "endpoints" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("endpoints")}
            className="flex flex-col items-center text-xs py-1 h-auto"
          >
            <Settings className="h-5 w-5 mb-1" />
            <span>Endpoints</span>
          </Button>
          <Button
            variant={activeTab === "examples" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("examples")}
            className="flex flex-col items-center text-xs py-1 h-auto"
          >
            <Home className="h-5 w-5 mb-1" />
            <span>Ejemplos</span>
          </Button>
        </div>
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
              <h2 className="text-lg font-medium">Documentación API</h2>
            </div>
            <div className="p-2">
              <Collapsible open={isEndpointsOpen} onOpenChange={setIsEndpointsOpen}>
                <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-gray-50 rounded">
                  <div className="flex items-center">
                    <span className="font-medium">Endpoints</span>
                  </div>
                  <Badge variant="outline" className="ml-auto mr-2">
                    1
                  </Badge>
                  {isEndpointsOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </CollapsibleTrigger>
              </Collapsible>

              <Collapsible open={isAuthOpen} onOpenChange={setIsAuthOpen}>
                <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-gray-50 rounded">
                  <div className="flex items-center">
                    <span className="font-medium">Autenticación</span>
                  </div>
                  <Badge variant="outline" className="ml-auto mr-2">
                    1
                  </Badge>
                  {isAuthOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </CollapsibleTrigger>
              </Collapsible>

              <Collapsible open={isExamplesOpen} onOpenChange={setIsExamplesOpen}>
                <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-gray-50 rounded">
                  <div className="flex items-center">
                    <span className="font-medium">Ejemplos</span>
                  </div>
                  <Badge variant="outline" className="ml-auto mr-2">
                    2
                  </Badge>
                  {isExamplesOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </CollapsibleTrigger>
              </Collapsible>
            </div>
          </div>
        </div>

        {/* Right Column - Content */}
        <div className="col-span-2">
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium">Claves API</h3>
                <Badge variant="outline">Gestión</Badge>
              </div>
              <ApiKeyManager />
            </CardContent>
          </Card>

          {isEndpointsOpen && (
            <Card className="mb-6">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium">Endpoint para obtener comidas</h3>
                  <Badge variant="outline">Endpoints</Badge>
                </div>
                <p className="text-gray-700 mb-2">Obtiene las comidas planificadas en un rango de fechas.</p>
                <div className="bg-gray-800 text-white p-3 rounded">
                  <code>GET /api/public/meals?startDate=2023-04-01&endDate=2023-04-07</code>
                </div>
              </CardContent>
            </Card>
          )}

          {isAuthOpen && (
            <Card className="mb-6">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium">Autenticación</h3>
                  <Badge variant="outline">Seguridad</Badge>
                </div>
                <p className="text-gray-700 mb-2">
                  Todas las solicitudes deben incluir tu clave API en el encabezado <code>x-api-key</code>.
                </p>
                <div className="bg-gray-800 text-white p-3 rounded">
                  <code>x-api-key: tu-clave-api</code>
                </div>
              </CardContent>
            </Card>
          )}

          {isExamplesOpen && (
            <>
              <Card className="mb-6">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium">Ejemplo de respuesta</h3>
                    <Badge variant="outline">Ejemplos</Badge>
                  </div>
                  <div className="bg-gray-800 text-white p-3 rounded overflow-auto">
                    <pre>
                      {`[
  {
    "date": "2023-04-03",
    "dayOfWeek": "lunes",
    "meals": {
      "lunch": "Ensalada de pollo",
      "dinner": "Pasta con salsa boloñesa"
    }
  },
  {
    "date": "2023-04-04",
    "dayOfWeek": "martes",
    "meals": {
      "lunch": "Salmón con espárragos",
      "dinner": "Tortilla española"
    }
  }
]`}
                    </pre>
                  </div>
                </CardContent>
              </Card>

              <Card className="mb-6">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium">Ejemplo de uso</h3>
                    <Badge variant="outline">Ejemplos</Badge>
                  </div>
                  <div className="bg-gray-800 text-white p-3 rounded overflow-auto">
                    <pre>
                      {`// JavaScript
fetch('https://planneat.vercel.app/api/public/meals?startDate=2023-04-01&endDate=2023-04-07', {
  headers: {
    'x-api-key': 'tu-clave-api'
  }
})
.then(response => response.json())
.then(data => console.log(data))
.catch(error => console.error('Error:', error));`}
                    </pre>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

