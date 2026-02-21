'use client'

import { useState, useEffect } from 'react'
import { Plus, Trash2, Edit2, Save, X, MapPin, Truck, DollarSign } from 'lucide-react'
import { toast } from 'react-toastify'
import { useMutation, useQuery } from '@apollo/client/react'
import {
  ADD_RATE,
  ADD_ROUTE,
  ADD_VEHICLE_TYPES,
  DELETE_RATE,
  DELETE_ROUTE,
  DELETE_VEHICLE_TYPES,
  GET_ALL_RATES,
  GET_ALL_ROUTES,
  GET_ALL_VEHICLE_TYPES,
  UPDATE_RATE,
  UPDATE_ROUTE,
  UPDATE_VEHICLE_TYPES,
} from './addRoute.gql'
import type {
  GetAllRatesResponse,
  GetAllRoutesResponse,
  GetAllVehicleTypesResponse,
  Rate,
  Route,
  VehicleType,
} from './AddRoutes.types'

type Tab = 'routes' | 'vehicles' | 'rates'

export const AddRoute = () => {
  const [activeTab, setActiveTab] = useState<Tab>('routes')

  // Routes Data
  const { data: routesData, loading: routesLoading, error: routesError, refetch: refetchRoutes } =
    useQuery<GetAllRoutesResponse>(GET_ALL_ROUTES, {
      fetchPolicy: 'cache-and-network'
    });
  
  // Vehicles Data
  const { data: vehiclesData, loading: vehiclesLoading, error: vehiclesError, refetch: refetchVehicles } =
    useQuery<GetAllVehicleTypesResponse>(GET_ALL_VEHICLE_TYPES, {
      fetchPolicy: 'cache-and-network'
    });
  
  // Rates Data
  const { data: ratesData, loading: ratesLoading, error: ratesError, refetch: refetchRates } = 
    useQuery<GetAllRatesResponse>(GET_ALL_RATES, {
      fetchPolicy: 'cache-and-network'
    });

  const routes = routesData?.getAllRoutes || [];
  const vehicles = vehiclesData?.getAllVehicleTypes || [];
  const rates = ratesData?.getAllRouteRates || [];

  const [newRoute, setNewRoute] = useState({ origin: '', destination: '' })
  const [editingRoute, setEditingRoute] = useState<string | null>(null)
  const [editRouteData, setEditRouteData] = useState({ origin: '', destination: '' })

  const [newVehicle, setNewVehicle] = useState({
    label: '',
    value: '',
    defaultRate: 0,
    capacity: 0,
  })
  const [editingVehicle, setEditingVehicle] = useState<string | null>(null)
  const [editVehicleData, setEditVehicleData] = useState({ label: '', value: '', defaultRate: 0 })

  const [newRate, setNewRate] = useState({
    origin: '',
    destination: '',
    containerType: '',
    vehicleType: '',
    capacity: 0,
    unit: 'Ton',
    price: 0,
  })
  const [editingRate, setEditingRate] = useState<string | null>(null)
  const [editRateData, setEditRateData] = useState({
    origin: '',
    destination: '',
    containerType: '',
    capacity: 0,
    unit: 'Ton',
    price: 0,
    vehicleType: '',
  })

  // Filter states
  const [filterOrigin, setFilterOrigin] = useState('')
  const [filterDestination, setFilterDestination] = useState('')

  /* ============================
     COMBINED MUTATION - UNIFIED SUBMIT
  ============================ */

  const [addRouteMutation] = useMutation(ADD_ROUTE, {
    refetchQueries: [{ query: GET_ALL_ROUTES }]
  })
  
  const [addRateMutation] = useMutation(ADD_RATE, {
    refetchQueries: [{ query: GET_ALL_RATES }]
  })

  const [updateRateMutation] = useMutation(UPDATE_RATE, {
    refetchQueries: [{ query: GET_ALL_RATES }]
  })

  const [deleteRateMutation] = useMutation(DELETE_RATE, {
    refetchQueries: [{ query: GET_ALL_RATES }]
  })

  const handleUnifiedSubmit = async () => {
    if (
      !newRate.origin ||
      !newRate.destination ||
      !newRate.vehicleType ||
      newRate.price <= 0
    ) {
      toast.error('Please fill in all fields (Origin, Destination, Vehicle Type, and Price)')
      return
    }

    try {
      // 1. Check if route already exists
      const routeExists = routes.some(
        (r) =>
          r.origin.toLowerCase() === newRate.origin.toLowerCase() &&
          r.destination.toLowerCase() === newRate.destination.toLowerCase()
      )

      // 2. Add route if it doesn't exist
      if (!routeExists) {
        await addRouteMutation({
          variables: {
            input: {
              origin: newRate.origin,
              destination: newRate.destination,
            },
          },
        })
        await refetchRoutes()
      }

      // 3. Add rate
      await addRateMutation({
        variables: {
          input: {
            origin: newRate.origin,
            destination: newRate.destination,
            price: newRate.price,
            vehicleType: newRate.vehicleType,
            containerType: newRate.containerType,
            capacity: newRate.capacity,
            unit: newRate.unit,
          },
        },
      })

      setNewRate({
        origin: '',
        destination: '',
        vehicleType: '',
        containerType: '',
        capacity: 0,
        unit: 'Ton',
        price: 0,
      })
      
      await refetchRates()
      toast.success('Entry added successfully!')
    } catch (err: any) {
      toast.error(err.message || 'Failed to add entry')
    }
  }

  /* ============================
     MUTATIONS - ROUTES (CRUD)
  ============================ */

  const [updateRouteMutation] = useMutation(UPDATE_ROUTE, {
    refetchQueries: [{ query: GET_ALL_ROUTES }]
  })
  const [deleteRouteMutation] = useMutation(DELETE_ROUTE, {
    refetchQueries: [{ query: GET_ALL_ROUTES }]
  })

  const [addVehicleMutation] = useMutation(ADD_VEHICLE_TYPES, {
    refetchQueries: [{ query: GET_ALL_VEHICLE_TYPES }]
  })
  const [updateVehicleMutation] = useMutation(UPDATE_VEHICLE_TYPES, {
    refetchQueries: [{ query: GET_ALL_VEHICLE_TYPES }]
  })
  const [deleteVehicleMutation] = useMutation(DELETE_VEHICLE_TYPES, {
    refetchQueries: [{ query: GET_ALL_VEHICLE_TYPES }]
  })

  // Route Handlers
  const handleUpdateRoute = async (id: string) => {
    try {
      await updateRouteMutation({
        variables: {
          id,
          origin: editRouteData.origin,
          destination: editRouteData.destination,
        },
      })
      setEditingRoute(null)
      refetchRoutes()
      toast.success('Route updated successfully!')
    } catch (err: any) {
      toast.error(err.message || 'Failed to update route')
    }
  }

  const handleDeleteRoute = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this route?')) return
    try {
      await deleteRouteMutation({ variables: { id } })
      refetchRoutes()
      toast.success('Route deleted successfully!')
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete route')
    }
  }

  // Rate Handlers

  const handleUpdateRate = async (id: string) => {
    try {
      await updateRateMutation({
        variables: {
          id,
          input: {
            origin: editRateData.origin,
            destination: editRateData.destination,
            price: editRateData.price,
            vehicleType: editRateData.vehicleType,
            containerType: editRateData.containerType,
            capacity: editRateData.capacity,
            unit: editRateData.unit,
          },
        },
      })
      setEditingRate(null)
      refetchRates()
      toast.success('Rate updated successfully!')
    } catch (err: any) {
      toast.error(err.message || 'Failed to update rate')
    }
  }

  const handleDeleteRate = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this rate?')) return

    try {
      await deleteRateMutation({ variables: { id } })
      refetchRates()
      toast.success('Rate deleted successfully!')
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete rate')
    }
  }

  // Vehicle Handlers
  const handleAddVehicle = async () => {
    if (!newVehicle.label || !newVehicle.value) {
      toast.error('Please fill in Label and Value')
      return
    }
    try {
      await addVehicleMutation({
        variables: {
          input: {
            label: newVehicle.label,
            value: newVehicle.value,
            defaultRate: newVehicle.defaultRate,
            capacity: newVehicle.capacity,
          },
        },
      })
      setNewVehicle({ label: '', value: '', defaultRate: 0, capacity: 0 })
      refetchVehicles()
      toast.success('Vehicle type added successfully!')
    } catch (err: any) {
      toast.error(err.message || 'Failed to add vehicle type')
    }
  }

  const handleUpdateVehicle = async (id: string) => {
    try {
      await updateVehicleMutation({
        variables: {
          id,
          input: {
            label: editVehicleData.label,
            value: editVehicleData.value,
            defaultRate: editVehicleData.defaultRate,
          },
        },
      })
      setEditingVehicle(null)
      refetchVehicles()
      toast.success('Vehicle type updated successfully!')
    } catch (err: any) {
      toast.error(err.message || 'Failed to update vehicle type')
    }
  }

  const handleDeleteVehicle = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this vehicle type?')) return
    try {
      await deleteVehicleMutation({ variables: { id } })
      refetchVehicles()
      toast.success('Vehicle type deleted successfully!')
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete vehicle type')
    }
  }

  /* ============================
     HELPER FUNCTIONS
  ============================ */

  const getUniqueOrigins = () => {
    return [...new Set(routes.map((r) => r.origin))].sort()
  }

  const getUniqueDestinations = () => {
    return [...new Set(routes.map((r) => r.destination))].sort()
  }

  const filteredRates = rates.filter((rate) => {
    const originMatch = !filterOrigin || rate.origin === filterOrigin
    const destMatch = !filterDestination || rate.destination === filterDestination
    return originMatch && destMatch
  })

  // ✅ FIX: select sends "Label (X tons)", so we extract the label part to find the vehicle
  const handleVehicleTypeChange = (vehicleType: string) => {
    const cleanedLabel = vehicleType.replace(/\s*\(.*\)/, '').trim()
    const selectedVehicle = vehicles.find((v) => v.label === cleanedLabel)

    if (selectedVehicle) {
      setNewRate({
        ...newRate,
        vehicleType: vehicleType,
        containerType: selectedVehicle.value,
        capacity: selectedVehicle.capacity,
      })
    } else {
      setNewRate({
        ...newRate,
        vehicleType: vehicleType,
        containerType: '',
        capacity: 0,
      })
    }
  }

  /* ============================
     RENDER FUNCTIONS
  ============================ */

  const renderUnifiedForm = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center gap-3 mb-4">
          <Plus className="text-blue-600" size={24} />
          <h2 className="text-xl font-semibold text-gray-800">Add New Entry</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Origin</label>
            <input
              type="text"
              list="origins-list"
              value={newRate.origin}
              onChange={(e) => setNewRate({ ...newRate, origin: e.target.value })}
              placeholder="e.g., Chennai"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <datalist id="origins-list">
              {getUniqueOrigins().map((origin) => (
                <option key={origin} value={origin} />
              ))}
            </datalist>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Destination</label>
            <input
              type="text"
              list="destinations-list"
              value={newRate.destination}
              onChange={(e) => setNewRate({ ...newRate, destination: e.target.value })}
              placeholder="e.g., Bangalore"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <datalist id="destinations-list">
              {getUniqueDestinations().map((dest) => (
                <option key={dest} value={dest} />
              ))}
            </datalist>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Vehicle Type</label>
            <select
              value={newRate.vehicleType}
              onChange={(e) => handleVehicleTypeChange(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select Vehicle Type</option>
              {vehicles.map((vehicle) => (
                <option key={vehicle.id} value={vehicle.label}>
                  {vehicle.label} ({vehicle.capacity} tons)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Price (₹)</label>
            <input
              type="number"
              value={newRate.price || ''}
              onChange={(e) => setNewRate({ ...newRate, price: Number(e.target.value) })}
              placeholder="e.g., 14000"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <button
          onClick={handleUnifiedSubmit}
          className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          <Plus size={18} />
          Add Entry
        </button>
      </div>
    </div>
  )

  // No longer using separate renderRoutes

  const renderVehicles = () => (
    <div className="space-y-6">
      {/* Add New Vehicle */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center gap-3 mb-4">
          <Truck className="text-blue-600" size={24} />
          <h2 className="text-xl font-semibold text-gray-800">Add New Vehicle Type</h2>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Label</label>
            <input
              type="text"
              value={newVehicle.label}
              onChange={(e) => setNewVehicle({ ...newVehicle, label: e.target.value })}
              placeholder="e.g., 32FT MXL"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Value</label>
            <input
              type="text"
              value={newVehicle.value}
              onChange={(e) => setNewVehicle({ ...newVehicle, value: e.target.value })}
              placeholder="e.g., 32FT MXL Container"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Default Rate (₹/km)
            </label>
            <input
              type="number"
              value={newVehicle.defaultRate}
              onChange={(e) =>
                setNewVehicle({ ...newVehicle, defaultRate: Number(e.target.value) })
              }
              placeholder="e.g., 25"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Capacity</label>
            <input
              type="number"
              value={newVehicle.capacity}
              onChange={(e) =>
                setNewVehicle({ ...newVehicle, capacity: parseFloat(e.target.value) || 0 })
              }
              placeholder="Capacity (tons)"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              min="0"
              step="0.1"
            />
          </div>
        </div>

        <button
          onClick={handleAddVehicle}
          className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          <Plus size={18} />
          Add Vehicle Type
        </button>
      </div>

      {/* Vehicles List */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Existing Vehicle Types ({vehicles.length})
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b-2 border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Label</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Value</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                  Default Rate
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Created</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {vehicles.map((vehicle) => (
                <tr key={vehicle.id} className="hover:bg-gray-50">
                  {editingVehicle === vehicle.id ? (
                    <>
                      <td className="px-4 py-3">
                        <input
                          type="text"
                          value={editVehicleData.label}
                          onChange={(e) =>
                            setEditVehicleData({ ...editVehicleData, label: e.target.value })
                          }
                          className="w-full px-2 py-1 border rounded"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="text"
                          value={editVehicleData.value}
                          onChange={(e) =>
                            setEditVehicleData({ ...editVehicleData, value: e.target.value })
                          }
                          className="w-full px-2 py-1 border rounded"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          value={editVehicleData.defaultRate}
                          onChange={(e) =>
                            setEditVehicleData({
                              ...editVehicleData,
                              defaultRate: Number(e.target.value),
                            })
                          }
                          className="w-full px-2 py-1 border rounded"
                        />
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {vehicle.createdAt ? new Date(vehicle.createdAt).toLocaleDateString() : '-'}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleUpdateVehicle(vehicle.id)}
                            className="text-green-600 hover:text-green-800"
                          >
                            <Save size={18} />
                          </button>
                          <button
                            onClick={() => setEditingVehicle(null)}
                            className="text-gray-600 hover:text-gray-800"
                          >
                            <X size={18} />
                          </button>
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">
                        {vehicle.label}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">{vehicle.value}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">₹{vehicle.defaultRate}/km</td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {vehicle.createdAt ? new Date(vehicle.createdAt).toLocaleDateString() : '-'}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => {
                              setEditingVehicle(vehicle.id)
                              setEditVehicleData({
                                label: vehicle.label,
                                value: vehicle.value,
                                defaultRate: vehicle.defaultRate,
                              })
                            }}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button
                            onClick={() => handleDeleteVehicle(vehicle.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )

  const renderMasterList = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">
            Master Routes & Rates ({filteredRates.length})
          </h3>

          <div className="flex gap-3">
            <select
              value={filterOrigin}
              onChange={(e) => setFilterOrigin(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="">All Origins</option>
              {getUniqueOrigins().map((origin) => (
                <option key={origin} value={origin}>{origin}</option>
              ))}
            </select>

            <select
              value={filterDestination}
              onChange={(e) => setFilterDestination(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="">All Destinations</option>
              {getUniqueDestinations().map((dest) => (
                <option key={dest} value={dest}>{dest}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b-2 border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Origin</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Destination</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Vehicle Type</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Capacity</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Rate (₹)</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredRates.length > 0 ? (
                filteredRates.map((rate) => (
                  <tr key={rate.id} className="hover:bg-gray-50">
                    {editingRate === rate.id ? (
                      <>
                        <td className="px-4 py-3">
                          <select
                            value={editRateData.origin}
                            onChange={(e) => setEditRateData({ ...editRateData, origin: e.target.value })}
                            className="w-full px-2 py-1 border rounded"
                          >
                            {getUniqueOrigins().map((origin) => (
                              <option key={origin} value={origin}>{origin}</option>
                            ))}
                          </select>
                        </td>
                        <td className="px-4 py-3">
                          <select
                            value={editRateData.destination}
                            onChange={(e) => setEditRateData({ ...editRateData, destination: e.target.value })}
                            className="w-full px-2 py-1 border rounded"
                          >
                            {getUniqueDestinations().map((dest) => (
                              <option key={dest} value={dest}>{dest}</option>
                            ))}
                          </select>
                        </td>
                        <td className="px-4 py-3" colSpan={2}>
                          <select
                            value={editRateData.vehicleType}
                            onChange={(e) => {
                              const v = vehicles.find(vh => vh.label === e.target.value);
                              setEditRateData({
                                ...editRateData,
                                vehicleType: e.target.value,
                                containerType: v?.value || '',
                                capacity: v?.capacity || 0
                              });
                            }}
                            className="w-full px-2 py-1 border rounded"
                          >
                            {vehicles.map((v) => (
                              <option key={v.id} value={v.label}>{v.label}</option>
                            ))}
                          </select>
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="number"
                            value={editRateData.price}
                            onChange={(e) => setEditRateData({ ...editRateData, price: Number(e.target.value) })}
                            className="w-full px-2 py-1 border rounded"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex justify-end gap-2">
                            <button onClick={() => handleUpdateRate(rate.id)} className="text-green-600 hover:text-green-800">
                              <Save size={18} />
                            </button>
                            <button onClick={() => setEditingRate(null)} className="text-gray-600 hover:text-gray-800">
                              <X size={18} />
                            </button>
                          </div>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{rate.origin}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">{rate.destination}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{rate.vehicleType}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{rate.capacity} {rate.unit || 'Ton'}</td>
                        <td className="px-4 py-3 text-sm font-semibold text-green-600">₹{rate.price.toLocaleString()}</td>
                        <td className="px-4 py-3">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => {
                                const matchingVehicle = vehicles.find(v => v.label === rate.vehicleType);
                                setEditingRate(rate.id)
                                setEditRateData({
                                  origin: rate.origin,
                                  destination: rate.destination,
                                  price: rate.price,
                                  vehicleType: rate.vehicleType,
                                  containerType: matchingVehicle?.value || '',
                                  capacity: matchingVehicle?.capacity || 0,
                                  unit: rate.unit || 'Ton',
                                })
                              }}
                              className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                              title="Edit Rate"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              onClick={() => handleDeleteRate(rate.id)}
                              className="text-red-600 hover:text-red-800"
                              title="Delete Rate"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                    No matching rates found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )

  /* ============================
     MAIN RENDER
  ============================ */

  return (
    <div className="bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Rate Master</h1>
            <p className="text-gray-600">
              Manage routes and rates for your transport system
            </p>
          </div>
        </div>

        <div className="space-y-8 relative">
          {(routesLoading || vehiclesLoading || ratesLoading) && (
            <div className="absolute inset-0 bg-white/30 flex items-center justify-center z-10 rounded-lg">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          )}

          {/* Unified Form Section */}
          <section id="unified-entry-form">
            {renderUnifiedForm()}
          </section>

          {/* Master List Section */}
          <section id="master-list-management">
            {ratesError ? (
              <div className="p-4 bg-red-50 text-red-700 rounded-lg mb-6">
                Error loading rates: {ratesError.message}
              </div>
            ) : (
              <div className="mb-8">
                {renderMasterList()}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  )
}

export default AddRoute
