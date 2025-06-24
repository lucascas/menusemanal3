"use client"

import type React from "react"

// Provider completamente mock sin dependencias de NextAuth
export default function Providers({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
