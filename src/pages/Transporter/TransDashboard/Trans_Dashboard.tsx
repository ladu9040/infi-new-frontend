'use client'

import { useState, useContext } from 'react'
import { AuthContext } from '../../../context/AuthContextObject'
import {
  Menu,
  LayoutDashboard,
  Package,
  Truck,
  Calendar,
  MapPin,
  Users,
  Car,
  Building,
  FileText,
  CreditCard,
  Tag,
  Route,
  BarChart,
  Settings,
  Plug,
  LogOut,
  FilePlus,
  ArrowLeftRight,
  ShieldCheck,
  ShieldAlert,
  Info,
  Globe,
  Briefcase
} from 'lucide-react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Vendor_List } from '../Pages/vendors/vendorList/vendor_list'
import { Create_Vendor } from '../Pages/vendors/createVendor/create_vendor'
import { DashboardContent, PlaceholderContent } from './TransDashboard.component'
import AddRoute from '../Pages/Add_Routes/AddRoute'
import { VehicleMaster } from '../Pages/Add_Routes/VehicleMaster'
import { QuotationList } from '../Quotation/QuotationList/quotationList'
import { CreateQuotation } from '../Quotation/createQuotation/createQuotation'
import { VehicleAllocationList } from '../VehicleAllocation/VehicleAllocationList'
import { AllocateVehicleModal } from '../VehicleAllocation/AllocateVehicleModal'
import { ShipmentRegister } from '../LR/ShipmentRegister'
import { CreateLRModal } from '../LR/CreateLRModal'
import { IndentList } from '../Indent/IndentList'
import { InvoiceDashboard } from '../Invoice/InvoiceDashboard'

const humanize = (str?: string) => {
  if (!str) return '';
  return str
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

export const SIDEBAR_ITEMS = [
  { name: 'Dashboard', icon: LayoutDashboard },
  { name: 'Vehicle Allocation', icon: ArrowLeftRight },
  { name: 'LRs', icon: FileText },
  { name: 'Invoices', icon: FilePlus },
  { name: 'Quotations', icon: FilePlus },
  { name: 'Orders', icon: Package },
  { name: 'Shipments', icon: Truck },
  { name: 'Planning & Outreach', icon: Calendar },
  { name: 'Tracking', icon: MapPin },
  { name: 'Vendors', icon: Users },
  { name: 'Vehicles', icon: Car },
  { name: 'Facilities', icon: Building },
  { name: 'Documents', icon: FileText },
  { name: 'Billing', icon: CreditCard },
  { name: 'Rates', icon: Tag },
  { name: 'Rate Master', icon: Route },
  { name: 'Reports', icon: BarChart },
  { name: 'Settings', icon: Settings },
  { name: 'Integrations', icon: Plug },
  { name: 'Profile', icon: Users },
]

export const Trans_DashBoard = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const authContext = useContext(AuthContext)
  const user = authContext?.user
  const logout = authContext?.logout

  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'Dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [sidebarHovered, setSidebarHovered] = useState(false)
  const [vendorView, setVendorView] = useState<'list' | 'create'>('list')
  const [addRouteView, setAddRouteView] = useState<'main' | 'create'>('main')

  const [quotationView, setQuotationView] = useState<'vendors' | 'list' | 'create'>('vendors')
  const [selectedVendorForQuotation, setSelectedVendorForQuotation] = useState<string | null>(null)
  
  // New State for Allocation & LR
  const [selectedIndentForAllocation, setSelectedIndentForAllocation] = useState<string | null>(null)
  const [showCreateLRModal, setShowCreateLRModal] = useState(false)

  const isExpanded = sidebarHovered

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  const handleTabChange = (tabName: string) => {
    setActiveTab(tabName)
    
    // Reset view states when changing tabs
    if (tabName === 'Vendors') {
      setVendorView('list')
    }
    if (tabName !== 'Rate Master') {
      setAddRouteView('main')
    }
    if (tabName === 'Quotations') {
      setQuotationView('vendors')
      setSelectedVendorForQuotation(null)
    }
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <aside
        onMouseEnter={() => setSidebarHovered(true)}
        onMouseLeave={() => setSidebarHovered(false)}
        className={`
          bg-white border-r border-gray-200
          transition-all duration-300 ease-in-out
          ${isExpanded ? 'w-64' : 'w-20'}
          flex flex-col relative
          z-20
        `}
      >
        <div className="h-16 px-4 flex items-center border-gray-200">
          <div className="flex items-center gap-2 overflow-hidden">
            {isExpanded && (
              <span className="font-bold text-gray-800 whitespace-nowrap">INFI_LOGISTICS</span>
            )}
          </div>
        </div>

        <nav className="flex-1 p-2 space-y-1 overflow-y-auto custom-scrollbar">
          {SIDEBAR_ITEMS.map((item) => {
            const Icon = item.icon
            const isActive = activeTab === item.name

            return (
              <button
                key={item.name}
                onClick={() => handleTabChange(item.name)}
                title={!isExpanded ? item.name : ''}
                className={`
                  relative w-full flex items-center h-11 rounded-lg
                  transition-all duration-200
                  ${
                    isActive
                      ? 'bg-amber-50 text-amber-700 font-semibold'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }
                  ${isExpanded ? 'px-3' : 'justify-center'}
                `}
              >
                <Icon size={20} />

                {/* Label */}
                {isExpanded && <span className="ml-3 whitespace-nowrap text-sm">{item.name}</span>}

                {/* Active indicator (collapsed state) */}
                {!isExpanded && isActive && (
                  <span className="absolute right-2 w-2 h-2 bg-amber-600 rounded-full" />
                )}
              </button>
            )
          })}
        </nav>

        <div className="p-3 border-t border-gray-100">
          {isExpanded ? (
            <div 
              onClick={() => setActiveTab('Profile')}
              className="flex items-center gap-3 p-2 hover:bg-gray-100 rounded-lg cursor-pointer transition group"
            >
              <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 font-bold border shadow-sm shrink-0">
                {user?.name?.charAt(0) || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate text-gray-800">{user?.name || 'User'}</p>
                <p className="text-xs text-gray-500 truncate">{user?.email || 'user@example.com'}</p>
              </div>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  logout?.();
                  navigate('/trans-login');
                }}
                className="p-1.5 hover:bg-red-50 hover:text-red-600 rounded-md transition-colors text-gray-400"
                title="Logout"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <div 
              className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 font-bold border shadow-sm mx-auto cursor-pointer hover:bg-amber-200 transition-colors"
              onClick={() => setActiveTab('Profile')}
              title={user?.name || 'User Profile'}
            >
              {user?.name?.charAt(0) || 'U'}
            </div>
          )}
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <header className="flex items-center justify-between bg-white px-6 py-4 border-b border-gray-200 shadow-sm shrink-0 z-10">
          <div className="flex items-center gap-4">
            {!sidebarOpen && (
              <button
                onClick={toggleSidebar}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-2"
                title="Open sidebar"
              >
                <Menu size={20} className="text-gray-700" />
                <span className="text-sm text-gray-600">Menu</span>
              </button>
            )}

            <div>
              <h1 className="text-lg font-semibold text-gray-800">{activeTab}</h1>
              <p className="text-sm text-gray-500">
                {activeTab === 'Dashboard' ? 'Track user interaction, usage, and engagement'
                  : activeTab === 'Vehicle Allocation' ? 'Allocate vehicles to approved indents'
                  : activeTab === 'LRs' ? 'Generate and Manage Lorry Receipts'
                  : activeTab === 'Invoices' ? 'Generate and Manage Invoices'
                  : `Manage ${activeTab.toLowerCase()}`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Main Action Button */}
            {activeTab === 'Dashboard' && (
              <button className="bg-gradient-to-r from-amber-600 to-amber-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:from-amber-700 hover:to-amber-700 transition-all shadow-sm hover:shadow flex items-center gap-2">
                <Route size={16} />
                Optimize Routes
              </button>
            )}

            {/* Quick Stats */}
            <div className="hidden md:flex items-center gap-4 text-sm">
              <div className="px-3 py-1.5 bg-green-50 text-green-700 rounded-lg">
                <span className="font-semibold">24</span> Active Routes
              </div>
              <div className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg">
                <span className="font-semibold">94%</span> On Time
              </div>
            </div>

            {/* Search */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                <svg
                  className="w-4 h-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </div>
          </div>
        </header>

        <main className="p-6 overflow-y-auto bg-gray-50 flex-1">
          {activeTab === 'Dashboard' && <DashboardContent />}

          {activeTab === 'Vehicle Allocation' && (
              <VehicleAllocationList 
                onAllocateClick={(indentId) => setSelectedIndentForAllocation(indentId)}
              />
          )}

          {activeTab === 'LRs' && (
              <ShipmentRegister 
                onGenerateLR={() => setShowCreateLRModal(true)}
              />
          )}

          {activeTab === 'Invoices' && (
              <InvoiceDashboard />
          )}

          {activeTab === 'Vendors' && vendorView === 'list' && (
            <Vendor_List 
              onAddVendor={() => setVendorView('create')}
              onViewQuotations={(vendorId: string) => {
                navigate(`/vendor-quotations/${vendorId}`)
              }}
            />
          )}

          {activeTab === 'Vendors' && vendorView === 'create' && (
            <Create_Vendor onBack={() => setVendorView('list')} />
          )}

          {activeTab === 'Quotations' && quotationView === 'vendors' && (
            <Vendor_List
              onAddVendor={() => {
                /* Optional: redirect to Vendors tab or show create vendor here */
                setActiveTab('Vendors')
                setVendorView('create')
              }}
              onViewQuotations={(vendorId: string) => {
                setSelectedVendorForQuotation(vendorId)
                setQuotationView('list')
              }}
            />
          )}

          {activeTab === 'Quotations' &&
            quotationView === 'list' &&
            selectedVendorForQuotation && (
              <QuotationList 
                vendorId={selectedVendorForQuotation}
                onBack={() => setQuotationView('vendors')}
                onCreateQuotation={() => setQuotationView('create')}
              />
            )}

          {activeTab === 'Quotations' &&
            quotationView === 'create' &&
            selectedVendorForQuotation && (
              <CreateQuotation 
                mode="TRANSPORTER" 
                vendorId={selectedVendorForQuotation}
                onBack={() => setQuotationView('list')}
              />
            )}

          {activeTab === 'Rate Master' && (
            <AddRoute/>
          )}

          {activeTab === 'Vehicles' && (
            <VehicleMaster />
          )}

          {activeTab === 'Orders' && (
            <IndentList />
          )}

          {activeTab === 'Profile' && (
            <ProfileContent />
          )}

          {activeTab !== 'Dashboard' && 
           activeTab !== 'Vendors' && 
           activeTab !== 'Quotations' && 
           activeTab !== 'Vehicle Allocation' && 
           activeTab !== 'LRs' && 
           activeTab !== 'Invoices' && 
           activeTab !== 'Rate Master' && 
           activeTab !== 'Vehicles' && 
           activeTab !== 'Orders' && 
           activeTab !== 'Profile' && (
            <PlaceholderContent title={activeTab} />
          )}
        </main>

        {/* Modals */}
        {selectedIndentForAllocation && (
            <AllocateVehicleModal 
                indentId={selectedIndentForAllocation} 
                onClose={() => setSelectedIndentForAllocation(null)} 
            />
        )}
        
        {showCreateLRModal && (
            <CreateLRModal 
                onClose={() => setShowCreateLRModal(false)}
            />
        )}

      </div>
    </div>
  )
}

const ProfileContent = () => {
  const context = useContext(AuthContext)
  const user = context?.user

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Banner */}
      <div className="h-40 bg-gradient-to-r from-amber-500 via-amber-600 to-gray-900 relative">
        <div className="absolute -bottom-12 left-8">
          <div className="w-24 h-24 rounded-2xl bg-white p-1 border-4 border-white shadow-lg">
            <div className="w-full h-full rounded-xl bg-amber-100 flex items-center justify-center text-amber-700 text-3xl font-bold">
              {user?.fullName?.charAt(0) || user?.name?.charAt(0) || 'U'}
            </div>
          </div>
        </div>
      </div>

      <div className="px-8 pt-16 pb-8">
        <div className="flex flex-col md:flex-row justify-between items-start mb-10 gap-6">
          <div className="flex-1 min-w-0">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-2 truncate">
              {user?.fullName || user?.name || 'Transporter User'}
            </h2>
            <div className="flex flex-wrap items-center gap-3">
              <span className="px-3 py-1 bg-amber-100 text-amber-800 text-xs font-bold rounded-full border border-amber-200 uppercase tracking-tighter">
                {user?.roles?.[0] || 'TRANSPORTER'}
              </span>
              <span className="flex items-center gap-1.5 text-gray-500 text-sm font-medium">
                <Building size={16} className="text-gray-400" />
                {user?.companyName || 'Registered Enterprise'}
              </span>
              {user?.isVerified ? (
                <span className="flex items-center gap-1 text-green-600 text-sm font-semibold bg-green-50 px-2 py-0.5 rounded-full border border-green-100">
                  <ShieldCheck size={14} /> Verified Partner
                </span>
              ) : (
                <span className="flex items-center gap-1 text-amber-600 text-sm font-semibold bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100">
                  <ShieldAlert size={14} /> Verification Pending
                </span>
              )}
            </div>
          </div>
          
          <div className="flex gap-3 w-full md:w-auto">
            <button className="flex-1 md:flex-none px-6 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-semibold hover:bg-black transition-all shadow-sm flex items-center justify-center gap-2">
              <Settings size={18} />
              Account Settings
            </button>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          <StatMini label="Experience" value={`${user?.yearsInBusiness || 0} Years`} icon={<Calendar size={18} />} />
          <StatMini label="Fleet Size" value={`${user?.numberOfVehicles || 0} Units`} icon={<Truck size={18} />} />
          <StatMini label="Regions" value={user?.serviceAreas?.length ? `${user.serviceAreas.length} Areas` : 'N/A'} icon={<Globe size={18} />} />
          <StatMini label="Main Fleet" value={humanize(user?.primaryVehicleType) || 'Gen. Transport'} icon={<Car size={18} />} />
        </div>

        <div className="grid md:grid-cols-2 gap-x-12 gap-y-10 border-t pt-10">
          {/* Section: Business Documentation */}
          <section>
            <div className="flex items-center gap-2 mb-6">
              <Briefcase className="text-amber-600" size={20} />
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Business Identity</h3>
            </div>
            <div className="bg-gray-50 rounded-2xl p-6 space-y-5 border border-gray-100">
              <ProfileData label="Full Name" value={user?.fullName || user?.name} />
              <ProfileData label="Company Entity" value={user?.companyName} />
              <ProfileData label="GSTIN" value={user?.gstNumber} />
              <ProfileData label="PAN Number" value={user?.panNumber} />
              <ProfileData label="Business Type" value={humanize(user?.businessType)} />
              <ProfileData label="Years in Business" value={user?.yearsInBusiness?.toString()} />
            </div>
          </section>

          {/* Section: Contact & Logistics */}
          <section>
            <div className="flex items-center gap-2 mb-6">
              <MapPin className="text-amber-600" size={20} />
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Location & Contact</h3>
            </div>
            <div className="bg-gray-50 rounded-2xl p-6 space-y-5 border border-gray-100">
              <ProfileData label="Email Address" value={user?.email} icon={<FileText size={16} />} />
              <ProfileData label="Primary Phone" value={user?.phoneNumber} />
              <ProfileData label="Alternate Contact" value={user?.alternatePhoneNumber || 'None Provided'} />
              <ProfileData 
                label="Registered office" 
                value={`${user?.businessAddress?.address || 'N/A'}, ${user?.businessAddress?.city || ''}, ${user?.businessAddress?.state || ''} - ${user?.businessAddress?.pinCode || ''}`} 
              />
              <ProfileData label="Service Footprint" value={user?.serviceAreas?.join(', ') || 'National'} />
            </div>
          </section>
        </div>

        {/* Section: Fleet & Verification */}
        <div className="mt-10 grid md:grid-cols-1 gap-10 border-t pt-10">
          <section>
            <div className="flex items-center gap-2 mb-6">
              <ShieldCheck className="text-amber-600" size={20} />
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Compliance Documents</h3>
            </div>
            <div className="overflow-x-auto border border-gray-100 rounded-2xl">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-gray-500 font-semibold border-b">
                  <tr>
                    <th className="px-6 py-4">Document Type</th>
                    <th className="px-6 py-4">Upload Date</th>
                    <th className="px-6 py-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  <DocRow name="Transport License" doc={user?.documents?.transportLicense} />
                  <DocRow name="Vehicle RC" doc={user?.documents?.vehicleRC} />
                  <DocRow name="Insurance Certificate" doc={user?.documents?.insuranceCertificate} />
                  <DocRow name="PAN Card (Business)" doc={user?.documents?.panCard} />
                </tbody>
              </table>
            </div>
          </section>
        </div>

        {/* Footer info */}
        <div className="mt-12 text-center p-6 bg-amber-50 rounded-2xl border border-amber-100">
          <p className="text-amber-800 text-sm italic">
            "Committed to excellence in transport and logistics since {user?.createdAt ? new Date(user.createdAt).getFullYear() : 2024}"
          </p>
          <div className="flex justify-center gap-4 mt-4 text-[10px] text-amber-600/60 uppercase font-bold tracking-widest">
            <span>Last Updated: {user?.updatedAt ? new Date(user.updatedAt).toLocaleDateString() : 'N/A'}</span>
            <span>•</span>
            <span>Account ID: {user?.id}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

const StatMini = ({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) => (
  <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-3">
    <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
      {icon}
    </div>
    <div className="min-w-0">
      <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">{label}</p>
      <p className="text-sm font-bold text-gray-800 truncate">{value}</p>
    </div>
  </div>
)

const ProfileData = ({ label, value, icon, className = "" }: { label: string; value?: string; icon?: React.ReactNode; className?: string }) => (
  <div className="flex flex-col gap-1">
    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
      {label}
    </label>
    <div className={`text-sm font-bold text-gray-700 flex items-center gap-2 ${className}`}>
      {value || 'Not Disclosed'}
    </div>
  </div>
)

const DocRow = ({ name, doc }: { name: string; doc?: any }) => (
  <tr className="hover:bg-gray-50 transition-colors">
    <td className="px-6 py-4 font-semibold text-gray-700">{name}</td>
    <td className="px-6 py-4 text-gray-500">
      {doc?.uploadedAt ? new Date(doc.uploadedAt).toLocaleDateString() : '—'}
    </td>
    <td className="px-6 py-4">
      {doc?.url && doc.url !== 'not_uploaded' ? (
        <span className={`flex items-center gap-1.5 font-bold text-[10px] uppercase w-fit px-2 py-1 rounded-full border ${
          doc.verified 
            ? 'bg-green-50 text-green-700 border-green-200' 
            : (doc.url === 'pending' || !doc.verified)
              ? 'bg-blue-50 text-blue-700 border-blue-200'
              : 'bg-amber-50 text-amber-700 border-amber-200'
        }`}>
          {doc.verified ? <ShieldCheck size={12} /> : <Info size={12} />}
          {doc.verified ? 'Verified' : (doc.url === 'pending' || doc.uploadedAt) ? 'Under Review' : 'Action Required'}
        </span>
      ) : (
        <span className="flex items-center gap-1.5 font-bold text-[10px] uppercase w-fit px-2 py-1 rounded-full border bg-gray-50 text-gray-400 border-gray-200">
          <ShieldAlert size={12} /> Not Uploaded
        </span>
      )}
    </td>
  </tr>
)

const ProfileItem = ({ icon, label, value }: { icon: React.ReactNode; label: string; value?: string }) => (
  <div className="flex items-start gap-4">
    <div className="p-2 bg-amber-50 text-amber-600 rounded-lg shrink-0">
      {icon}
    </div>
    <div className="min-w-0 flex-1">
      <p className="text-xs text-gray-500 font-medium mb-0.5">{label}</p>
      <p className="text-sm font-semibold text-gray-800 break-words">{value || <span className="text-gray-300 font-normal">Not Provided</span>}</p>
    </div>
  </div>
)