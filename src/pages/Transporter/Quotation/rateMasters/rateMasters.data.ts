// rateMaster.data.ts

export const transportRoutes = [
  {
    origin: 'Bangalore',
    destinations: ['Chennai', 'Cochin', 'Coimbatore', 'Goa', 'Hyderabad'],
  },
  {
    origin: 'Chennai',
    destinations: [
      'Bangalore',
      'Cochin',
      'Coimbatore',
      'Hosur',
      'Hyderabad',
      'Kolkata',
      'Madurai',
      'Mumbai',
      'Mysore',
      'Trichy',
    ],
  },
  {
    origin: 'Coimbatore',
    destinations: [
      'Bangalore',
      'Chennai',
      'Cochin',
      'Hyderabad',
      'Hosur',
      'Madurai',
      'Pune',
      'Tirunelveli',
      'Trichy',
    ],
  },
]

export const transportRates = [
  {
    origin: 'Chennai',
    destination: 'Bangalore',
    capacity: 6,
    unit: 'Ton',
    containerType: '20-24 FT Container',
    price: 14000,
    date: '2026-01-29',
  },
  {
    origin: 'Chennai',
    destination: 'Bangalore',
    capacity: 6,
    unit: 'Ton',
    containerType: '20-24 FT Container',
    price: 15200,
    date: '2026-01-28',
  },
  {
    origin: 'Chennai',
    destination: 'Hosur',
    capacity: 6,
    unit: 'Ton',
    containerType: '20-24 FT Container',
    price: 13000,
    date: '2026-01-28',
  },
  {
    origin: 'Sriperumbudur',
    destination: 'Bangalore',
    capacity: 5,
    unit: 'Ton',
    containerType: '20-24 FT Container',
    price: 14000,
    date: '2026-01-27',
  },
  {
    origin: 'Sriperumbudur',
    destination: 'Bangalore',
    capacity: 5,
    unit: 'Ton',
    containerType: '20-24 FT Container',
    price: 15500,
    date: '2026-01-26',
  },
  {
    origin: 'Chennai',
    destination: 'Doddaballapura',
    capacity: 7,
    unit: 'Ton',
    containerType: '22 FT Container',
    price: 16400,
    date: '2026-01-24',
  },
  {
    origin: 'Chennai',
    destination: 'Malur',
    capacity: 6,
    unit: 'Ton',
    containerType: '20-24 FT Container',
    price: 15000,
    date: '2026-01-24',
  },
]


export const containerTypes = [
  { label: '32FT MXL', value: '32FT MXL Container' },
  { label: '32FT SXL', value: '32FT SXL Container' },
  { label: '20-24 FT', value: '20-24 FT Container' },
  { label: '17-24 FT', value: '17-24 FT Open' },
  { label: '10 Whl', value: '10 WHL Open' },
  { label: '12 Whl', value: '12 WHL Open' },
  { label: '14 Whl', value: '14 WHL Open' },
]
