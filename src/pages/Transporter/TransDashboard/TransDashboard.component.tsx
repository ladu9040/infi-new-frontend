import React from 'react'
import {
  Route,
  Truck,
  MapPin,
  CreditCard,
  Package,
  Calendar,
  ArrowUpRight,
  TrendingUp,
  BarChart3,
  Clock
} from 'lucide-react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie
} from 'recharts'
import { SIDEBAR_ITEMS } from './Trans_Dashboard'

// Mock data for charts
const chartData = [
  { name: 'Mon', shipments: 24, freight: 4000 },
  { name: 'Tue', shipments: 35, freight: 5500 },
  { name: 'Wed', shipments: 30, freight: 4800 },
  { name: 'Thu', shipments: 45, freight: 7200 },
  { name: 'Fri', shipments: 42, freight: 6800 },
  { name: 'Sat', shipments: 18, freight: 3200 },
  { name: 'Sun', shipments: 12, freight: 2100 },
];

const statusData = [
  { name: 'Allocated', value: 45, color: '#10b981' },
  { name: 'Pending', value: 30, color: '#f59e0b' },
  { name: 'In Transit', value: 20, color: '#3b82f6' },
  { name: 'Cancelled', value: 5, color: '#ef4444' },
];

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

export const DashboardContent = ({ stats, user }: any) => {
  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      {/* Welcome Banner - Premium Yellow Theme */}
      <div className="relative overflow-hidden bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 rounded-3xl p-8 text-gray-900 shadow-xl border border-amber-300">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/30 blur-[100px] -mr-32 -mt-32"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-orange-400/20 blur-[100px] -ml-32 -mb-32"></div>
        
        <div className="relative flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="text-center md:text-left">
            <h2 className="text-3xl md:text-4xl font-bold mb-3 tracking-tight text-gray-900">
              Welcome back, <span className="text-white drop-shadow-md">{user?.name || 'Partner'}</span>
            </h2>
            <p className="text-amber-950/80 text-lg max-w-xl font-medium">
              You have <span className="text-gray-900 font-bold">{stats.pendingOrdersCount} new orders</span> awaiting allocation. 
              Your fleet activity is up <span className="text-amber-950 font-bold">12%</span> this week.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-4">
            <button className="bg-gray-900 hover:bg-black text-white px-6 py-3 rounded-xl font-semibold transition-all transform hover:scale-105 shadow-lg flex items-center gap-2">
              <TrendingUp size={18} />
              Live Analytics
            </button>
            <button className="bg-white/20 backdrop-blur-md border border-white/30 text-gray-900 px-6 py-3 rounded-xl font-semibold hover:bg-white/30 transition-all flex items-center gap-2">
              <BarChart3 size={18} />
              Export Report
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards - Sharp Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Routes"
          value={stats.totalRoutes}
          trend="+12%"
          trendUp={true}
          icon={<Route size={24} />}
          gradient="from-amber-500 to-orange-600"
          subtitle="Monthly active routes"
        />
        <StatCard
          title="On-Time Delivery"
          value={stats.onTimePercentage}
          trend="+2.4%"
          trendUp={true}
          icon={<Clock size={24} />}
          gradient="from-emerald-500 to-teal-600"
          subtitle="Performance efficiency"
        />
        <StatCard
          title="Total Shipments"
          value={stats.totalShipments}
          trend="-3%"
          trendUp={false}
          icon={<Package size={24} />}
          gradient="from-blue-500 to-indigo-600"
          subtitle="Processed LRs"
        />
        <StatCard
          title="Revenue"
          value={`₹ ${(stats.totalFreight / 1000).toFixed(1)}k`}
          trend="+8%"
          trendUp={true}
          icon={<CreditCard size={24} />}
          gradient="from-rose-500 to-pink-600"
          subtitle="Gross freight value"
        />
      </div>

      {/* Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Shipping Trends Chart */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Shipping Trends</h3>
              <p className="text-sm text-gray-500">Daily shipment volume analysis</p>
            </div>
            <select className="bg-gray-50 border border-gray-200 text-sm rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-amber-500">
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
            </select>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorShip" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#94a3b8', fontSize: 12}}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#94a3b8', fontSize: 12}}
                />
                <Tooltip 
                  contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}}
                />
                <Area 
                  type="monotone" 
                  dataKey="shipments" 
                  stroke="#f59e0b" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorShip)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Order Distribution Chart */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">Order Status</h3>
          <p className="text-sm text-gray-500 mb-6">Current allocation distribution</p>
          <div className="h-[250px] w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={8}
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
              <p className="text-2xl font-bold text-gray-900">{stats.pendingOrdersCount + stats.totalShipments}</p>
              <p className="text-[10px] text-gray-500 uppercase font-semibold tracking-widest">Total</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4">
            {statusData.map((item) => (
              <div key={item.name} className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-gray-700 truncate">{item.name}</p>
                  <p className="text-[10px] text-gray-500">{item.value}%</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Grid: Recent Activity & Pending Tasks */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Pending Orders Table */}
        <div className="xl:col-span-3 bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-50 flex justify-between items-center">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Pending Allocations</h3>
              <p className="text-sm text-gray-500">Awaiting vehicle assignment</p>
            </div>
            <button className="text-amber-600 hover:text-amber-700 text-sm font-bold flex items-center gap-1">
              View All <ArrowUpRight size={16} />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50/50 text-gray-500 font-bold uppercase text-[10px] tracking-widest">
                <tr>
                  <th className="px-6 py-4">Indent ID</th>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Vehicle Type</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {stats.pendingIndents.map((indent: any) => (
                  <tr key={indent.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-bold text-gray-900">{indent.indentId}</td>
                    <td className="px-6 py-4 text-gray-600">{indent.customerName}</td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-bold ring-1 ring-blue-100 italic">
                        {indent.vehicleType}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></div>
                        <span className="text-amber-700 text-xs font-bold uppercase">{indent.status}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="bg-gray-900 text-white px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-black transition-all">
                        Assign
                      </button>
                    </td>
                  </tr>
                ))}
                {stats.pendingIndents.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-400 font-medium italic">
                      No pending orders at the moment.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Updates Scroll */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col h-full">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Recent Indents</h3>
          <div className="space-y-4 overflow-y-auto pr-2 custom-scrollbar">
            {stats.recentIndents.map((indent: any) => (
              <div key={indent.id} className="group p-4 rounded-2xl bg-gray-50 hover:bg-amber-50 border border-transparent hover:border-amber-100 transition-all cursor-pointer">
                <div className="flex justify-between items-start mb-2">
                  <p className="font-bold text-gray-900 group-hover:text-amber-700 transition-colors">{indent.indentId}</p>
                  <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${
                    indent.status === 'ALLOCATED' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {indent.status}
                  </span>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-gray-500 flex items-center gap-1.5">
                    <MapPin size={10} /> {indent.customerName}
                  </p>
                  <p className="text-xs text-gray-400 flex items-center gap-1.5">
                    <Calendar size={10} /> {new Date(parseInt(indent.createdAt)).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
            {stats.recentIndents.length === 0 && (
              <div className="py-12 text-center text-gray-400 italic text-sm">
                No activity yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

const StatCard = ({ title, value, trend, trendUp, icon, gradient, subtitle }: any) => (
  <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
    <div className="flex justify-between items-start mb-6">
      <div className={`p-3 bg-gradient-to-br ${gradient} rounded-2xl text-white shadow-lg`}>
        {icon}
      </div>
      <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
        trendUp ? 'bg-green-50 text-green-600 ring-1 ring-green-100' : 'bg-red-50 text-red-600 ring-1 ring-red-100'
      }`}>
        {trendUp ? <ArrowUpRight size={12} /> : null} {trend}
      </div>
    </div>
    <div>
      <h2 className="text-3xl font-bold text-gray-900 mb-1 tracking-tight">{value}</h2>
      <p className="text-sm font-semibold text-gray-500 mb-0.5">{title}</p>
      <p className="text-[10px] uppercase font-bold tracking-widest text-gray-400">{subtitle}</p>
    </div>
  </div>
)
