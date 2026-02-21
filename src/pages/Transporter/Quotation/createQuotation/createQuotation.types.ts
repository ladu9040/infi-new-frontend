export interface Props {
  mode: 'TRANSPORTER' | 'VENDOR' | 'REVIEW'
  vendorId?: string
  onBack?: () => void
}

export interface QuotationGQL {
  id: string
  status: string
  transporterRows?: QuotationRowGQL[]
  vendorRows?: QuotationRowGQL[]
}

export interface QuotationRowGQL {
  from: string
  to: string
  vehicleSize: string
  tat: number
  distance?: number
  vendorExtraAmount?: number
  ton?: number
  date?: string
  price?: number
  total?: number
}

export interface Row {
  from: { label: string } | null
  to: { label: string } | null
  vehicle: {
    label: string
    value: string
    defaultRate: number
  }
  ratePerKm: number
  distanceKm: number
  tat: number
  amendedAmount: number
  ton?: number
  date?: string
  price?: number
  total?: number
}