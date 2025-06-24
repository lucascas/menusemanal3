"use client"

import type React from "react"

// Sin providers, solo wrapper directo
export default function Providers({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
