interface StatsCardProps {
  title: string
  value: string | number
  icon: React.ReactNode
  trend?: {
    value: number
    isPositive: boolean
  }
  color?: 'blue' | 'green' | 'amber' | 'red' | 'purple' | 'cyan'
  subtitle?: string
}

export const StatsCard = ({
  title,
  value,
  icon,
  trend,
  color = 'blue',
  subtitle,
}: StatsCardProps) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    amber: 'bg-amber-50 text-amber-600',
    red: 'bg-red-50 text-red-600',
    purple: 'bg-purple-50 text-purple-600',
    cyan: 'bg-cyan-50 text-cyan-600',
  }

  const trendColorClasses = trend?.isPositive
    ? 'text-green-600 bg-green-50'
    : 'text-red-600 bg-red-50'

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
          {trend && (
            <div
              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-2 ${trendColorClasses}`}
            >
              <span>
                {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
              </span>
            </div>
          )}
        </div>
        <div className={`p-4 rounded-full ${colorClasses[color]}`}>{icon}</div>
      </div>
    </div>
  )
}
