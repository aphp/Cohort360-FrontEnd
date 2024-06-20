import { LatLngTuple } from 'leaflet'

export const parseShape = (polygons?: string): LatLngTuple[] | null => {
  if (!polygons) return null
  const shapes: LatLngTuple[][] = polygons
    .split('|')
    .map((polygon) => {
      const m = polygon.match(/POLYGON\(\((.*)\)\)/)
      if (m) {
        return m[1].split(',').map((latlng) => {
          const [lng, lat] = latlng.trim().split(' ')
          return [parseFloat(lat), parseFloat(lng)]
        })
      }
      return null
    })
    .filter((polygon) => polygon !== null)
    .map((polygon) => polygon as LatLngTuple[])
  if (shapes.length === 0) {
    return null
  } else {
    return shapes[0]
  }
}
