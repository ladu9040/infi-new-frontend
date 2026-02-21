
export interface Route {
  id: string;
  origin: string;
  destination: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface VehicleType {
  id: string;
  label: string;
  value: string;
  defaultRate: number;
  capacity:number;
  showVehicleMileage?: boolean;
  mileage?: number;
  vehicleTypeCategory?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Rate {
  id: string;
  origin: string;
  destination: string;
  containerType?: string;
  capacity?: number;
  unit?: "Ton" | "MT" | "KG";
  price: number;
  vehicleType: string;
  createdAt?: string;
  updatedAt?: string;
}

// Response  interfaces
export interface GetAllRoutesResponse {
  getAllRoutes: Route[];
}

export interface GetAllVehicleTypesResponse {
  getAllVehicleTypes: VehicleType[];
}

export interface GetAllRatesResponse {
  getAllRouteRates: Rate[];
}