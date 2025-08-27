import { X, CheckCircle, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ToastProps {
  title: string
  description?: string
  variant?: 'default' | 'destructive' | 'success'
  onClose: () => void
}

export function Toast({ title, description, variant = 'default', onClose }: ToastProps) {
  const variantStyles = {
    default: 'bg-card border-border text-card-foreground',
    destructive: 'bg-destructive/10 border-destructive/20 text-destructive',
    success: 'bg-success/10 border-success/20 text-success'
  }

  const iconMap = {
    default: null,
    destructive: <AlertCircle className="w-5 h-5 text-destructive" />,
    success: <CheckCircle className="w-5 h-5 text-success" />
  }

  return (
    <div
      className={cn(
        'fixed top-4 right-4 z-50 w-96 p-4 rounded-xl border shadow-lg',
        'animate-slide-up backdrop-blur-lg',
        variantStyles[variant]
      )}
    >
      <div className="flex items-start gap-3">
        {iconMap[variant]}
        <div className="flex-1 space-y-1">
          <h4 className="font-semibold text-sm leading-tight">{title}</h4>
          {description && (
            <p className="text-sm opacity-80 leading-relaxed">{description}</p>
          )}
        </div>
        <button
          onClick={onClose}
          className="opacity-70 hover:opacity-100 transition-opacity"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

interface ToastContainerProps {
  toasts: Array<{
    id: string
    title: string
    description?: string
    variant?: 'default' | 'destructive' | 'success'
  }>
  onRemove: (id: string) => void
}

export function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  return (
    <>
      {toasts.map((toast, index) => (
        <div
          key={toast.id}
          style={{ 
            top: `${1 + index * 6.5}rem`,
            right: '1rem'
          }}
          className="fixed z-50"
        >
          <Toast
            title={toast.title}
            description={toast.description}
            variant={toast.variant}
            onClose={() => onRemove(toast.id)}
          />
        </div>
      ))}
    </>
  )
}