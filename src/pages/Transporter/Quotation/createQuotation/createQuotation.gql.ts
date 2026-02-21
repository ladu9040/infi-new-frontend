import { gql } from '@apollo/client'

export const GET_QUOTATION_BY_ID = gql`
  query GetQuotationById($quotationId: ID!) {
    getQuotationById(quotationId: $quotationId) {
      id
      status
      vendorId
      createdAt
      updatedAt
      transporterRows {
        from
        to
        vehicleSize
        tat
        vendorExtraAmount
        total
        distance
        ton
        date
        price
      }
      vendorRows {
        from
        to
        vehicleSize
        tat
        vendorExtraAmount
        total
        distance
        ton
        date
        price
      }
    }
  }
`

export const SAVE_QUOTATION_DRAFT = gql`
  mutation SaveQuotationDraft($vendorId: ID!, $rows: [QuotationRowInput!]!, $quotationId: ID) {
    saveQuotationDraft(vendorId: $vendorId, rows: $rows, quotationId: $quotationId) {
      id
      status
    }
  }
`

export const SEND_QUOTATION_TO_VENDOR = gql`
  mutation SendQuotationToVendor($quotationId: ID!) {
    sendQuotationToVendor(quotationId: $quotationId) {
      id
      status
    }
  }
`

export const SUBMIT_QUOTATION_BY_VENDOR = gql`
  mutation SubmitQuotationByVendor(
    $quotationId: ID!
    $rows: [QuotationRowInput!]!
    $access: String!
  ) {
    submitQuotationByVendor(quotationId: $quotationId, rows: $rows, access: $access) {
      id
      status
    }
  }
`

export const SEND_QUOTATION_PDF = gql`
  mutation SendQuotationPdf($quotationId: ID!, $contractId: String) {
    sendQuotationPdf(quotationId: $quotationId, contractId: $contractId)
  }
`

export const CANCEL_QUOTATION = gql`
  mutation CancelQuotation($quotationId: ID!) {
    cancelQuotation(quotationId: $quotationId)
  }
`
