"use client"

import { SessionProvider } from "next-auth/react"
import type React from "react" // Added import for React

export function Providers({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>
}
