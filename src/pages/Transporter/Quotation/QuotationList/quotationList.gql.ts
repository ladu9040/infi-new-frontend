import { gql } from '@apollo/client'

export const GET_VENDOR_QUOTATIONS = gql`
  query GetVendorQuotations($vendorId: ID!) {
    getVendorQuotations(vendorId: $vendorId) {
      id
      quotationNumber
      status
      createdAt
      updatedAt
      transporterRows {
        from
        to
        vehicleSize
        tat
        total
      }
      vendorRows {
        from
        to
        vehicleSize
        tat
        vendorExtraAmount
        total
      }
    }
  }
`