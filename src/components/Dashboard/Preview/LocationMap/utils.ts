import L, { LatLngBounds, LatLngTuple } from 'leaflet'

/**
 * Transform the string polygon description retrieved by FHIR (POLYGON((lat lng, lat lng, ...))) into an array of LatLngTuple
 */
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

/**
 * Compute the near Location param (https://www.hl7.org/fhir/R4/location.html#search) from the map viewbox bounds
 */
export const computeNearFilter = (map: L.Map, bounds: LatLngBounds): string => {
  const center = bounds.getCenter()
  const r1 = map.distance(center, bounds.getNorthEast())
  const r2 = map.distance(center, bounds.getSouthEast())
  return `${center.lat}|${center.lng}|${Math.round(Math.max(r1, r2) / 1000)}`
}

/**
 * Explode the map viewbox bounds into a mesh of smaller bounds
 */
export const _explodeBoundsIntoMesh = (
  map: L.Map,
  bounds: LatLngBounds,
  xSteps: number,
  ySteps: number
): LatLngBounds[] => {
  const ne = map.project(bounds.getNorthEast())
  const sw = map.project(bounds.getSouthWest())
  const width = ne.x - sw.x
  const height = sw.y - ne.y
  const xStepSize = width / xSteps
  const yStepSize = height / ySteps
  const mesh: LatLngBounds[] = []
  for (let i = 0; i < xSteps; i++) {
    for (let j = 0; j < ySteps; j++) {
      const bsw = map.unproject([sw.x + i * xStepSize, sw.y - j * yStepSize])
      const bne = map.unproject([sw.x + (i + 1) * xStepSize, sw.y - (j + 1) * yStepSize])
      mesh.push(new LatLngBounds(bsw, bne))
    }
  }
  return mesh
}

/**
 * Explode the map viewbox bounds into a mesh of smaller bounds with a given mesh unit size (in meters)
 */
export const explodeBoundsIntoMesh = (map: L.Map, bounds: LatLngBounds, meshUnitSize: number): LatLngBounds[] => {
  const ne = map.project(bounds.getNorthEast())
  const sw = map.project(bounds.getSouthWest())
  const width = ne.x - sw.x
  const height = sw.y - ne.y
  const widthDistance = map.distance(bounds.getNorthEast(), bounds.getNorthWest())
  const pixelToDistanceRatio = widthDistance / width
  const heightDistance = height * pixelToDistanceRatio
  const xSteps = Math.min(Math.floor(widthDistance / meshUnitSize), 100)
  const ySteps = Math.min(Math.floor(heightDistance / meshUnitSize), 100)
  return _explodeBoundsIntoMesh(map, bounds, xSteps, ySteps)
}

export const isBoundCovered = (map: L.Map, bounds: LatLngBounds, loadedBounds: LatLngBounds[]): boolean => {
  // Explode the current viewbox bounds into a mesh of smaller bounds
  const boundMesh = explodeBoundsIntoMesh(map, bounds, 1000)
  // Search for a mesh unit that is not covered by the already loaded bounds
  return !boundMesh.some((b) => !loadedBounds.some((lb) => lb.contains(b)))
}

export const uncoveredBoundMeshUnits = (map: L.Map, bounds: LatLngBounds, loadedBounds: LatLngBounds[]) => {
  // Explode the current viewbox bounds into a mesh of smaller bounds
  const boundMesh = _explodeBoundsIntoMesh(map, bounds, 10, 10)
  // Search for a mesh unit that is not covered by the already loaded bounds
  return boundMesh.filter((b) => !loadedBounds.some((lb) => lb.contains(b)))
}

export const getColorPalette = (colors: string[], maxCount: number): string[] => {
  if (maxCount >= colors.length) {
    return colors
  }
  if (maxCount === 2) {
    return [colors[0], colors[colors.length - 1]]
  }
  const colorPalette: string[] = [colors[0]]
  const inc = Math.floor(colors.length / maxCount)
  for (let i = inc; i < colors.length; i += inc) {
    colorPalette.push(colors[i])
  }
  return colorPalette
}

/**
 * Colorize a count based on a color palette
 */
export const colorize = (colorPalette: string[], count: number, maxCount: number): string => {
  const step = maxCount / colorPalette.length
  const colorIndex = Math.floor((count - 0.1) / step)
  if (colorIndex >= colorPalette.length) {
    return colorPalette[colorPalette.length - 1]
  }
  return colorPalette[colorIndex]
}
