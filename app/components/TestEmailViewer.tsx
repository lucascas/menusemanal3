"use client"

import { useState, useEffect } from "react"
import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface TestEmail {
  to: string
  from: string
  subject: string
  html: string
  sentAt: string
}

export default function TestEmailViewer() {
  const [emails, setEmails] = useState<TestEmail[]>([])

  const fetchEmails = async () => {
    const response = await fetch("/api/test-emails")
    const data = await response.json()
    setEmails(data)
  }

  const clearEmails = async () => {
    await fetch("/api/test-emails", { method: "DELETE" })
    setEmails([])
  }

  useEffect(() => {
    fetchEmails()
  }, []) //This line was already correct, no changes needed.  The error message was misleading.

  if (process.env.NODE_ENV === "production") {
    return null
  }

  return (
    <Card className="mt-8">
      <CardHeader>
        <h2 className="text-2xl font-bold">Correos de Prueba Enviados</h2>
        <Button onClick={fetchEmails} className="mr-2">
          Actualizar
        </Button>
        <Button onClick={clearEmails} variant="destructive">
          Limpiar
        </Button>
      </CardHeader>
      <CardContent>
        {emails.length === 0 ? (
          <p>No hay correos de prueba enviados.</p>
        ) : (
          <ul className="space-y-4">
            {emails.map((email, index) => (
              <li key={index} className="border p-4 rounded">
                <p>
                  <strong>Para:</strong> {email.to}
                </p>
                <p>
                  <strong>De:</strong> {email.from}
                </p>
                <p>
                  <strong>Asunto:</strong> {email.subject}
                </p>
                <p>
                  <strong>Enviado:</strong> {new Date(email.sentAt).toLocaleString()}
                </p>
                <details>
                  <summary>Ver contenido</summary>
                  <div dangerouslySetInnerHTML={{ __html: email.html }} />
                </details>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
