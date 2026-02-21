import { gql } from '@apollo/client'

export const REGISTER_TRANSPORTER_MUTATION = gql`
  mutation registerTransporter($input: RegisterTransporterInput!) {
    registerTransporter(input: $input) {
      transporter {
        id
        fullName
        email
        phoneNumber
        isVerified
      }
      token
    }
  }
`
