import { useEffect, useRef, useState, useMemo } from 'react'
export interface OrderPlan {
  id: string
  orderNumber: string
  orderDate: string
  origin: string
  destination: string
  shipmentNumber: string
  createdAt: string
  updatedAt: string
  status: string
}


const ShipmentNumberRenderer = ({
  isEditing,
  value,
  onChange,
  onKeyDown,
  isAddMode,
  orders,
  onOrderSelect,
}: {
  isEditing: boolean
  value: string
  onChange: (value: any) => void
  onKeyDown: (e: React.KeyboardEvent) => void
  isAddMode?: boolean
  orders: OrderPlan[]
  onOrderSelect: (order: OrderPlan, isAddMode: boolean) => void
}) => {
  const [showDropdown, setShowDropdown] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [dropdownPosition, setDropdownPosition] = useState<{ top: number; left: number } | null>(
    null,
  )
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Compute filtered orders during render
  const filteredOrders = useMemo(() => {
    if (searchTerm.trim() === '') {
      return []
    }

    const filtered = orders.filter(
      (order) =>
        order.shipmentNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    return filtered.slice(0, 10)
  }, [searchTerm, orders])

  // Compute dropdown width during render
  const dropdownWidth = useMemo(() => {
    if (filteredOrders.length === 0) {
      return 400 // Default width
    }

    const maxContentWidth = Math.max(
      400,
      ...filteredOrders.map((order) => {
        const text = `${order.shipmentNumber} ${order.origin} → ${order.destination} Order: ${order.orderNumber}`
        return Math.min(text.length * 8, 600)
      }),
    )
    return Math.min(maxContentWidth, 600)
  }, [filteredOrders])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // Calculate dropdown position in an effect (this needs to be an effect since it uses DOM refs)
  useEffect(() => {
    if (showDropdown && searchTerm && inputRef.current) {
      const rect = inputRef.current.getBoundingClientRect()
      const viewportWidth = window.innerWidth

      // Calculate left position to ensure dropdown stays in viewport
      let left = rect.left + window.scrollX
      if (left + dropdownWidth > viewportWidth) {
        left = viewportWidth - dropdownWidth - 10 // 10px margin from right edge
      }

      setDropdownPosition({
        top: rect.bottom + window.scrollY,
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
        minWidth: '400px',
      }
    }

    return {
      position: 'fixed',
      top: `${dropdownPosition.top}px`,
      left: `${dropdownPosition.left}px`,
      width: `${dropdownWidth}px`,
      minWidth: '400px',
      maxWidth: '600px',
    }
  }

  if (!isEditing) {
    return <span>{value}</span>
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    onChange(val)
    setSearchTerm(val)
    setShowDropdown(true)
  }

  const handleOrderClick = (order: OrderPlan) => {
    onChange(order.shipmentNumber)
    onOrderSelect(order, isAddMode || false)
    setShowDropdown(false)
    setSearchTerm('')
  }

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="text"
        value={value || ''}
        onChange={handleInputChange}
        onFocus={() => {
          if (value) {
            setSearchTerm(value)
            setShowDropdown(true)
          }
        }}
        onKeyDown={(e) => {
          if (e.key === 'Escape') {
            setShowDropdown(false)
          }
          onKeyDown(e)
        }}
        className="w-full p-1 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
        placeholder="Type shipment number..."
        autoComplete="off"
      />

      {showDropdown && searchTerm && filteredOrders.length > 0 && (
        <div
          ref={dropdownRef}
          style={getDropdownStyle()}
          className="z-9999 mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto"
        >
          <div className="p-2 border-b bg-gray-50 text-sm font-medium text-gray-700">
            Found {filteredOrders.length} order{filteredOrders.length !== 1 ? 's' : ''}
          </div>
          {filteredOrders.map((order) => (
            <div
              key={order.id}
              className="px-4 py-3 hover:bg-blue-50 cursor-pointer border-b last:border-b-0 transition-colors duration-150"
              onClick={(e) => {
                e.stopPropagation()
                handleOrderClick(order)
              }}
            >
              <div className="flex justify-between items-start mb-1">
                <div className="font-medium text-blue-600">{order.shipmentNumber}</div>
                <div className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                  {order.status}
                </div>
              </div>
              <div className="flex items-center text-sm text-gray-700 mb-1">
                <span className="font-medium mr-2">Origin:</span>
                <span className="text-gray-800">{order.origin}</span>
                <span className="mx-2 text-gray-400">→</span>
                <span className="font-medium mr-2">Destination:</span>
                <span className="text-gray-800">{order.destination}</span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <span className="font-medium mr-2">Order #:</span>
                <span className="mr-4">{order.orderNumber}</span>
                <span className="font-medium mr-2">Date:</span>
                <span>{new Date(order.orderDate).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {showDropdown && searchTerm && filteredOrders.length === 0 && (
        <div
          style={getDropdownStyle()}
          className="z-9999 mt-1 bg-white border border-gray-300 rounded-md shadow-lg"
        >
          <div className="px-4 py-3 text-gray-600">
            <div className="font-medium mb-1">No orders found</div>
            <div className="text-sm">No orders matching "{searchTerm}"</div>
            <div className="text-xs text-gray-500 mt-1">
              Try a different shipment number or order number
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ShipmentNumberRenderer
