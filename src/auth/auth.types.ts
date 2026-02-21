export interface BusinessAddress {
  address: string
  city: string
  state: string
  pinCode: string
}

export interface DocumentItem {
  url: string
  uploadedAt: string
  verified: boolean
}

export interface Documents {
  transportLicense?: DocumentItem
  vehicleRC?: DocumentItem
  insuranceCertificate?: DocumentItem
  panCard?: DocumentItem
}

export interface User {
  id: string
  name: string
  fullName?: string
  email: string
  phoneNumber?: string
  alternatePhoneNumber?: string | null
  companyName?: string
  gstNumber?: string
  panNumber?: string
  businessType?: string
  yearsInBusiness?: number
  businessAddress?: BusinessAddress
  numberOfVehicles?: number
  primaryVehicleType?: string
  serviceAreas?: string[]
  documents?: Documents
  roles: [string]
  vendorId?: string
  status?: string
  isVerified?: boolean
  isActive?: boolean
  createdAt?: string
  updatedAt?: string
}
