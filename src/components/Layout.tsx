import { gql } from '@apollo/client'
import { useQuery } from '@apollo/client/react'
import {
  Activity,
  BarChart3,
  Bell,
  ChevronDown,
  CircleDollarSign,
  CreditCard,
  FileText,
  Folder,
  Landmark,
  LayoutDashboard,
  LogIn,
  LogOut,
  Menu,
  Package,
  Plus,
  Search,
  Settings,
  TrendingUp,
  Truck,
  Users,
  X,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'
import { SidebarGroup, SidebarItem } from './navigation/SidebarComponents'

interface GetFollowUpData {
  followUpData: {
    vendorKycStatus: string
    vendorBankStatus: string
  }
}

const FOLLOWUP_DATA = gql`
  query followUpData($vendorId: String!) {
    followUpData(vendorId: $vendorId) {
      vendorKycStatus
      vendorBankStatus
    }
  }
`

export const Layout = () => {
  const { user, logout } = useAuth()
  const location = useLocation()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false)
  const vendorId = user?.vendorId
  const { data } = useQuery<GetFollowUpData>(FOLLOWUP_DATA, {
    variables: { vendorId },
    skip: !vendorId,
  })
  const navigate = useNavigate()
  const hasOnboarded =
    data?.followUpData.vendorBankStatus === 'APPROVED' &&
    data?.followUpData.vendorKycStatus === 'APPROVED'

  useEffect(() => {
    if (hasOnboarded) {
      navigate('/')
    }
  }, [hasOnboarded])

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Enhanced Sidebar with Nested Navigation */}
      <aside
        className={`bg-white shadow-lg transition-all duration-300 ease-in-out ${
          sidebarCollapsed ? 'w-20' : 'w-64'
        } flex flex-col border-r border-gray-200`}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          {!sidebarCollapsed && (
            <div className="flex items-center">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">I</span>
              </div>
              <h1 className="ml-3 text-xl font-bold text-gray-900">Infi Logistics</h1>
            </div>
          )}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {sidebarCollapsed ? <Menu className="w-5 h-5" /> : <X className="w-5 h-5" />}
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="mt-4 flex-1 overflow-y-auto px-3 space-y-1">
          {!hasOnboarded && !user?.roles.includes('SUPER_ADMIN') && (
            <Link to="/vendor-onboarding">
              <SidebarItem
                label="Vendor Onboarding"
                icon={LayoutDashboard}
                isActive={location.pathname === '/vendor-onboarding'}
                isCollapsed={sidebarCollapsed}
              />
            </Link>
          )}

          {hasOnboarded && (
            <>
              <Link to="/">
                <SidebarItem
                  label="Dashboard"
                  icon={LayoutDashboard}
                  isActive={location.pathname === '/'}
                  isCollapsed={sidebarCollapsed}
                />
              </Link>

              {/* Operations Group */}
              <SidebarGroup
                label="Operations"
                icon={Package}
                isCollapsed={sidebarCollapsed}
                defaultOpen={true}
              >
                {user?.roles?.some((role) => ['ADMIN', 'TRANSPORT_MANAGER'].includes(role)) && (
                  <>
                    <Link to="/orders">
                      <SidebarItem
                        label="Order Plan"
                        icon={FileText}
                        isActive={location.pathname === '/orders'}
                        isCollapsed={sidebarCollapsed}
                      />
                    </Link>
                    <Link to="/indents">
                      <SidebarItem
                        label="Indent Allocation"
                        icon={Truck}
                        isActive={location.pathname === '/indents'}
                        isCollapsed={sidebarCollapsed}
                      />
                    </Link>
                  </>
                )}
                {user?.roles?.some((role) => ['ADMIN', 'GATE_OPERATOR'].includes(role)) && (
                  <>
                    <Link to="/gate-entry">
                      <SidebarItem
                        label="Gate Entry"
                        icon={LogIn}
                        isActive={location.pathname === '/gate-entry'}
                        isCollapsed={sidebarCollapsed}
                      />
                    </Link>
                    <Link to="/gate-exit">
                      <SidebarItem
                        label="Gate Exit"
                        icon={LogOut}
                        isActive={location.pathname === '/gate-exit'}
                        isCollapsed={sidebarCollapsed}
                      />
                    </Link>
                  </>
                )}
              </SidebarGroup>

              {/* Analytics Group */}
              <SidebarGroup label="Analytics" icon={TrendingUp} isCollapsed={sidebarCollapsed}>
                <SidebarItem label="Reports" icon={BarChart3} isCollapsed={sidebarCollapsed} />
                <SidebarItem label="Performance" icon={TrendingUp} isCollapsed={sidebarCollapsed} />
              </SidebarGroup>

              {/* Masters Group */}
              <SidebarGroup label="Masters" icon={Folder} isCollapsed={sidebarCollapsed}>
                <Link to="/transporters">
                  <SidebarItem
                    label="Transporters"
                    icon={Truck}
                    isActive={location.pathname === '/transporters'}
                    isCollapsed={sidebarCollapsed}
                  />
                </Link>
                <Link to="/vehicles">
                  <SidebarItem
                    label="Vehicles"
                    icon={Package}
                    isActive={location.pathname === '/vehicles'}
                    isCollapsed={sidebarCollapsed}
                  />
                </Link>
              </SidebarGroup>

              {/* Transporters Group */}
              <SidebarGroup label="Transporters" icon={Truck} isCollapsed={sidebarCollapsed}>
                <Link to="/rate-master">
                  <SidebarItem
                    label="Rate Master"
                    icon={CircleDollarSign}
                    isActive={location.pathname === '/rate-master'}
                    isCollapsed={sidebarCollapsed}
                  />
                </Link>
              </SidebarGroup>

              {/* Administration Group - Admin Only */}
              {user?.roles?.some((role) => ['ADMIN'].includes(role)) && (
                <SidebarGroup label="Administration" icon={Settings} isCollapsed={sidebarCollapsed}>
                  <Link to="/users">
                    <SidebarItem
                      label="Users"
                      icon={Users}
                      isActive={location.pathname === '/users'}
                      isCollapsed={sidebarCollapsed}
                    />
                  </Link>
                  <Link to="/admin/vendors">
                    <SidebarItem
                      label="Vendors"
                      icon={Users}
                      isActive={location.pathname === '/admin/vendors'}
                      isCollapsed={sidebarCollapsed}
                    />
                  </Link>
                  <Link to="/audit">
                    <SidebarItem
                      label="Audit Logs"
                      icon={Activity}
                      isActive={location.pathname === '/audit'}
                      isCollapsed={sidebarCollapsed}
                    />
                  </Link>
                  <Link to="/settings">
                    <SidebarItem
                      label="Settings"
                      icon={Settings}
                      isActive={location.pathname === '/settings'}
                      isCollapsed={sidebarCollapsed}
                    />
                  </Link>
                </SidebarGroup>
              )}
            </>
          )}

          {user?.roles.includes('SUPER_ADMIN') && (
            <>
              <Link to="/admin/vendors">
                <SidebarItem
                  label="Vendors"
                  icon={Truck}
                  isActive={location.pathname === '/admin/vendors'}
                  isCollapsed={sidebarCollapsed}
                />
              </Link>
              <Link to="/admin/kyc-approvals">
                <SidebarItem
                  label="KYC Approvals"
                  icon={CreditCard}
                  isActive={location.pathname === '/admin/kyc-approvals'}
                  isCollapsed={sidebarCollapsed}
                />
              </Link>
              <Link to="/admin/bank-approvals">
                <SidebarItem
                  label="Bank Approvals"
                  icon={Landmark}
                  isActive={location.pathname === '/admin/bank-approvals'}
                  isCollapsed={sidebarCollapsed}
                />
              </Link>
            </>
          )}
        </nav>

        {/* Sidebar Footer */}
        {!sidebarCollapsed && (
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <span className="text-blue-600 font-semibold">
                  {user?.name?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="ml-3 flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
                <p className="text-xs text-gray-500 truncate">
                  {user?.roles.map((role, index) => (
                    <span key={index}>
                      {index > 0 && ', '}
                      {role}
                    </span>
                  ))}
                </p>
              </div>
            </div>
          </div>
        )}
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Enhanced Top Bar */}
        <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
          <div className="px-6 py-3">
            <div className="flex items-center justify-between">
              {/* Left: Page Title */}
              <div>
                <h2 className="text-xl font-semibold text-gray-800">
                  {location.pathname === '/'
                    ? 'Dashboard'
                    : location.pathname === '/orders'
                      ? 'Order Plan'
                      : location.pathname === '/indents'
                        ? 'Indent Allocation'
                        : location.pathname === '/entry'
                          ? 'Gate Entry'
                          : location.pathname === '/exit'
                            ? 'Gate Exit'
                            : location.pathname === '/users'
                              ? 'Users'
                              : location.pathname === '/audit'
                                ? 'Audit Logs'
                                : 'Dashboard'}
                </h2>
              </div>

              {/* Center: Quick Actions & Search */}
              <div className="hidden lg:flex items-center space-x-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search..."
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
                  />
                </div>
                <button className="flex items-center px-3 py-2 text-sm text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
                  <Plus className="w-4 h-4 mr-1" />
                  New Order
                </button>
              </div>

              {/* Right: Notifications & User Profile */}
              <div className="flex items-center space-x-3">
                {/* Notification Icon */}
                <button
                  className="relative p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Notifications"
                >
                  <Bell className="w-5 h-5" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>

                {/* User Profile Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                    className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <span className="text-blue-600 font-semibold text-sm">
                        {user?.name?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="hidden md:block text-left">
                      <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                      <p className="text-xs text-gray-500">
                        {user?.roles.map((role, index) => (
                          <span key={index}>
                            {index > 0 && ', '}
                            {role}
                          </span>
                        ))}
                      </p>
                    </div>
                    <ChevronDown
                      className={`w-4 h-4 text-gray-500 transition-transform ${
                        profileDropdownOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  {/* Dropdown Menu */}
                  {profileDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                      <div className="px-4 py-3 border-b border-gray-200">
                        <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                        <p className="text-xs text-gray-500">{user?.email}</p>
                        <p className="text-xs text-blue-600 mt-1">
                          {user?.roles.map((role, index) => (
                            <span>
                              {index > 0 && ', '}
                              {role}
                            </span>
                          ))}
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          logout()
                          setProfileDropdownOpen(false)
                        }}
                        className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="w-4 h-4 mr-3" />
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
