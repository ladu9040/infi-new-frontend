import { gql } from '@apollo/client';

export const GET_ALL_INVOICES = gql`
  query GetAllTransporterInvoices {
    getAllTransporterInvoices {
      id
      invoiceNumber
      lrId
      lr {
        lrNumber
        consignee
        consignor
        date: createdAt
        weight
        freightRate
        totalFreight
      }
      amount
      tax
      loadingCharges
      unloadingCharges
      miscellaneousCharges
      totalAmount
      status
      pdfUrl
      createdAt
    }
  }
`;

export const GET_UNBILLED_LRS = gql`
  query GetUnbilledLRs($transporterId: ID) {
    getUnbilledLRs(transporterId: $transporterId) {
      id
      lrNumber
      consignee
      consignor
      date: createdAt
      weight
      freightRate
      totalFreight
      materialName
    }
  }
`;

export const GENERATE_INVOICE = gql`
  mutation GenerateTransporterInvoice($input: GenerateInvoiceInput!) {
    generateTransporterInvoice(input: $input) {
      id
      invoiceNumber
      totalAmount
      status
    }
  }
`;

export const GET_RATE_MASTER = gql`
  query GetRate($origin: String!, $destination: String!, $vehicleType: String!) {
    getRate(origin: $origin, destination: $destination, vehicleType: $vehicleType) {
      id
      price
    }
  }
`;

export const GET_INVOICE_PDF = gql`
  query GetInvoicePdf($lrId: ID!) {
    getInvoicePdf(lrId: $lrId)
  }
`;
