import { gql } from '@apollo/client'

export const CREATE_VENDOR = gql`
  mutation CreateTransVendor($input: CreateVendorInput!) {
    createTransVendor(input: $input) {
      id
      vendorCode
      vendorName
      contactPerson
      email
      mobile
      worksWithTopCompanies
      majorIndustry
      vehicleTypes
      createdAt
    }
  }
`

export const UPDATE_VENDOR = gql`
  mutation UpdateTransVendor($id: ID!, $input: CreateVendorInput!) {
    updateTransVendor(id: $id, input: $input) {
      id
      vendorCode
      vendorName
      contactPerson
      email
      mobile
      worksWithTopCompanies
      majorIndustry
      vehicleTypes
      createdAt
    }
  }
`
