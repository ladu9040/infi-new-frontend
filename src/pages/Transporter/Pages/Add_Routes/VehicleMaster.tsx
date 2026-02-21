'use client'

import { useState } from 'react'
import { Plus, Trash2, Edit2, Save, X, Truck } from 'lucide-react'
import { toast } from 'react-toastify'
import { useMutation, useQuery } from '@apollo/client/react'
import {
  ADD_VEHICLE_TYPES,
  DELETE_VEHICLE_TYPES,
  GET_ALL_VEHICLE_TYPES,
  UPDATE_VEHICLE_TYPES,
} from './addRoute.gql'
import type {
  GetAllVehicleTypesResponse,
} from './AddRoutes.types'

export const VehicleMaster = () => {
  // Vehicles Data
  const { data: vehiclesData, loading: vehiclesLoading, error: vehiclesError, refetch: refetchVehicles } =
    useQuery<GetAllVehicleTypesResponse>(GET_ALL_VEHICLE_TYPES, {
      fetchPolicy: 'cache-and-network'
    });

  const vehicles = vehiclesData?.getAllVehicleTypes || [];

  const [newVehicle, setNewVehicle] = useState({
    label: '',
    value: '',
    defaultRate: 0,
    capacity: 0,
    showVehicleMileage: false,
    mileage: 0,
    vehicleTypeCategory: 'open',
  })
  const [editingVehicle, setEditingVehicle] = useState<string | null>(null)
  const [editVehicleData, setEditVehicleData] = useState({ 
    label: '', 
    value: '', 
    defaultRate: 0, 
    capacity: 0,
    showVehicleMileage: false,
    mileage: 0,
    vehicleTypeCategory: 'open'
  })

  /* ============================
     MUTATIONS - VEHICLES
  ============================ */

  const [addVehicleMutation] = useMutation(ADD_VEHICLE_TYPES, {
    refetchQueries: [{ query: GET_ALL_VEHICLE_TYPES }]
  })
  const [updateVehicleMutation] = useMutation(UPDATE_VEHICLE_TYPES, {
    refetchQueries: [{ query: GET_ALL_VEHICLE_TYPES }]
  })
  const [deleteVehicleMutation] = useMutation(DELETE_VEHICLE_TYPES, {
    refetchQueries: [{ query: GET_ALL_VEHICLE_TYPES }]
  })

  const handleAddVehicle = async () => {
    if (!newVehicle.label || !newVehicle.value || newVehicle.defaultRate <= 0) {
      toast.error('Please fill in all fields')
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
            showVehicleMileage: newVehicle.showVehicleMileage,
            mileage: newVehicle.mileage,
            vehicleTypeCategory: newVehicle.vehicleTypeCategory,
          },
        },
      })
      setNewVehicle({ 
        label: '', 
        value: '', 
        defaultRate: 0, 
        capacity: 0,
        showVehicleMileage: false,
        mileage: 0,
        vehicleTypeCategory: 'open'
      })
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
            capacity: editVehicleData.capacity,
            showVehicleMileage: editVehicleData.showVehicleMileage,
            mileage: editVehicleData.mileage,
            vehicleTypeCategory: editVehicleData.vehicleTypeCategory,
          }
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

  if (vehiclesLoading && !vehiclesData) {
    return <div className="flex items-center justify-center p-8">Loading vehicles...</div>
  }

  return (
    <div className="space-y-6">
      {/* Add New Vehicle */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center gap-3 mb-4">
          <Truck className="text-blue-600" size={24} />
          <h2 className="text-xl font-semibold text-gray-800">Add New Vehicle Type</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
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
              value={newVehicle.defaultRate || ''}
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
              value={newVehicle.capacity || ''}
              onChange={(e) =>
                setNewVehicle({ ...newVehicle, capacity: parseFloat(e.target.value) || 0 })
              }
              placeholder="Capacity (tons)"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              min="0"
              step="0.1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <select
              value={newVehicle.vehicleTypeCategory}
              onChange={(e) => setNewVehicle({ ...newVehicle, vehicleTypeCategory: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="open">Open</option>
              <option value="trailer">Trailer</option>
              <option value="container">Container</option>
              <option value="refer vehicle/cold storage">Refer Vehicle/Cold Storage</option>
            </select>
          </div>
          {newVehicle.showVehicleMileage && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Mileage (km/l)</label>
              <input
                type="number"
                value={newVehicle.mileage || ''}
                onChange={(e) => setNewVehicle({ ...newVehicle, mileage: Number(e.target.value) })}
                placeholder="e.g., 5"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          )}
          <div className="flex items-center gap-2 pt-8">
            <input
              type="checkbox"
              id="showMileage"
              checked={newVehicle.showVehicleMileage}
              onChange={(e) => setNewVehicle({ ...newVehicle, showVehicleMileage: e.target.checked })}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="showMileage" className="text-sm font-medium text-gray-700">
              Show Vehicle Mileage
            </label>
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
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Capacity</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Category</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Mileage</th>
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
                          value={editVehicleData.defaultRate === 0 ? '' : editVehicleData.defaultRate}
                          onChange={(e) =>
                            setEditVehicleData({
                              ...editVehicleData,
                              defaultRate: Number(e.target.value),
                            })
                          }
                          className="w-full px-2 py-1 border rounded"
                          placeholder="0"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          value={editVehicleData.capacity === 0 ? '' : editVehicleData.capacity}
                          onChange={(e) =>
                            setEditVehicleData({
                              ...editVehicleData,
                              capacity: Number(e.target.value),
                            })
                          }
                          className="w-full px-2 py-1 border rounded"
                          placeholder="0"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={editVehicleData.vehicleTypeCategory}
                          onChange={(e) =>
                            setEditVehicleData({ ...editVehicleData, vehicleTypeCategory: e.target.value })
                          }
                          className="w-full px-2 py-1 border rounded"
                        >
                          <option value="open">Open</option>
                          <option value="trailer">Trailer</option>
                          <option value="container">Container</option>
                          <option value="refer vehicle/cold storage">Refer Vehicle/Cold Storage</option>
                        </select>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex flex-col items-center gap-1">
                          <input
                            type="checkbox"
                            checked={editVehicleData.showVehicleMileage}
                            onChange={(e) =>
                              setEditVehicleData({ ...editVehicleData, showVehicleMileage: e.target.checked })
                            }
                          />
                          {editVehicleData.showVehicleMileage && (
                            <input
                              type="number"
                              value={editVehicleData.mileage === 0 ? '' : editVehicleData.mileage}
                              onChange={(e) =>
                                setEditVehicleData({ ...editVehicleData, mileage: Number(e.target.value) })
                              }
                              className="w-16 px-1 py-0.5 border rounded text-xs"
                              placeholder="0"
                            />
                          )}
                        </div>
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
                      <td className="px-4 py-3 text-sm text-gray-700">{vehicle.capacity} Tons</td>
                      <td className="px-4 py-3 text-sm text-gray-700 capitalize">{vehicle.vehicleTypeCategory || 'open'}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {vehicle.showVehicleMileage ? `${vehicle.mileage || 0} km/l` : 'No'}
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
                                capacity: vehicle.capacity,
                                showVehicleMileage: vehicle.showVehicleMileage || false,
                                mileage: vehicle.mileage || 0,
                                vehicleTypeCategory: vehicle.vehicleTypeCategory || 'open',
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
}
