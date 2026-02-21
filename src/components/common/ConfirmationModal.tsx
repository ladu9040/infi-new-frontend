
import { X, AlertTriangle } from 'lucide-react'

interface ConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  type?: 'danger' | 'warning' | 'info'
  variant?: 'danger' | 'warning' | 'info'
}

export const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type,
  variant,
}: ConfirmationModalProps) => {
  if (!isOpen) return null

  const finalType = variant || type || 'warning'

  const typeConfig = {
    danger: {
      icon: <AlertTriangle className="text-red-600" size={24} />,
      btnClass: 'bg-red-600 hover:bg-red-700 shadow-red-100',
      iconBg: 'bg-red-50',
    },
    warning: {
      icon: <AlertTriangle className="text-amber-600" size={24} />,
      btnClass: 'bg-amber-600 hover:bg-amber-700 shadow-amber-100',
      iconBg: 'bg-amber-50',
    },
    info: {
      icon: <AlertTriangle className="text-blue-600" size={24} />,
      btnClass: 'bg-blue-600 hover:bg-blue-700 shadow-blue-100',
      iconBg: 'bg-blue-50',
    },
  }

  const config = typeConfig[finalType]

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-100">
        
        {/* Header with Close */}
        <div className="flex justify-end p-2 px-3">
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 pb-6 text-center">
          <div className={`mx-auto w-14 h-14 ${config.iconBg} rounded-full flex items-center justify-center mb-4`}>
            {config.icon}
          </div>
          
          <h3 className="text-xl font-bold text-slate-800 mb-2">{title}</h3>
          <p className="text-slate-500 text-sm leading-relaxed mb-6">
            {message}
          </p>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2.5 text-sm font-semibold text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-all"
            >
              {cancelText}
            </button>
            <button
              onClick={() => {
                onConfirm()
                onClose()
              }}
              className={`flex-1 px-4 py-2.5 text-sm font-bold text-white rounded-xl shadow-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] ${config.btnClass}`}
            >
              {confirmText}
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}
