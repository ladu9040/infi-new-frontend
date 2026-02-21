import { gql } from '@apollo/client'

/* ============================
   ROUTE QUERIES & MUTATIONS
============================ */

export const GET_ALL_ROUTES = gql`
  query GetAllRoutes {
    getAllRoutes {
      id
      origin
      destination
      createdAt
    }
  }
`

export const ADD_ROUTE = gql`
  mutation AddRoute($input: AddRouteInput!) {
    addRoute(input: $input) {
      id
      origin
      destination
      createdAt
    }
  }
`

export const UPDATE_ROUTE = gql`
  mutation UpdateRoute($id: ID!, $origin: String!, $destination: String!) {
    updateRoute(id: $id, origin: $origin, destination: $destination) {
      id
      origin
      destination
      createdAt
    }
  }
`

export const DELETE_ROUTE = gql`
  mutation DeleteRoute($id: ID!) {
    deleteRoute(id: $id) {
      id
    }
  }
`

/* ============================
   VEHICLE TYPE QUERIES & MUTATIONS
============================ */

export const GET_ALL_VEHICLE_TYPES = gql`
  query GetAllVehicleTypes {
    getAllVehicleTypes {
      id
      label
      value
      defaultRate
      capacity
      showVehicleMileage
      mileage
      vehicleTypeCategory
      createdAt
    }
  }
`

// Option A: Keep plural names to match backend
export const ADD_VEHICLE_TYPES = gql` 
  mutation AddVehicleTypes($input: AddVehicleTypeInput!) {
    addVehicleTypes(input: $input) {
      id
      label
      value
      defaultRate
      capacity
      showVehicleMileage
      mileage
      vehicleTypeCategory
      createdAt
    }
  }
`

export const UPDATE_VEHICLE_TYPES = gql` 
  mutation UpdateVehicleTypes($id: ID!, $input: UpdateVehicleTypeInput!) {
    updateVehicleTypes(id: $id, input: $input) {
      id
      label
      value
      defaultRate
      capacity
      showVehicleMileage
      mileage
      vehicleTypeCategory
      createdAt
    }
  }
`
export const DELETE_VEHICLE_TYPES = gql`  
  mutation DeleteVehicleTypes($id: ID!) {
    deleteVehicleTypes(id: $id)
  }
`

/* ============================
   RATE QUERIES & MUTATIONS
============================ */

export const GET_ALL_RATES = gql`
  query GetAllRates {
    getAllRouteRates {
      id
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
`

export const ADD_RATE = gql`
  mutation AddRate($input: AddRateInput!) {
    addRate(input: $input) {
      id
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
`

export const UPDATE_RATE = gql`
  mutation UpdateRate($id: ID!, $input: UpdateRateInput!) {
    updateRate(id: $id, input: $input) {
      id
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
`

export const DELETE_RATE = gql`
  mutation DeleteRate($id: ID!) {
    deleteRate(id: $id) {
      id
    }
  }
`