import { gql } from '@apollo/client'

export const GET_ALL_VENDORS = gql`
  query GetAllVendors {
    getAllVendors {
      id
      vendorCode
      vendorName
      contactPerson
      email
      mobile
      majorIndustry
      worksWithTopCompanies
      vehicleTypes
      createdAt
    }
  }
`

export const DELETE_VENDOR = gql`
  mutation DeleteVendor($id: ID!) {
    deleteTransVendor(id: $id) {
      id
    }
  }
`

export const SEND_RFI = gql`
  mutation SendRFI($vendorId: ID!, $customMessage: String) {
    sendRFI(vendorId: $vendorId, customMessage: $customMessage)
  }
`

// export const CREATE_QUOTATION = gql`
//   mutation CreateQuotation($vendorId: ID!) {
//     createTransQuotation(vendorId: $vendorId) {
//       id
//       quotationNumber
//       status
//     }
//   }
// `
