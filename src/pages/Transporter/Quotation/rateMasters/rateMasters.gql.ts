import { gql } from "@apollo/client";

export const GET_ALL_RATES = gql`
  query GetAllRates {
    getAllRates {
      _id
      origin
      destination
      containerType
      capacity
      unit
      price
      vehicleType
      createdAt
    }
  }
`;