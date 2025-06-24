"use client"

import { SessionProvider } from "next-auth/react"
import type React from "react"

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider basePath="/api/auth" refetchInterval={0}>
      {children}
    </SessionProvider>
  )
}

