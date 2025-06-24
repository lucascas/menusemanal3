"use client"

import { useState, useEffect } from "react"
import { AlertCircle, CheckCircle, XCircle } from "lucide-react"
import type React from "react"
import { Button } from "@/components/ui/button"

interface AlertBoxProps {
  message: string
  type: "success" | "error" | "info"
  duration?: number
  error?: string
  onViewError?: () => void
}

export const AlertBox: React.FC<AlertBoxProps> = ({ message, type, duration = 3000, error, onViewError }) => {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
    }, duration)

    return () => clearTimeout(timer)
  }, [duration])

  if (!isVisible) return null

  const getIcon = () => {
    switch (type) {
      case "success":
        return <CheckCircle className="h-6 w-6 text-green-500" />
      case "error":
        return <XCircle className="h-6 w-6 text-red-500" />
      case "info":
        return <AlertCircle className="h-6 w-6 text-blue-500" />
    }
  }

  const getBackgroundColor = () => {
    switch (type) {
      case "success":
        return "bg-green-100"
      case "error":
        return "bg-red-100"
      case "info":
        return "bg-blue-100"
    }
  }

  return (
    <div
      className={`fixed bottom-4 right-4 p-4 rounded-md shadow-md ${getBackgroundColor()} flex items-center space-x-2`}
    >
      {getIcon()}
      <span>{message}</span>
      {error && (
        <Button variant="link" onClick={onViewError} className="p-0 h-auto text-sm underline">
          Ver error
        </Button>
      )}
    </div>
  )
}

