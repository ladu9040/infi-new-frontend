export async function searchPlaces(query: string) {
  if (!query) return []

  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`,
  )

  const data = await res.json()

  return data.map((place: any) => ({
    label: place.display_name,
    lat: place.lat,
    lon: place.lon,
  }))
}
