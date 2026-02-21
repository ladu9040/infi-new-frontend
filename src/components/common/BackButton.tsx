import { ChevronLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

interface BackButtonProps {
  onClick?: () => void
  to?: string
  title?: string
  className?: string
}

export const BackButton = ({ onClick, to, title = 'Go Back', className = '' }: BackButtonProps) => {
  const navigate = useNavigate()

  const handleBack = () => {
    if (onClick) {
      onClick()
    } else if (to) {
      navigate(to)
    } else {
      navigate(-1)
    }
  }

  return (
    <button
      onClick={handleBack}
      className={`p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-500 hover:text-slate-800 flex items-center justify-center ${className}`}
      title={title}
    >
      <ChevronLeft size={20} />
    </button>
  )
}
