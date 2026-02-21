'use client'

import { useEffect, useMemo, useState } from 'react'
import { toast } from 'react-toastify'
import { Plus, Trash2, ChevronLeft } from 'lucide-react'
import { useParams, useNavigate } from 'react-router-dom'
import { useMutation, useQuery } from '@apollo/client/react'
import { PlaceAutocomplete } from '../../../../components/placeAutocomplete'
import { getDistance } from '../../../../utils/calcDistance'
import type { Props, QuotationGQL, QuotationRowGQL, Row } from './createQuotation.types'
import {
  GET_QUOTATION_BY_ID,
  SAVE_QUOTATION_DRAFT,
  SEND_QUOTATION_TO_VENDOR,
  SUBMIT_QUOTATION_BY_VENDOR,
  SEND_QUOTATION_PDF,
  CANCEL_QUOTATION,
} from './createQuotation.gql'
import RateMaster from '../rateMasters/rateMasters'
import { BackButton } from '../../../../components/common/BackButton'

const VEHICLES = [
  { label: '32FT MXL', value: '32FT MXL Container', defaultRate: 25 },
  { label: '32FT SXL', value: '32FT SXL Container', defaultRate: 23 },
  { label: '20-24 FT', value: '20-24 FT Container', defaultRate: 20 },
  { label: '17-24 FT', value: '17-24 FT Open', defaultRate: 18 },
  { label: '10 Whl', value: '10 WHL Open', defaultRate: 15 },
  { label: '12 Whl', value: '12 WHL Open', defaultRate: 16 },
  { label: '14 Whl', value: '14 WHL Open', defaultRate: 17 },
]

const formatDateForInput = (dateStr?: string) => {
  if (!dateStr) return ''
  try {
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return ''
    return d.toISOString().split('T')[0]
  } catch (err) {
    console.error('Date parsing error:', err)
    return ''
  }
}

interface GetQuotationByIdData {
  getQuotationById: QuotationGQL | null
}

interface GetQuotationByIdVars {
  quotationId: string
}

interface SaveQuotationDraftData {
  saveQuotationDraft: { id: string; status: string }
}

interface SaveQuotationDraftVars {
  vendorId: string
  rows: QuotationRowGQL[]
  quotationId?: string
}

interface SubmitQuotationByVendorData {
  submitQuotationByVendor: { id: string; status: string }
}

interface SubmitQuotationByVendorVars {
  quotationId: string
  rows: QuotationRowGQL[]
  access: string
}

interface SendQuotationToVendorData {
  sendQuotationToVendor: { id: string; status: string }
}

interface SendQuotationToVendorVars {
  quotationId: string
}

export const CreateQuotation = ({ mode, vendorId: propVendorId, onBack }: Props) => {
  const isTransporter = mode === 'TRANSPORTER'
  const isVendor = mode === 'VENDOR'
  const isReview = mode === 'REVIEW'

  const params = useParams<{
    vendorId?: string
    quotationId?: string
  }>()
  const navigate = useNavigate()

  const vendorId = propVendorId || params.vendorId
  const quotationId = params.quotationId

  const [draftQuotationId, setDraftQuotationId] = useState<string | null>(null)
  const [rows, setRows] = useState<Row[]>([])
  const [showRateMaster, setShowRateMaster] = useState(false)
  const [isEditing, setIsEditing] = useState(true)

  /* ============================
     FETCH QUOTATION (VENDOR)
  ============================ */

  const { data } = useQuery<GetQuotationByIdData, GetQuotationByIdVars>(GET_QUOTATION_BY_ID, {
    variables: { quotationId: quotationId! },
    skip: !quotationId,
  })

  const currentQuotationId = draftQuotationId ?? data?.getQuotationById?.id ?? quotationId ?? null

  const sourceRows = useMemo<QuotationRowGQL[]>(() => {
    const q = data?.getQuotationById
    if (!q) return []

    if (isVendor || isReview) {
      return q.vendorRows?.length ? q.vendorRows : (q.transporterRows ?? [])
    }

    return q.transporterRows ?? []
  }, [data, isVendor, isReview])

  const mappedRows = useMemo(() => {
    return sourceRows.map((r) => {
      const vehicle = VEHICLES.find((v) => v.label === r.vehicleSize) ?? VEHICLES[0]

      return {
        from: { label: r.from },
        to: { label: r.to },
        vehicle,
        ratePerKm: vehicle.defaultRate,
        distanceKm: r.distance || 0,
        tat: r.tat,
        amendedAmount: r.vendorExtraAmount || 0,
        ton: r.ton || 0,
        date: r.date || new Date().toISOString(),
        price: r.price || undefined,
        total: r.total || 0,
      }
    })
  }, [sourceRows])

  useEffect(() => {
    setRows(mappedRows)
    // If we loaded an existing quotation, lock it initially (unless it's empty/new)
    if (sourceRows.length > 0 && isTransporter) {
      setIsEditing(false)
    }
  }, [mappedRows, sourceRows.length, isTransporter])

  /* ============================
     RATE MASTER HANDLERS
  ============================ */

  const handleOpenRateMaster = () => {
    setShowRateMaster(true)
  }

  const handleCloseRateMaster = () => {
    setShowRateMaster(false)
  }

  const handleAddToQuotation = (rate: any) => {
    try {
      console.log('Adding rate to quotation:', rate)
      
      // Map container type from rate master to vehicle size
      // We now use vehicleType directly from the backend as it matches our labels
      const vehicleLabel = rate.vehicleType || '20-24 FT'
      const vehicle = VEHICLES.find((v) => v.label === vehicleLabel) || VEHICLES[2]

      const newRow = {
        from: { label: rate.origin || '' },
        to: { label: rate.destination || '' },
        vehicle,
        ratePerKm: vehicle.defaultRate,
        distanceKm: 0, // Will be commented out in display
        tat: 1,
        amendedAmount: 0,
        ton: rate.capacity || 0,
        date: rate.createdAt || new Date().toISOString(),
        price: rate.price || 0,
      }

      setRows((prev) => [...prev, newRow])
      setShowRateMaster(false) // Close the modal after adding
    } catch (err: any) {
      console.error('Error adding rate to quotation:', err)
      toast.error('Failed to add rate to quotation: ' + (err.message || 'Unknown error'))
    }
  }

  /* ============================
     MUTATIONS
  ============================ */

  const [saveDraft] = useMutation<SaveQuotationDraftData, SaveQuotationDraftVars>(
    SAVE_QUOTATION_DRAFT,
  )

  const [sendToVendor] = useMutation<SendQuotationToVendorData, SendQuotationToVendorVars>(
    SEND_QUOTATION_TO_VENDOR,
  )

  const [submitByVendor] = useMutation<SubmitQuotationByVendorData, SubmitQuotationByVendorVars>(
    SUBMIT_QUOTATION_BY_VENDOR,
  )

  const [sendQuotationPdf] = useMutation(SEND_QUOTATION_PDF)
  const [cancelQuotation] = useMutation(CANCEL_QUOTATION)

  /* ============================
     HELPERS
  ============================ */

  const handleFromSelect = async (i: number, v: any) => {
    updateRow(i, { from: v })

    const row = rows[i]
    if (row?.to) {
      const res = await getDistance(v.label, row.to.label)
      if (res) updateRow(i, { distanceKm: res.distanceKm })
    }
  }

  const handleToSelect = async (i: number, v: any) => {
    updateRow(i, { to: v })

    const row = rows[i]
    if (row?.from) {
      const res = await getDistance(row.from.label, v.label)
      if (res) updateRow(i, { distanceKm: res.distanceKm })
    }
  }

  const updateRow = (i: number, patch: Partial<Row>) => {
    setRows((prev) => prev.map((r, idx) => (idx === i ? { ...r, ...patch } : r)))
  }

  const addRow = () => {
    setRows((prev) => [
      ...prev,
      {
        from: null,
        to: null,
        vehicle: VEHICLES[0],
        ratePerKm: VEHICLES[0].defaultRate,
        distanceKm: 0,
        tat: 1,
        amendedAmount: 0,
        ton: 0,
        date: new Date().toISOString(),
      },
    ])
  }

  const removeRow = (i: number) => {
    setRows((prev) => prev.filter((_, index) => index !== i))
  }

  const calculateTotal = (row: Row) => {
    // If total or price is already present (e.g. from backend/manual override), use it
    if (row.total && !isNaN(row.total)) {
       return Math.round(row.total);
    }

    // If price is already set from rate master, use it
    if (row.price && !isNaN(row.price)) {
      return Math.round(row.price + (row.amendedAmount || 0))
    }

    // Otherwise calculate from rate per km
    const ratePerKm = row.ratePerKm || 0
    const distanceKm = row.distanceKm || 0
    const base = ratePerKm * distanceKm
    return Math.round(base + (row.amendedAmount || 0))
  }

  const grandTotal = rows.reduce((sum, r) => sum + (calculateTotal(r) || 0), 0)

  /* ============================
     SUBMIT
  ============================ */

  const handleSendPdf = async () => {
    if (!currentQuotationId) return

    // Generate Contract ID
    const contractId = `CON-${Date.now()}-${Math.floor(Math.random() * 1000)}`

    try {
      await sendQuotationPdf({
        variables: { quotationId: currentQuotationId, contractId },
      })

      toast.success('Quotation PDF sent to vendor')
      navigate(-1)
    } catch (err: any) {
      toast.error(err.message || 'Failed to send PDF')
    }
  }

  const handleCancelQuotation = async () => {
    if (!currentQuotationId) return

    const confirmCancel = window.confirm('Are you sure you want to cancel this quotation?')
    if (!confirmCancel) return

    try {
      await cancelQuotation({
        variables: { quotationId: currentQuotationId },
      })

      toast.success('Quotation cancelled and vendor notified')
    } catch (err: any) {
      toast.error(err.message || 'Failed to cancel quotation')
    }
  }

  const handleSubmit = async () => {
    const formattedRows = rows.map((r) => ({
      from: r.from?.label || '',
      to: r.to?.label || '',
      vehicleSize: r.vehicle.label,
      tat: r.tat,
      distance: r.distanceKm,
      vendorExtraAmount: r.amendedAmount,
      total: calculateTotal(r),
      ton: r.ton || 0,
      date: r.date || new Date().toISOString().split('T')[0],
      price: r.price || undefined,
    }))

    const search = new URLSearchParams(window.location.search)
    const access = search.get('access')

    if (isTransporter && isEditing) {
      const res = await saveDraft({
        variables: { 
          vendorId: vendorId!, 
          rows: formattedRows,
          quotationId: currentQuotationId ?? undefined
        },
      })
      if (!draftQuotationId) setDraftQuotationId(res.data?.saveQuotationDraft.id ?? null)
      setIsEditing(false)
      toast.success('Draft saved')
      return
    }

    if (isTransporter && !isEditing && currentQuotationId) {
      await sendToVendor({ variables: { quotationId: currentQuotationId } })
      toast.success('Quotation sent to vendor')
      navigate(-1)
      return
    }

    if (isVendor && currentQuotationId) {
      if (!access) {
        toast.error('Invalid or expired quotation link')
        return
      }

      await submitByVendor({
        variables: {
          quotationId: currentQuotationId,
          rows: formattedRows,
          access,
        },
      })

      toast.success('Quotation sent back to transporter')
    }
  }

  if (isVendor && !quotationId) {
    return <div className="p-6">Invalid quotation link</div>
  }

  if (isTransporter && !vendorId) {
    return <div className="p-6">Invalid vendor link</div>
  }

  /* ============================
     UI
  ============================ */

  return (
    <div className="min-h-screen bg-white font-sans text-slate-800 pb-32">
      {/* Rate Master Modal Overlay */}
      {showRateMaster && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-xl shadow-2xl ring-1 ring-slate-200 w-full max-w-7xl max-h-[90vh] overflow-hidden flex flex-col transform transition-all scale-100">
            <div className="flex justify-between items-center p-6 border-b border-slate-100">
              <div>
                <h2 className="text-xl font-bold text-slate-800">Select Route</h2>
                <p className="text-sm text-slate-500 font-medium">Add from Rate Master</p>
              </div>
              <button
                onClick={handleCloseRateMaster}
                className="text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full p-2 transition-colors"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-0">
              <RateMaster onAddToQuotation={handleAddToQuotation} />
            </div>
          </div>
        </div>
      )}

      {/* Main Container - Full Width */}
      <div className="w-full">
        
        {/* Header Section - Reference Style */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 py-4 px-6 border-b border-slate-200 bg-white sticky top-0 z-30">
          <div className="flex items-center gap-3">
            {(onBack || !isVendor) && (
              <BackButton 
                onClick={onBack} 
                title="Go Back" 
              />
            )}
            <div>
              <h1 className="text-lg font-bold text-slate-800">
                {isTransporter
                  ? 'Create Quotation'
                  : isVendor
                    ? 'Review Quotation'
                    : 'Quotation Review'}
              </h1>
              <p className="text-xs text-slate-500 font-medium">
                {isTransporter ? 'Drafting New Quote • ' + (rows.length) + ' items' : 'Vendor Review Mode'}
              </p>
            </div>
          </div>

          {/* Top Actions - Primary Actions Here */}
          <div className="flex items-center gap-3">
             {isTransporter && !isReview && (
               <>
                {isEditing ? (
                  <>
                    <button
                        onClick={handleOpenRateMaster}
                        className="text-orange-600 hover:text-orange-700 text-sm font-semibold px-3 py-2 transition-colors"
                    >
                        + Load from Master
                    </button>
                    <button
                        onClick={addRow}
                        className="text-slate-600 hover:text-slate-800 text-sm font-semibold px-3 py-2 transition-colors"
                    >
                        + Add Row
                    </button>
                  </>
                ) : (
                  <button
                      onClick={() => setIsEditing(true)}
                      className="text-orange-600 hover:text-orange-700 text-sm font-semibold px-3 py-2 transition-colors border border-orange-100 rounded-md hover:bg-orange-50 bg-white"
                  >
                      Edit
                  </button>
                )}
               </>
            )}



            {currentQuotationId && (
                <>
                {(isTransporter || isReview) && (
                  <button
                      onClick={handleCancelQuotation}
                      className="text-red-500 hover:text-red-700 text-sm font-semibold px-3 py-2 transition-colors border border-red-100 rounded-md hover:bg-red-50 bg-white"
                      title="Cancel Quotation"
                  >
                      Cancel
                  </button>
                )}
                
                {isReview && (
                  <button
                      onClick={handleSendPdf}
                      className="text-slate-600 hover:text-slate-800 text-sm font-semibold px-3 py-2 transition-colors border border-slate-200 rounded-md hover:bg-slate-50 bg-white"
                      title="Send PDF Contract"
                  >
                      Send PDF
                  </button>
                )}
                </>
            )}

            {isTransporter && !isReview && (
                <button
                onClick={handleSubmit}
                className={`flex items-center gap-2 text-white bg-orange-500 hover:bg-orange-600 font-bold px-4 py-2 rounded-md shadow-sm transition-all text-sm ${
                    !isEditing ? 'bg-green-600 hover:bg-green-700' : ''
                }`}
                >
                {isEditing ? 'Save Draft' : 'Send to Vendor'}
                </button>
            )}
             
             {isVendor && !isReview && (
                <button
                    onClick={handleSubmit}
                    className="bg-orange-500 text-white px-4 py-2 rounded-md font-bold text-sm shadow-sm hover:bg-orange-600 transition-all"
                >
                    Return Quote
                </button>
            )}
          </div>
        </div>

        <div className="p-6">
            {/* Table Layout - Reference Style */}
            <div className="bg-white border-t border-x border-slate-200 shadow-sm rounded-none overflow-hidden overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[1000px]">
                <thead>
                <tr className="bg-[#F8F9FA] border-b border-slate-200 text-left h-10">
                    <th className="px-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider w-12 text-center">#</th>
                    <th className="px-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider w-1/5">Origin</th>
                    <th className="px-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider w-1/5">Destination</th>
                    <th className="px-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider w-40">Vehicle</th>
                    <th className="px-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider w-24 text-center">Weight</th>
                    <th className="px-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider w-20 text-center">TAT</th>
                    <th className="px-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider w-32 text-right">Vendor Amt</th>
                    <th className="px-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider w-32 text-right">Total Amount</th>
                    {isTransporter && !isReview && (
                    <th className="px-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider w-16 text-center">Actions</th>
                    )}
                </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                {rows.map((row, i) => (
                    <tr key={i} className="group hover:bg-slate-50 transition-colors h-14">
                    <td className="px-4 text-center text-xs font-semibold text-slate-600">
                        {i + 1}
                    </td>
                    
                    {/* Origin */}
                    <td className="px-4 align-middle">
                        <div className="relative">
                        <div className="[&>input]:!bg-transparent [&>input]:!border-transparent [&>input]:hover:!border-slate-200 [&>input]:focus:!bg-white [&>input]:focus:!border-orange-300 [&>input]:!rounded-none [&>input]:!border-b [&>input]:!border-slate-100 [&>input]:!text-sm [&>input]:!font-medium [&>input]:!text-slate-700 [&>input]:!shadow-none [&>input]:transition-all [&>input]:!p-0 [&>input]:!h-8">
                            <PlaceAutocomplete
                                value={row.from?.label || ''}
                                onSelect={(v) => handleFromSelect(i, v)}
                                disabled={!isTransporter || isReview || !isEditing}
                                placeholder="Origin City"
                            />
                        </div>
                        </div>
                    </td>

                    {/* Destination */}
                    <td className="px-4 align-middle">
                        <div className="relative">
                        <div className="[&>input]:!bg-transparent [&>input]:!border-transparent [&>input]:hover:!border-slate-200 [&>input]:focus:!bg-white [&>input]:focus:!border-orange-300 [&>input]:!rounded-none [&>input]:!border-b [&>input]:!border-slate-100 [&>input]:!text-sm [&>input]:!font-medium [&>input]:!text-slate-700 [&>input]:!shadow-none [&>input]:transition-all [&>input]:!p-0 [&>input]:!h-8">
                            <PlaceAutocomplete
                                value={row.to?.label || ''}
                                onSelect={(v) => handleToSelect(i, v)}
                                disabled={!isTransporter || isReview || !isEditing}
                                placeholder="Destination City"
                            />
                        </div>
                        </div>
                    </td>

                    {/* Vehicle */}
                    <td className="px-4 align-middle">
                        {isTransporter && !isReview && isEditing ? (
                        <select
                            value={row.vehicle.label}
                            onChange={(e) => {
                            const vehicle =
                                VEHICLES.find((v) => v.label === e.target.value) || VEHICLES[0]
                            updateRow(i, {
                                vehicle,
                                ratePerKm: vehicle.defaultRate,
                                total: undefined, // Reset manual total on vehicle change
                            })
                            }}
                            className="w-full bg-transparent border-b border-slate-100 hover:border-slate-300 focus:bg-white focus:border-orange-300 rounded-none text-sm font-medium text-slate-700 py-1 px-1 transition-all cursor-pointer outline-none h-8"
                        >
                            {VEHICLES.map((v) => (
                            <option key={v.label} value={v.label}>
                                {v.label}
                            </option>
                            ))}
                        </select>
                        ) : (
                        <div className="text-sm font-medium text-slate-700 py-2">{row.vehicle.label}</div>
                        )}
                    </td>

                    {/* Weight */}
                    <td className="px-4 align-middle">
                        {isTransporter && !isReview && isEditing ? (
                        <div className="relative">
                            <input
                            type="number"
                            value={row.ton === 0 ? '' : row.ton}
                            onChange={(e) => updateRow(i, { ton: Number(e.target.value) })}
                            className="w-full bg-transparent border-b border-slate-100 hover:border-slate-300 focus:bg-white focus:border-orange-300 rounded-none text-sm font-medium text-slate-700 py-1 px-1 text-center transition-all outline-none h-8"
                            placeholder="0"
                            />
                        </div>
                        ) : (
                        <div className="text-sm font-medium text-slate-700 py-2 text-center">{row.ton || 0} MT</div>
                        )}
                    </td>


                    {/* TAT */}
                    <td className="px-4 align-middle">
                        {isTransporter && !isReview && isEditing ? (
                            <select
                                value={row.tat}
                                onChange={(e) => updateRow(i, { tat: Number(e.target.value) })}
                                className="w-full bg-transparent border-b border-slate-100 hover:border-slate-300 focus:bg-white focus:border-orange-300 rounded-none text-sm font-medium text-slate-700 py-1 px-1 text-center cursor-pointer transition-all outline-none h-8"
                            >
                                {[1, 2, 3, 4, 5].map((days) => (
                                <option key={days} value={days}>
                                    {days} D
                                </option>
                                ))}
                            </select>
                        ) : (
                            <div className="text-sm font-medium text-slate-700 py-2 text-center">{row.tat} Days</div>
                        )}
                    </td>

                    {/* Vendor Amount */}
                    <td className="px-4 align-middle">
                        <input
                            type="number"
                            disabled={!isVendor || isReview}
                            value={row.amendedAmount === 0 ? '' : row.amendedAmount}
                            onChange={(e) => updateRow(i, { amendedAmount: Number(e.target.value) })}
                            className={`w-full text-sm font-medium text-right py-1 px-1 h-8 transition-all outline-none ${
                                !isVendor || isReview 
                                    ? 'bg-transparent border-b border-slate-100 text-slate-700' 
                                    : 'bg-orange-50 border border-orange-200 text-orange-900 focus:ring-2 focus:ring-orange-100 rounded-md'
                            }`}
                            placeholder="0"
                        />
                    </td>

                    {/* Total */}
                    <td className="px-4 align-middle text-right">
                        {isTransporter && !isReview && isEditing ? (
                           <input
                             type="number"
                             value={row.total || calculateTotal(row) || ''}
                             onChange={(e) => updateRow(i, { total: Number(e.target.value) })}
                             className="w-full bg-transparent border-b border-slate-100 hover:border-slate-300 focus:bg-white focus:border-orange-300 rounded-none text-sm font-bold text-emerald-600 py-1 px-1 text-right transition-all outline-none h-8"
                             placeholder="0"
                           />
                        ) : (
                          <div className="text-sm font-bold text-emerald-600">
                              ₹ {calculateTotal(row).toLocaleString()}
                          </div>
                        )}
                    </td>

                    {/* Actions */}
                    {isTransporter && !isReview && isEditing && (
                        <td className="px-4 align-middle text-center">
                            <button
                                onClick={() => removeRow(i)}
                                className="text-orange-500 hover:text-orange-700 transition-all font-medium text-xs uppercase tracking-wide flex items-center justify-center gap-1"
                                title="Remove Route"
                            >
                                <Trash2 size={16} /> Delete
                            </button>
                        </td>
                    )}

                    </tr>
                ))}

                {rows.length === 0 && (
                    <tr>
                        <td colSpan={9} className="p-16 text-center border-t border-slate-100">
                            <div className="flex flex-col items-center justify-center text-slate-400">
                                <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mb-3">
                                    <Plus size={24} className="opacity-40" />
                                </div>
                                <p className="text-sm font-medium text-slate-500">No routes added yet</p>
                                {isEditing && (
                                  <button onClick={handleOpenRateMaster} className="mt-3 text-orange-500 hover:text-orange-600 text-sm font-medium flex items-center gap-1 transition-colors">
                                      <Plus size={14} /> Add from Rate Master
                                  </button>
                                )}
                            </div>
                        </td>
                    </tr>
                )}
                </tbody>
            </table>
            
             {/* Simple footer for Grand Total inside the table container or just below */}
             <div className="bg-slate-50 border-t border-slate-200 p-4 flex justify-end items-center gap-4">
                 <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Grand Total</span>
                 <span className="text-xl font-bold text-slate-900">₹ {grandTotal.toLocaleString()}</span>
             </div>

            </div>
        </div>
      </div>
    </div>
  )
}


