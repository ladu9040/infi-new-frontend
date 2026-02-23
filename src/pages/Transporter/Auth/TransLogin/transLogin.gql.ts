import { gql } from '@apollo/client'

export const TRANSPORTER_LOGIN_MUTATION = gql`
  mutation LoginTransporter($email: String!, $password: String!) {
    loginTransporter(email: $email, password: $password) {
      token
      transporter {
        id
        fullName
        email
        phoneNumber
        alternatePhoneNumber
        companyName
        gstNumber
        panNumber
        businessType
        yearsInBusiness
        businessAddress {
          address
          city
          state
          pinCode
        }
        numberOfVehicles
        serviceAreas
        documents {
          transportLicense { url uploadedAt verified }
          vehicleRC { url uploadedAt verified }
          insuranceCertificate { url uploadedAt verified }
          panCard { url uploadedAt verified }
        }
        isVerified
        isActive
        createdAt
        updatedAt
      }
    }
  }
`
