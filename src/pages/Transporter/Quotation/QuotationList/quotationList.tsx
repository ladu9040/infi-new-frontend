'use client'
import { FilePlus, Eye, Calendar, IndianRupee } from 'lucide-react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import { useQuery } from '@apollo/client/react'
import { NotificationBell } from '../../../../components/NotificationBell/NotificationBell'
import { GET_VENDOR_QUOTATIONS } from './quotationList.gql'
import { BackButton } from '../../../../components/common/BackButton'

interface QuotationRow {
  from: string
  to: string
  vehicleSize: string
  tat: number
  vendorExtraAmount?: number
  total: number
}

interface Quotation {
  id: string
  quotationNumber: string
  status: string
  createdAt: string
  updatedAt: string
  transporterRows: QuotationRow[]
  vendorRows?: QuotationRow[]
}

interface GetVendorQuotationsData {
  getVendorQuotations: Quotation[]
}

interface GetVendorQuotationsVars {
  vendorId: string
}

interface QuotationListProps {
  vendorId?: string
  onBack?: () => void
  onCreateQuotation?: () => void
}

export const QuotationList = ({ vendorId: propVendorId, onBack, onCreateQuotation }: QuotationListProps) => {
  const navigate = useNavigate()
  const params = useParams<{ vendorId: string }>()
  const vendorId = propVendorId || params.vendorId
  const location = useLocation()

  // Get vendor details from navigation state
  const vendorName = location.state?.vendorName || 'Vendor'
  const vendorCode = location.state?.vendorCode || ''

  const { data, loading, error } = useQuery<
    GetVendorQuotationsData,
    GetVendorQuotationsVars
  >(GET_VENDOR_QUOTATIONS, {
    variables: { vendorId: vendorId! },
    skip: !vendorId,
  })

  const quotations = data?.getVendorQuotations || []
  const quotationIds = quotations.map((q) => q.id)

  const handleCreateQuotation = () => {
    if (onCreateQuotation) {
      onCreateQuotation()
      return
    }
    navigate(`/create-quotation/${vendorId}`, {
      state: {
        vendorId,
        vendorName,
        vendorCode,
      },
    })
  }

  const handleViewQuotation = (quotationId: string) => {
    navigate(`/quotation-review/${quotationId}`)
  }

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<
      string,
      { bg: string; text: string; label: string }
    > = {
      DRAFT: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Draft' },
      SENT: {
        bg: 'bg-blue-100',
        text: 'text-blue-700',
        label: 'Sent to Vendor',
      },
      VENDOR_UPDATED: {
        bg: 'bg-purple-100',
        text: 'text-purple-700',
        label: 'Vendor Updated',
      },
      APPROVED: {
        bg: 'bg-green-100',
        text: 'text-green-700',
        label: 'Approved',
      },
      REJECTED: {
        bg: 'bg-red-100',
        text: 'text-red-700',
        label: 'Rejected',
      },
      FINAL_SENT: {
        bg: 'bg-emerald-100',
        text: 'text-emerald-700',
        label: 'Final Sent',
      },
    }

    const config = statusConfig[status] || statusConfig.DRAFT

    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}
      >
        {config.label}
      </span>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(Number(dateString)).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }


  const calculateTotal = (rows: QuotationRow[]) => {
    return rows.reduce((sum, row) => sum + (row.total || 0), 0)
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow">
        <div className="border-b border-gray-200 p-6">
          <div className="flex items-center gap-4">
            <BackButton 
              onClick={onBack} 
              to="/trans-dashboard"
              title="Back"
            />
            <div>
              <h2 className="text-xl font-semibold text-gray-800">
                Vendor Quotations
              </h2>
              <p className="text-sm text-gray-500">Loading...</p>
            </div>
          </div>
        </div>
        <div className="p-6">
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
            <p className="mt-2 text-gray-500">Loading quotations...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow">
        <div className="border-b border-gray-200 p-6">
          <div className="flex items-center gap-4">
            <BackButton 
              to="/trans-dashboard"
              title="Back to dashboard"
            />
            <div>
              <h2 className="text-xl font-semibold text-gray-800">
                Vendor Quotations
              </h2>
            </div>
          </div>
        </div>
        <div className="p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-700">Error loading quotations: {error.message}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow">
      <div className="border-b border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <BackButton 
              to="/trans-dashboard"
              title="Back to dashboard"
            />
            <div>
              <h2 className="text-xl font-semibold text-gray-800">
                Quotations for {vendorName}
              </h2>
              <p className="text-sm text-gray-500">
                Vendor Code: {vendorCode} • Total: {quotations.length}{' '}
                quotation{quotations.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <NotificationBell filterQuotationIds={quotationIds} />

            <button
              onClick={handleCreateQuotation}
              className="bg-gradient-to-r from-amber-600 to-amber-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:from-amber-700 hover:to-amber-700 transition-all shadow-sm hover:shadow flex items-center gap-2"
            >
              <FilePlus size={16} />
              Create Quotation
            </button>
          </div>
        </div>
      </div>

      <div className="p-6">
        {quotations.length === 0 ? (
          <div className="text-center py-12">
            <FilePlus size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No quotations yet
            </h3>
            <p className="text-gray-500 mb-6">
              Create your first quotation for this vendor to get started
            </p>
            <button
              onClick={handleCreateQuotation}
              className="bg-amber-600 text-white px-6 py-2 rounded-lg hover:bg-amber-700 transition-colors"
            >
              Create First Quotation
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quotation #
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Items
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {quotations.map((quotation) => (
                  <tr
                    key={quotation.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {quotation.quotationNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(quotation.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(quotation.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {quotation.transporterRows.length} item
                      {quotation.transporterRows.length !== 1 ? 's' : ''}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                      ₹{' '}
                      {calculateTotal(quotation.transporterRows).toLocaleString(
                        'en-IN'
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => handleViewQuotation(quotation.id)}
                        className="text-amber-600 hover:text-amber-700 font-medium flex items-center gap-1"
                      >
                        <Eye size={16} />
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}