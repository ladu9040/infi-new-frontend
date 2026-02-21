import React from 'react'
import {
  Route,
  Truck,
  MapPin,
  CreditCard,
  Package,
} from 'lucide-react'
import { SIDEBAR_ITEMS } from './Trans_Dashboard'

export const PlaceholderContent = ({ title }: any) => (
  <div className="bg-white rounded-2xl shadow border border-gray-200 p-12 text-center">
    <div className="w-20 h-20 bg-gradient-to-r from-amber-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
      {(() => {
        const item = SIDEBAR_ITEMS.find((item) => item.name === title)
        return item ? <item.icon size={32} className="text-amber-600" /> : null
      })()}
    </div>
    <h2 className="text-2xl font-semibold text-gray-800 mb-3">{title}</h2>
    <p className="text-gray-500 max-w-md mx-auto">
      Content for {title} will appear here. Manage your {title.toLowerCase()} settings, view
      analytics, and configure preferences.
    </p>
  </div>
)

export const DashboardContent = () => {
  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-amber-500 to-amber-500 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold mb-2">Good morning, Admin!</h2>
            <p className="opacity-90">24 routes planned today. All systems operational.</p>
          </div>
          <div className="flex gap-3">
            <button className="bg-white text-amber-600 px-4 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors">
              View Analytics
            </button>
            <button className="bg-white/20 backdrop-blur-sm border border-white/30 px-4 py-2 rounded-lg font-medium hover:bg-white/30 transition-colors">
              Generate Report
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Routes"
          value="24"
          change="+2 today"
          icon={<Route size={20} />}
          color="amber"
        />
        <StatsCard
          title="On Time %"
          value="94%"
          change="+3%"
          icon={<Truck size={20} />}
          color="green"
        />
        <StatsCard
          title="Total Miles"
          value="1,842"
          change="+72 mi"
          icon={<MapPin size={20} />}
          color="blue"
        />
        <StatsCard
          title="Cost"
          value="$12.4k"
          change="-4% saved"
          icon={<CreditCard size={20} />}
          color="red"
        />
      </div>

      {/* Map + Routes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 shadow border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-gray-800">Map Overview</h3>
            <div className="flex gap-2">
              <button className="text-xs border px-3 py-1.5 rounded-lg hover:bg-gray-50">
                Day
              </button>
              <button className="text-xs border px-3 py-1.5 rounded-lg bg-gray-100">Week</button>
              <button className="text-xs border px-3 py-1.5 rounded-lg hover:bg-gray-50">
                Month
              </button>
            </div>
          </div>
          <div className="h-[350px] bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center border border-gray-300">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-amber-400 to-amber-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin size={24} className="text-white" />
              </div>
              <p className="text-gray-600 font-medium">Interactive Map View</p>
              <p className="text-sm text-gray-500">Click to explore routes and stops</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-semibold text-gray-800">Recent Routes</h3>
          <RoutesCard />
          <RoutesCard />
          <RoutesCard />
        </div>
      </div>

      {/* Orders Table */}
      <OrdersTable />
    </div>
  )
}
const StatsCard = ({
  title,
  value,
  change,
  icon,
  color,
}: {
  title: string
  value: string
  change: string
  icon: React.ReactNode
  color: 'amber' | 'green' | 'blue' | 'red'
}) => {
  const colorClasses = {
    amber: 'from-amber-500 to-amber-600',
    green: 'from-green-500 to-green-600',
    blue: 'from-blue-500 to-blue-600',
    red: 'from-red-500 to-red-600',
  }

  return (
    <div className="bg-white p-5 rounded-2xl shadow border border-gray-200 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-2.5 bg-gradient-to-br ${colorClasses[color]} rounded-lg`}>
          {icon && React.cloneElement(icon as React.ReactElement)}
        </div>
        <span
          className={`text-xs px-2 py-1 rounded-full ${
            change.includes('+') ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
          }`}
        >
          {change}
        </span>
      </div>
      <p className="text-sm text-gray-500 mb-1">{title}</p>
      <h2 className="text-2xl font-bold text-gray-800 mb-2">{value}</h2>
    </div>
  )
}

export const RoutesCard = () => (
  <div className="bg-white p-4 rounded-xl shadow border border-gray-200 space-y-3 hover:shadow-md transition-shadow">
    <div className="flex justify-between items-start">
      <div>
        <p className="font-semibold text-gray-800">R-1042</p>
        <p className="text-xs text-gray-500">M Santos · 53' Dry Van</p>
      </div>
      <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded-full">On Time</span>
    </div>

    <div className="flex items-center gap-2 text-xs text-gray-600">
      <div className="flex items-center">
        <MapPin size={12} className="mr-1" />8 Stops
      </div>
      <div className="flex items-center">
        <Truck size={12} className="mr-1" />
        126mi
      </div>
    </div>

    <div className="grid grid-cols-3 gap-2 text-xs">
      <div className="text-center p-2 bg-gray-50 rounded">
        <p className="text-gray-500">Utilization</p>
        <p className="font-bold text-gray-800">4.5/5</p>
      </div>
      <div className="text-center p-2 bg-gray-50 rounded">
        <p className="text-gray-500">Cost</p>
        <p className="font-bold text-gray-800">$412</p>
      </div>
      <div className="text-center p-2 bg-gray-50 rounded">
        <p className="text-gray-500">CO₂</p>
        <p className="font-bold text-gray-800">28kg</p>
      </div>
    </div>

    <div className="flex gap-2 pt-2">
      <button className="flex-1 border border-gray-300 px-3 py-1.5 rounded-lg text-xs hover:bg-gray-50 transition-colors">
        Lock Route
      </button>
      <button className="flex-1 bg-gradient-to-r from-gray-900 to-black text-white px-3 py-1.5 rounded-lg text-xs hover:opacity-90 transition-opacity">
        Re-Optimize
      </button>
    </div>
  </div>
)

export const OrdersTable = () => (
  <div className="bg-white rounded-2xl shadow border border-gray-200 p-5">
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
      <div>
        <h3 className="font-semibold text-gray-800 text-lg">Orders Today</h3>
        <p className="text-sm text-gray-500">8 orders waiting for assignment</p>
      </div>
      <div className="flex gap-2">
        <button className="border border-gray-300 px-4 py-2 rounded-lg text-sm hover:bg-gray-50 transition-colors flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
          Import
        </button>
        <button className="bg-gradient-to-r from-gray-900 to-black text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity flex items-center gap-2">
          <Package size={16} />
          Auto Assign
        </button>
      </div>
    </div>

    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <table className="w-full text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="text-left p-3 text-gray-600 font-medium">Order</th>
            <th className="text-left p-3 text-gray-600 font-medium">Customer</th>
            <th className="text-left p-3 text-gray-600 font-medium">Time</th>
            <th className="text-left p-3 text-gray-600 font-medium">Type</th>
            <th className="text-left p-3 text-gray-600 font-medium">Status</th>
            <th className="text-left p-3 text-gray-600 font-medium">Route</th>
            <th className="text-left p-3 text-gray-600 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {Array.from({ length: 8 }).map((_, i) => (
            <tr key={i} className="hover:bg-gray-50 transition-colors">
              <td className="p-3 font-medium">SO-7812</td>
              <td className="p-3">Beta Foods</td>
              <td className="p-3">13:00 – 15:00</td>
              <td className="p-3">
                <span className="px-2 py-1 bg-blue-50 text-blue-600 rounded-full text-xs">
                  Premium
                </span>
              </td>
              <td className="p-3">
                <span className="px-2 py-1 bg-yellow-50 text-yellow-600 rounded-full text-xs">
                  Planned
                </span>
              </td>
              <td className="p-3 font-medium">R-1043</td>
              <td className="p-3">
                <button className="text-amber-600 hover:text-amber-800 text-xs font-medium">
                  Assign →
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
)


