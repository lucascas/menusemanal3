"use server"

import { getServerSession } from "next-auth/next"
import { authOptions } from "../api/auth/[...nextauth]/route"

function getBaseUrl() {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }
  return "http://localhost:3000"
}

export async function sendWeeklyMenuEmail(menu: any) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      throw new Error("No se encontró el email del usuario")
    }

    const templateParams = {
      to_email: session.user.email,
      subject: "Nuevo menú semanal",
      message: `
        <h1>Nuevo menú semanal</h1>
        <p>Se ha guardado un nuevo menú semanal para la fecha ${new Date().toLocaleDateString()}.</p>
        <h2>Menú:</h2>
        <ul>
          ${Object.entries(menu)
            .map(
              ([dia, comidas]: [string, any]) => `
                <li>
                  <strong>${dia}</strong>:
                  <ul>
                    <li>Almuerzo: ${comidas.Almuerzo || "No especificado"}</li>
                    <li>Cena: ${comidas.Cena || "No especificado"}</li>
                  </ul>
                </li>
              `,
            )
            .join("")}
        </ul>
      `,
    }

    if (!process.env.EMAILJS_SERVICE_ID || !process.env.EMAILJS_TEMPLATE_ID || !process.env.EMAILJS_PUBLIC_KEY) {
      throw new Error("EmailJS configuration is missing")
    }

    const url = "https://api.emailjs.com/api/v1.0/email/send"
    const data = {
      service_id: process.env.EMAILJS_SERVICE_ID,
      template_id: process.env.EMAILJS_TEMPLATE_ID,
      user_id: process.env.EMAILJS_PUBLIC_KEY,
      template_params: templateParams,
      accessToken: process.env.EMAILJS_PUBLIC_KEY,
    }

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        origin: "http://localhost",
      },
      body: JSON.stringify(data),
    })

    if (response.ok) {
      return { success: true, data: await response.text() }
    } else {
      const errorText = await response.text()
      throw new Error(`Failed to send weekly menu email: ${errorText}`)
    }
  } catch (error: any) {
    console.error("Error en sendWeeklyMenuEmail:", error)
    return {
      success: false,
      error: error.message || "Error desconocido al enviar el email",
    }
  }
}

export async function sendInvitationEmail(to: string, from: string, casaNombre: string, invitationToken: string) {
  try {
    if (!invitationToken) {
      throw new Error("Token de invitación no proporcionado")
    }

    const baseUrl = getBaseUrl()
    const invitationUrl = `${baseUrl}/register?invite=${invitationToken}`

    console.log("Sending invitation email with URL:", invitationUrl) // Para debugging

    const templateParams = {
      to_email: to,
      from_name: from,
      casa_nombre: casaNombre,
      invitation_link: invitationUrl,
      subject: `Invitación a unirse a ${casaNombre} en Semana de Comidas`,
      message: `
        <h1>Te han invitado a unirte a ${casaNombre}</h1>
        <p>${from} te ha invitado a unirte a su casa en la aplicación Semana de Comidas.</p>
        <p>Haz clic en el siguiente enlace para registrarte y unirte:</p>
        <a href="${invitationUrl}">Unirme a ${casaNombre}</a>
        <p>Este enlace expirará en 7 días.</p>
      `,
    }

    if (!process.env.EMAILJS_SERVICE_ID || !process.env.EMAILJS_TEMPLATE_ID || !process.env.EMAILJS_PUBLIC_KEY) {
      throw new Error("EmailJS configuration is missing")
    }

    const url = "https://api.emailjs.com/api/v1.0/email/send"
    const data = {
      service_id: process.env.EMAILJS_SERVICE_ID,
      template_id: process.env.EMAILJS_TEMPLATE_ID,
      user_id: process.env.EMAILJS_PUBLIC_KEY,
      template_params: templateParams,
      accessToken: process.env.EMAILJS_PUBLIC_KEY,
    }

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        origin: "http://localhost",
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Error al enviar el email de invitación: ${errorText}`)
    }

    return {
      success: true,
      data: await response.text(),
      token: invitationToken,
      url: invitationUrl, // Incluir la URL completa para debugging
    }
  } catch (error: any) {
    console.error("Error en sendInvitationEmail:", error)
    return {
      success: false,
      error: error.message || "Error desconocido al enviar el correo de invitación",
    }
  }
}

