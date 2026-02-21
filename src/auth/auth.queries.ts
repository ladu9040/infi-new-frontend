import { gql } from '@apollo/client'

export const ME_QUERY = gql`
  query Me {
    me {
      id
      name
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
      primaryVehicleType
      serviceAreas
      documents {
        transportLicense { url uploadedAt verified }
        vehicleRC { url uploadedAt verified }
        insuranceCertificate { url uploadedAt verified }
        panCard { url uploadedAt verified }
      }
      roles
      vendorId
      isVerified
      isActive
      createdAt
      updatedAt
    }
  }
`
