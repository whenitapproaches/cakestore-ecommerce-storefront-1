"use client"

import { createContext, useContext, useState, useCallback, ReactNode } from "react"
import ToastNotification from "components/ToastNotification"

interface ToastContextType {
  showToast: (message: string, duration?: number, variant?: "success" | "error") => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export const useToast = () => {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider")
  }
  return context
}

interface ToastProviderProps {
  children: ReactNode
}

export const ToastProvider = ({ children }: ToastProviderProps) => {
  const [isVisible, setIsVisible] = useState(false)
  const [message, setMessage] = useState("")
  const [duration, setDuration] = useState(3000)
  const [variant, setVariant] = useState<"success" | "error">("success")

  const showToast = useCallback((newMessage: string, newDuration: number = 3000, newVariant: "success" | "error" = "success") => {
    setMessage(newMessage)
    setDuration(newDuration)
    setVariant(newVariant)
    setIsVisible(true)
  }, [])

  const hideToast = useCallback(() => {
    setIsVisible(false)
  }, [])

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <ToastNotification
        message={message}
        isVisible={isVisible}
        onClose={hideToast}
        duration={duration}
        variant={variant}
      />
    </ToastContext.Provider>
  )
}
