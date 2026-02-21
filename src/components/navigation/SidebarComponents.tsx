import { useState } from 'react'
import { ChevronDown, ChevronRight, type LucideIcon } from 'lucide-react'

interface SidebarItemProps {
  label: string
  icon: LucideIcon
  path?: string
  isActive?: boolean
  isCollapsed?: boolean
  onClick?: () => void
}

export const SidebarItem = ({
  label,
  icon: Icon,
  isActive,
  isCollapsed,
  onClick,
}: SidebarItemProps) => {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center px-3 py-2.5 rounded-lg transition-all ${
        isActive
          ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-600'
          : 'text-gray-700 hover:bg-gray-50'
      }`}
      title={isCollapsed ? label : ''}
    >
      <Icon className={`w-5 h-5 flex-shrink-0 ${isCollapsed ? '' : 'mr-3'}`} />
      {!isCollapsed && <span className="font-medium text-sm">{label}</span>}
    </button>
  )
}

interface SidebarGroupProps {
  label: string
  icon: LucideIcon
  children: React.ReactNode
  isCollapsed?: boolean
  defaultOpen?: boolean
}

export const SidebarGroup = ({
  label,
  icon: Icon,
  children,
  isCollapsed,
  defaultOpen = false,
}: SidebarGroupProps) => {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  if (isCollapsed) {
    return (
      <div className="px-3 py-2">
        <div className="border-t border-gray-200 my-2"></div>
      </div>
    )
  }

  return (
    <div className="mb-2">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
      >
        <div className="flex items-center">
          <Icon className="w-4 h-4 mr-2" />
          <span className="text-xs font-semibold uppercase tracking-wider">{label}</span>
        </div>
        {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
      </button>
      {isOpen && <div className="mt-1 space-y-1 pl-2">{children}</div>}
    </div>
  )
}
