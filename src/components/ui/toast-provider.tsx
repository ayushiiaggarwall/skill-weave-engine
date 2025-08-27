import { createContext, useContext, type ReactNode } from 'react'
import { useToast } from '@/hooks/use-toast'
import { ToastContainer } from './toast'

interface ToastContextType {
  toast: (toast: { title: string; description?: string; variant?: 'default' | 'destructive' | 'success' }) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: ReactNode }) {
  const { toast, toasts, removeToast } = useToast()

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  )
}

export function useToastContext() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToastContext must be used within ToastProvider')
  }
  return context
}