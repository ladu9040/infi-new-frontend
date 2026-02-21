import { Search } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
export interface Vendor {
  id: string
  name: string
  email: string
}


const VendorSearchDropdown = ({
  vendors,
  selectedVendorId,
  onVendorSelect,
  isDisabled = false,
}: {
  vendors: Vendor[]
  selectedVendorId?: string
  onVendorSelect: (vendorId: string) => void
  isDisabled?: boolean
}) => {
  const [showDropdown, setShowDropdown] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [dropdownPosition, setDropdownPosition] = useState<{ top: number; left: number } | null>(
    null,
  )
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const selectedVendor = vendors.find((v) => v.id === selectedVendorId)

  const filteredVendors = useMemo(() => {
    if (searchTerm.trim() === '') {
      return []
    }

    const filtered = vendors.filter(
      (vendor) =>
        vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vendor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vendor.id.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    return filtered.slice(0, 10)
  }, [searchTerm, vendors])

  const dropdownWidth = useMemo(() => {
    if (filteredVendors.length === 0) {
      return 300
    }

    const maxContentWidth = Math.max(
      300,
      ...filteredVendors.map((vendor) => {
        const text = `${vendor.name} (${vendor.email})`
        return Math.min(text.length * 8, 400)
      }),
    )
    return Math.min(maxContentWidth, 400)
  }, [filteredVendors])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node) &&
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  useEffect(() => {
    if (showDropdown && searchTerm && inputRef.current) {
      const rect = inputRef.current.getBoundingClientRect()
      const viewportWidth = window.innerWidth

      let left = rect.left + window.scrollX
      if (left + dropdownWidth > viewportWidth) {
        left = viewportWidth - dropdownWidth - 10
      }

      setDropdownPosition({
        top: rect.bottom + window.scrollY + 5,
        left: left,
      })
    } else {
      setDropdownPosition(null)
    }
  }, [showDropdown, searchTerm, dropdownWidth])

  const getDropdownStyle = (): React.CSSProperties => {
    if (!dropdownPosition) {
      return {
        position: 'fixed',
        top: '100px',
        left: '100px',
        width: `${dropdownWidth}px`,
        minWidth: '300px',
      }
    }

    return {
      position: 'fixed',
      top: `${dropdownPosition.top}px`,
      left: `${dropdownPosition.left}px`,
      width: `${dropdownWidth}px`,
      minWidth: '300px',
      maxWidth: '400px',
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setSearchTerm(val)
    setShowDropdown(true)
  }

  const handleVendorClick = (vendor: Vendor) => {
    onVendorSelect(vendor.id)
    setShowDropdown(false)
    setSearchTerm('')
  }

  const clearSelection = () => {
    onVendorSelect('')
    setSearchTerm('')
  }

  return (
    <div ref={containerRef} className="relative">
      <div className="flex items-center space-x-2">
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={searchTerm}
            onChange={handleInputChange}
            onFocus={() => setShowDropdown(true)}
            placeholder={selectedVendor ? selectedVendor.name : 'Search vendor...'}
            className="w-64 px-3 py-1.5 pl-9 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            disabled={isDisabled}
          />
          <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        </div>
        {selectedVendorId && (
          <button
            onClick={clearSelection}
            className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 rounded"
            disabled={isDisabled}
          >
            Clear
          </button>
        )}
      </div>

      {showDropdown && searchTerm && filteredVendors.length > 0 && (
        <div
          ref={dropdownRef}
          style={getDropdownStyle()}
          className="z-50 mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto"
        >
          <div className="p-2 border-b bg-gray-50 text-sm font-medium text-gray-700">
            Found {filteredVendors.length} vendor{filteredVendors.length !== 1 ? 's' : ''}
          </div>
          {filteredVendors.map((vendor) => (
            <div
              key={vendor.id}
              className="px-4 py-3 hover:bg-blue-50 cursor-pointer border-b last:border-b-0 transition-colors duration-150"
              onClick={(e) => {
                e.stopPropagation()
                handleVendorClick(vendor)
              }}
            >
              <div className="font-medium text-gray-800">{vendor.name}</div>
              <div className="text-sm text-gray-600">{vendor.email}</div>
              <div className="text-xs text-gray-500 mt-1">ID: {vendor.id}</div>
            </div>
          ))}
        </div>
      )}

      {showDropdown && searchTerm && filteredVendors.length === 0 && (
        <div
          style={getDropdownStyle()}
          className="z-50 mt-1 bg-white border border-gray-300 rounded-md shadow-lg"
        >
          <div className="px-4 py-3 text-gray-600">
            <div className="font-medium mb-1">No vendors found</div>
            <div className="text-sm">No vendors matching "{searchTerm}"</div>
          </div>
        </div>
      )}

      {selectedVendor && !showDropdown && (
        <div className="mt-1 text-xs text-gray-600">
          Selected: <span className="font-medium">{selectedVendor.name}</span>
        </div>
      )}
    </div>
  )
}

export default VendorSearchDropdown
