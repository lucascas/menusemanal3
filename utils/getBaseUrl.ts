export function getBaseUrl() {
  // Verificar primero NEXT_PUBLIC_APP_URL para permitir override manual
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL
  }

  // Usar VERCEL_URL si está disponible
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }

  // Fallback para desarrollo local
  return "http://localhost:3000"
}
