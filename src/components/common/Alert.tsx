
import { AlertCircle, CheckCircle, XCircle, Info, X } from 'lucide-react'

interface AlertProps {
  type?: 'error' | 'success' | 'warning' | 'info'
  message: string
  onClose?: () => void
  showIcon?: boolean
}

export const Alert = ({
  type = 'error',
  message,
  onClose,
  showIcon = true,
}: AlertProps) => {
  const styles = {
    error: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-800',
      icon: <XCircle size={18} className="text-red-500" />,
    },
    success: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      text: 'text-green-800',
      icon: <CheckCircle size={18} className="text-green-500" />,
    },
    warning: {
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      text: 'text-amber-800',
      icon: <AlertCircle size={18} className="text-amber-500" />,
    },
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-800',
      icon: <Info size={18} className="text-blue-500" />,
    },
  }

  const current = styles[type]

  return (
    <div
      className={`flex items-start gap-3 p-4 rounded-lg border ${current.bg} ${current.border} ${current.text} transition-all duration-300 animate-in fade-in slide-in-from-top-1`}
      role="alert"
    >
      {showIcon && <div className="mt-0.5 shrink-0">{current.icon}</div>}
      <div className="flex-1 text-sm font-medium">{message}</div>
      {onClose && (
        <button
          onClick={onClose}
          className="ml-auto -mr-1.5 -mt-1.5 p-1.5 rounded-lg hover:bg-black/5 transition-colors"
          aria-label="Close"
        >
          <X size={16} className="opacity-60" />
        </button>
      )}
    </div>
  )
}
