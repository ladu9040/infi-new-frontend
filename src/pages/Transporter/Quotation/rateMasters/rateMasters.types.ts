export interface TransportRoute {
  id: string;
  origin: string;
  destinations: string[];
}

export interface TransportRate {
  id: string;
  origin: string;
  destination: string;
  containerType: string;
  price: number;
  capacity: number;
  unit: string;
  distance?: number; // Optional distance field
}

export interface TransportRoutesResponse {
  transportRoutes: TransportRoute[];
}

export interface TransportRatesResponse {
  transportRates: TransportRate[];
}

// Add selection interface
export interface RateSelection {
  from: string;
  to: string;
  vehicleSize: string;
  containerType: string;
  price: number;
  capacity: number;
  unit: string;
  id?: string;
}