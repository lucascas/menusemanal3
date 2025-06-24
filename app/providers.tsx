"use client"

import type React from "react"

import { MockSessionProvider } from "@/components/MockSession"

export default function Providers({ children }: { children: React.ReactNode }) {
  return <MockSessionProvider>{children}</MockSessionProvider>
}
