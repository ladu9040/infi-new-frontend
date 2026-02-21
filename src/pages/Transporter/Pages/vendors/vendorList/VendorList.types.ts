export type Vendor = {
  id: string
  vendorCode: string
  vendorName: string
  contactPerson: string
  email: string
  mobile: string
  majorIndustry?: string
  worksWithTopCompanies?: string
  vehicleTypes?: string[]
  createdAt: string
}

export type GetAllVendorsResponse = {
  getAllVendors: Vendor[]
}

export type CreateQuotationResponse = {
  createQuotation: {
    id: string
    quotationNumber: string
    status: string
  }
}

export type VendorListProps = {
  onAddVendor: () => void
  onViewQuotations: (vendorId: string) => void
}