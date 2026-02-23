import { useMutation, useQuery } from '@apollo/client/react'
import { Pencil, Trash2, Plus, FileText, Send } from 'lucide-react'
import { useState, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { DELETE_VENDOR, GET_ALL_VENDORS, SEND_RFI } from './VendorList.gql'
import type { GetAllVendorsResponse, VendorListProps } from './VendorList.types'
import { RfiPreviewModal } from './RfiPreviewModal'
import { AuthContext } from '../../../../../context/AuthContextObject'
import { ConfirmationModal } from '../../../../../components/common/ConfirmationModal'
import Loader from '../../../../../components/common/Loader'

export const Vendor_List = ({ onAddVendor, onViewQuotations }: VendorListProps) => {
  const [selectedVendorId, setSelectedVendorId] = useState<string | null>(null)
  const [rfiModalOpen, setRfiModalOpen] = useState(false)
  const [vendorForRfi, setVendorForRfi] = useState<{ id: string; name: string } | null>(null)
  
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [vendorToDelete, setVendorToDelete] = useState<string | null>(null)
  
  const authContext = useContext(AuthContext)
  const user = authContext?.user

  const [sendRFI, { loading: sendingRfi }] = useMutation(SEND_RFI, {
    onCompleted: () => {
      toast.success('RFI sent successfully')
      setRfiModalOpen(false)
      setVendorForRfi(null)
      refetch()
    },
    onError: (err) => {
      toast.error(err.message)
    },
  })

  const { data, loading, error, refetch } = useQuery<GetAllVendorsResponse>(GET_ALL_VENDORS)

  const [deleteVendor] = useMutation(DELETE_VENDOR, {
    onCompleted: () => refetch(),
  })

  // OPEN MODAL
  const handleOpenRfiPreview = (vendorId: string, vendorName: string) => {
      setVendorForRfi({ id: vendorId, name: vendorName })
      setRfiModalOpen(true)
  }

  // SEND MSG
  const handleSendRfi = (message: string) => {
      if (!vendorForRfi) return
      sendRFI({ 
          variables: { 
              vendorId: vendorForRfi.id,
              customMessage: message 
          } 
      })
  }

  if (loading) {
    return <div className="flex items-center justify-center p-12 text-amber-600 font-medium">Loading vendors...</div>
  }


  if (error) {
    return <div className="bg-red-50 p-6 rounded-xl text-red-600">{error.message}</div>
  }

  if (!data || data.getAllVendors.length === 0) {
    return (
      <div className="space-y-6 bg-gray-50 p-6 rounded-xl">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800">Vendors</h2>

          <button
            onClick={onAddVendor}
            className="flex items-center gap-2
            bg-amber-600 text-white px-4 py-2 rounded-lg
            text-sm font-medium hover:bg-amber-700 transition"
          >
            <Plus size={16} />
            Add Vendor
          </button>
        </div>

        <p className="text-gray-500 text-center">No vendors found</p>
      </div>
    )
  }

  const handleDelete = (id: string) => {
    setVendorToDelete(id)
    setDeleteModalOpen(true)
  }

  const confirmDelete = async () => {
    if (!vendorToDelete) return
    await deleteVendor({
      variables: { id: vendorToDelete },
    })
    setVendorToDelete(null)
    toast.success('Vendor deleted successfully')
  }

  return (
    <div className="space-y-6 bg-gray-50 p-6 rounded-xl">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-800">Vendors</h2>

          <button
            onClick={onAddVendor}
            className="flex items-center gap-2
            bg-amber-600 text-white px-4 py-2 rounded-lg
            text-sm font-medium hover:bg-amber-700 transition"
          >
            <Plus size={16} />
            Add Vendor
          </button>
        </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow border border-gray-200 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 text-gray-600">
            <tr>
              <th className="px-4 py-3 text-left">Vendor Code</th>
              <th className="px-4 py-3 text-left">Vendor Name</th>
              <th className="px-4 py-3 text-left">Contact</th>
              <th className="px-4 py-3 text-left">Industry</th>
              <th className="px-4 py-3 text-left">Vehicles</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            {data.getAllVendors.map((vendor) => {
              const isSelected = selectedVendorId === vendor.id

              return (
                <tr
                  key={vendor.id}
                  onClick={() => setSelectedVendorId(vendor.id)}
                  className={`border-t cursor-pointer transition
              ${isSelected ? 'bg-amber-50' : 'hover:bg-gray-50'}
            `}
                >
                  {/* Vendor Code */}
                  <td className="px-4 py-3 font-medium">{vendor.vendorCode}</td>

                  {/* Vendor Name */}
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-800">{vendor.vendorName}</div>
                    <div className="text-xs text-gray-500">{vendor.worksWithTopCompanies}</div>
                  </td>

                  {/* Contact */}
                  <td className="px-4 py-3">
                    <div>{vendor.contactPerson}</div>
                    <div className="text-xs text-gray-500">{vendor.mobile}</div>
                  </td>

                  {/* Industry */}
                  <td className="px-4 py-3">{vendor.majorIndustry || '-'}</td>

                  {/* Vehicles */}
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {vendor.vehicleTypes && vendor.vehicleTypes.length > 0 ? (
                        vendor.vehicleTypes.map((v) => (
                          <span
                            key={v}
                            className="bg-gray-100 text-gray-600 text-[10px] px-1.5 py-0.5 rounded border border-gray-200"
                          >
                            {v.replace('_', ' ')}
                          </span>
                        ))
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </div>
                  </td>

                  {/* Status */}
                  <td className="px-4 py-3">
                    <span
                      className="text-xs px-2 py-1 rounded-full
                bg-blue-100 text-blue-700"
                    >
                      Ready
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                      {/* SEND RFI */}
                      <button
                        title="Send RFI"
                        onClick={() => handleOpenRfiPreview(vendor.id, vendor.vendorName)}
                        className="p-2 rounded-lg
                  bg-blue-50 text-blue-600
                  hover:bg-blue-100 transition"
                      >
                        <Send size={16} />
                      </button>

                      {/* VIEW QUOTATIONS - Updated to navigate to quotation list */}
                      <button
                        title="View Quotations"
                        onClick={() => onViewQuotations(vendor.id)}
                        className="p-2 rounded-lg
    bg-green-50 text-green-600
    hover:bg-green-100 transition"
                      >
                        <FileText size={16} />
                      </button>

                      {/* EDIT */}
                      <button
                        title="Edit Vendor"
                        onClick={() => toast.info('Edit feature coming soon')}
                        className="p-2 rounded-lg
                  bg-amber-50 text-amber-600
                  hover:bg-amber-100 transition"
                      >
                        <Pencil size={16} />
                      </button>

                      {/* DELETE */}
                      <button
                        title="Delete Vendor"
                        onClick={() => handleDelete(vendor.id)}
                        className="p-2 rounded-lg
                  bg-red-50 text-red-600
                  hover:bg-red-100 transition"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <RfiPreviewModal 
        isOpen={rfiModalOpen}
        onClose={() => setRfiModalOpen(false)}
        onSend={handleSendRfi}
        vendorName={vendorForRfi?.name || ''}
        companyName={user?.companyName || user?.fullName || 'Us'}
        isLoading={sendingRfi}
      />

      <ConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => {
            setDeleteModalOpen(false)
            setVendorToDelete(null)
        }}
        onConfirm={confirmDelete}
        title="Delete Vendor"
        message="Are you sure you want to delete this vendor? This action cannot be undone."
        confirmText="Delete Vendor"
        cancelText="Cancel"
        type="danger"
      />
    </div>
  )
}
