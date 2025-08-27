import { useState } from "react"

interface Toast {
  id: string
  title: string
  description?: string
  variant?: "default" | "destructive" | "success"
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([])

  const toast = (newToast: Omit<Toast, 'id'>) => {
    console.log('useToast.toast called with:', newToast)
    const id = Math.random().toString(36).substr(2, 9)
    const toastWithId = { ...newToast, id }
    
    console.log('Adding toast to state:', toastWithId)
    setToasts(prev => {
      console.log('Current toasts:', prev)
      const newToasts = [...prev, toastWithId]
      console.log('New toasts array:', newToasts)
      return newToasts
    })
    
    // Auto remove after 5 seconds (longer duration)
    setTimeout(() => {
      console.log('Auto-removing toast:', id)
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 5000)
  }

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }

  return { toast, toasts, removeToast }
}