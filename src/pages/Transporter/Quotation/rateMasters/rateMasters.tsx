import { useEffect, useMemo, useState } from 'react'
import { useQuery } from '@apollo/client/react'
import { GET_ALL_RATES, GET_ALL_ROUTES, GET_ALL_VEHICLE_TYPES } from '../../Pages/Add_Routes/addRoute.gql'

interface RateMasterProps {
  onAddToQuotation?: (rate: any) => void
}

interface Route {
  id: string
  origin: string
  destination: string
  createdAt: string
}

interface VehicleType {
  id: string
  label: string
  value: string
  defaultRate: number
  createdAt: string
}

interface Rate {
  id: string
  origin: string
  destination: string
  containerType: string
  capacity: number
  unit: string
  price: number
  date: string
  createdAt: string
  vehicleType: string
}

interface GetAllRoutesResponse {
  getAllRoutes: Route[]
}

interface GetAllVehicleTypesResponse {
  getAllVehicleTypes: VehicleType[]
}

interface GetAllRatesResponse {
  getAllRouteRates: Rate[]
}

const RateMaster = ({ onAddToQuotation }: RateMasterProps) => {
  const { data: routesData } = useQuery<GetAllRoutesResponse>(GET_ALL_ROUTES)
  const { data: vehiclesData } = useQuery<GetAllVehicleTypesResponse>(GET_ALL_VEHICLE_TYPES)
  const { data: ratesData, error: ratesError } = useQuery<GetAllRatesResponse>(GET_ALL_RATES, {
    fetchPolicy: 'cache-and-network'
  })

  useEffect(() => {
    if (ratesError) console.error("RateMaster Fetch Error:", ratesError);
    if (ratesData) console.log("RateMaster Data:", ratesData);
  }, [ratesData, ratesError]);

  const [selectedOrigin, setSelectedOrigin] = useState('')
  const [selectedDestination, setSelectedDestination] = useState('')
  const [selectedVehicleType, setSelectedVehicleType] = useState<string>('') // Start empty

  const transportRoutes = useMemo(() => {
    if (!routesData?.getAllRoutes) return []
    
    const routesByOrigin: Record<string, string[]> = {}
    
    routesData.getAllRoutes.forEach((route: Route) => {
      if (!routesByOrigin[route.origin]) {
        routesByOrigin[route.origin] = []
      }
      if (!routesByOrigin[route.origin].includes(route.destination)) {
        routesByOrigin[route.origin].push(route.destination)
      }
    })
    
    return Object.entries(routesByOrigin).map(([origin, destinations]) => ({
      origin,
      destinations
    }))
  }, [routesData])

  // Process rates data correctly
  const transportRates = useMemo(() => {
    if (!ratesData || !ratesData.getAllRouteRates) return []

    const result = ratesData.getAllRouteRates.map((rate: any) => ({
      id: rate.id || rate._id,
      origin: rate.origin,
      destination: rate.destination,
      capacity: rate.capacity,
      unit: rate.unit,
      containerType: rate.containerType,
      vehicleType: rate.vehicleType, 
      price: rate.price,
      createdAt: rate.createdAt,
      date: rate.date || (rate.createdAt ? new Date(rate.createdAt).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: '2-digit'
      }) : '') || new Date().toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: '2-digit'
      })
    }))
    return result;
  }, [ratesData])

  // Get ALL unique vehicle types from rates
  const allVehicleTypes = useMemo(() => {
    const uniqueTypes = new Set<string>()
    
    // Get vehicle types from actual vehicle types data
    if (vehiclesData?.getAllVehicleTypes) {
      vehiclesData.getAllVehicleTypes.forEach((vehicle: VehicleType) => {
        if (vehicle.label) {
          uniqueTypes.add(vehicle.label)
        }
      })
    }
    
    // Also get vehicle types from rates data as fallback
    if (transportRates.length > 0) {
      transportRates.forEach(rate => {
        if (rate.vehicleType) {
          uniqueTypes.add(rate.vehicleType)
        }
      })
    }
    
    return Array.from(uniqueTypes).map(type => ({
      label: type,
      value: type
    }))
  }, [vehiclesData, transportRates])

  // Filter rates based on origin, destination, and vehicleType (if selected)
  const filteredRates = useMemo(() => {
    if (!selectedOrigin || !selectedDestination) return []
    
    // First filter by origin and destination (case-insensitive and trimmed)
    let rates = transportRates.filter(
      (r) =>
        r.origin.trim().toLowerCase() === selectedOrigin.trim().toLowerCase() &&
        r.destination.trim().toLowerCase() === selectedDestination.trim().toLowerCase()
    )
    
    // Then filter by vehicle type if one is selected
    if (selectedVehicleType) {
      rates = rates.filter(r => 
        r.vehicleType.trim().toLowerCase() === selectedVehicleType.trim().toLowerCase()
      )
    }
    
    return rates
  }, [selectedOrigin, selectedDestination, selectedVehicleType, transportRates])

  useEffect(() => {
    if (!selectedOrigin && transportRoutes.length) {
      setSelectedOrigin(transportRoutes[0].origin)
    }
  }, [transportRoutes])

  // Calculate total capacity for selected filters
  const totalCapacity = filteredRates.reduce((s, r) => s + (r.capacity || 0), 0)

  const handleAddToQuotation = (rate: any) => {
    if (onAddToQuotation) {
      onAddToQuotation(rate)
    }
  }

  // Calculate average price
  const averagePrice = filteredRates.length > 0
    ? Math.round(filteredRates.reduce((sum, rate) => sum + rate.price, 0) / filteredRates.length)
    : 0

  if (!routesData || !vehiclesData || !ratesData) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-[1600px] mx-auto grid grid-cols-[460px_1fr] gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">
              Truck Freight Calculator
            </h1>
            <div className="text-center py-12 text-gray-500">Loading routes...</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">
              Transport Truck Rates
            </h1>
            <div className="text-center py-12 text-gray-500">Loading rates...</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 h-full flex flex-col overflow-hidden">
      <div className="flex h-full">
        {/* LEFT PANEL - Route Selection */}
        <div className="w-[400px] bg-gray-50 border-r border-gray-200 p-6 flex flex-col gap-6 overflow-y-auto">
          <div>
            <h1 className="text-xl font-bold text-gray-800 mb-2">
              Route Selection
            </h1>
            <p className="text-xs text-gray-500 font-medium">Select origin and destination to view available rates</p>
          </div>

          <div className="space-y-6">
            {transportRoutes.map((route) => (
              <div key={route.origin}>
                <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                  {route.origin}
                </h2>

                <div className="flex flex-wrap gap-2">
                  {route.destinations.map((dest) => (
                    <button
                      key={dest}
                      onClick={() => {
                        setSelectedOrigin(route.origin)
                        setSelectedDestination(dest)
                        setSelectedVehicleType('') // Reset vehicle type when route changes
                      }}
                      className={`px-3 py-2 text-sm font-semibold rounded-md border transition-all ${
                        selectedOrigin === route.origin &&
                        selectedDestination === dest
                          ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                          : 'border-gray-200 text-gray-600 hover:border-amber-300 hover:text-amber-600 bg-white'
                      }`}
                    >
                      {dest.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT PANEL - Rates Display */}
        <div className="flex-1 flex flex-col bg-white">
          <div className="p-6 border-b border-gray-100 flex justify-between items-start">
            <div>
                 <h1 className="text-xl font-bold text-gray-800 mb-1">
                    Available Rates
                </h1>
                <p className="text-xs text-gray-500 font-medium">
                    {selectedOrigin && selectedDestination ? (
                        <>Showing rates for <span className="text-gray-900 font-semibold">{selectedOrigin}</span> to <span className="text-gray-900 font-semibold">{selectedDestination}</span></>
                    ) : 'Select a route to get started'}
                </p>
            </div>
          </div>

          {selectedDestination ? (
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Filters Bar */}
              <div className="px-6 py-4 flex flex-wrap items-center gap-2 border-b border-gray-50">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mr-2">Filter Vehicle:</span>
                {allVehicleTypes.map((type) => (
                  <button
                    key={type.value}
                    onClick={() => {
                      if (selectedVehicleType === type.value) {
                        setSelectedVehicleType('')
                      } else {
                        setSelectedVehicleType(type.value)
                      }
                    }}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${
                      selectedVehicleType === type.value
                        ? 'border-amber-500 bg-amber-50 text-amber-600'
                        : 'border-gray-200 bg-white text-gray-500 hover:border-amber-200 hover:text-amber-500'
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>

              {/* Stats Bar */}
               <div className="px-6 py-3 bg-gray-50/50 border-b border-gray-100 flex items-center justify-between text-xs font-medium text-gray-500">
                <div className="flex gap-4">
                  <span>Total Capacity: <b className="text-gray-800">{totalCapacity} Ton</b></span>
                  <span>Avg Price: <b className="text-amber-700">₹{averagePrice}</b></span>
                </div>
                <div>
                    {filteredRates.length} Rates Found
                </div>
              </div>

              {/* Rates List - Table Layout */}
              <div className="flex-1 overflow-y-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="sticky top-0 z-10">
                    <tr className="bg-gray-50 border-b border-gray-200 text-left h-10">
                      <th className="px-6 text-[11px] font-bold text-gray-500 uppercase tracking-wider w-1/4">Origin / Dest</th>
                      <th className="px-6 text-[11px] font-bold text-gray-500 uppercase tracking-wider w-1/5">Vehicle</th>
                      <th className="px-6 text-[11px] font-bold text-gray-500 uppercase tracking-wider text-center">Capacity</th>
                      <th className="px-6 text-[11px] font-bold text-gray-500 uppercase tracking-wider text-center">Date</th>
                      <th className="px-6 text-[11px] font-bold text-gray-500 uppercase tracking-wider text-right">Price</th>
                      <th className="px-6 text-[11px] font-bold text-gray-500 uppercase tracking-wider text-center w-24">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredRates.length > 0 ? (
                      filteredRates.map((rate, i) => (
                        <tr key={i} className="group hover:bg-amber-50/20 transition-colors h-16">
                          {/* Route */}
                          <td className="px-6 align-middle">
                            <div className="flex flex-col gap-1">
                                <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                                    <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                                    {rate.origin}
                                </div>
                                <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                                    <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                                    {rate.destination}
                                </div>
                            </div>
                          </td>

                          {/* Vehicle */}
                          <td className="px-6 align-middle">
                            <div className="text-sm font-medium text-gray-700">{rate.vehicleType}</div>
                            <div className="text-xs text-gray-400">Truck</div>
                          </td>

                           {/* Capacity */}
                           <td className="px-6 align-middle text-center">
                            <div className="text-sm font-medium text-gray-700">{rate.capacity} {rate.unit}</div>
                          </td>

                          {/* Date */}
                          <td className="px-6 align-middle text-center">
                            <div className="text-sm text-gray-500">{rate.date}</div>
                          </td>

                          {/* Price */}
                          <td className="px-6 align-middle text-right">
                             <div className="text-sm font-bold text-gray-900">
                                ₹{rate.price.toLocaleString()}
                            </div>
                            <div className="text-[10px] text-gray-400">
                                {rate.capacity > 0 ? Math.round(rate.price / rate.capacity) : 0} ₹/{rate.unit.toLowerCase()}
                            </div>
                          </td>
                          
                          {/* Action */}
                          <td className="px-6 align-middle text-center">
                            <button 
                              onClick={() => handleAddToQuotation(rate)}
                              className="text-amber-600 hover:text-amber-700 hover:bg-amber-50 border border-amber-200 hover:border-amber-300 rounded-md px-3 py-1.5 text-xs font-bold uppercase tracking-wide transition-all"
                            >
                              Add
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="p-16 text-center text-gray-400">
                            {selectedVehicleType 
                            ? `No rates available for this vehicle type.`
                            : `No rates available.`
                            }
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400 bg-gray-50/30">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
                     <svg className="w-8 h-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 7m0 13V7m0 0L9 4" />
                    </svg>
                </div>
              <p className="text-sm font-medium">Select a route from the left to view rates</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default RateMaster