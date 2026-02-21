export async function getDistance(from: string, to: string) {
  const res = await fetch(
    `https://api.distancematrix.ai/maps/api/distancematrix/json` +
      `?origins=${encodeURIComponent(from)}` +
      `&destinations=${encodeURIComponent(to)}` +
      `&key=${import.meta.env.VITE_DISTANCE_MATRIX_API}`,
  )

  const data = await res.json()

  const element = data.rows[0]?.elements[0]
  if (!element || element.status !== 'OK') return null

  return {
    distanceKm: element.distance.value / 1000,
    durationMin: element.duration.value / 60,
  }
}
