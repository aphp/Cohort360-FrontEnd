import React, { useCallback, useEffect, useState } from 'react'
import L, { LatLngTuple } from 'leaflet'
// https://github.com/PaulLeCam/react-leaflet/issues/1077
//@ts-ignore
import { Polygon, Tooltip } from 'react-leaflet'
//@ts-ignore
import { MapContainer } from 'react-leaflet/MapContainer'
//@ts-ignore
import { TileLayer } from 'react-leaflet/TileLayer'
import { fetchLocation } from 'services/aphp/callApi'
import { getAllResults } from 'utils/apiHelpers'
import { parseShape } from './utils'
import { cancelPendingRequest } from 'utils/abortController'
import * as d3 from 'd3'
import { CircularProgress } from '@mui/material'

const LOCATION_FETCH_BATCH_SIZE = 1000
const MAX_COUNT_QUANTILE = 0.96
const ZONE_COLOR_OPACITY = 0.75
const DEFAULT_MAP_CENTER = [48.8575, 2.3514]
const TILE_URL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
const MAP_COPYRIGHTS = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
const LOCATION_SHAPE_EXTENSION_URL = 'https://terminology.eds.aphp.fr/fhir/profile/location/extension/position'
const LOCATION_COUNT_EXTENSION_URL = 'https://terminology.eds.aphp.fr/fhir/profile/location/extension/count'

type LocationMapProps = {
  cohortId: string
  center?: LatLngTuple
}

const LocationMap = (props: LocationMapProps) => {
  const { cohortId, center = DEFAULT_MAP_CENTER } = props
  const [dataLoading, setDataLoading] = useState(true)
  const [zones, setZones] = useState<Array<{ shape: LatLngTuple[]; meta: { count: number; name: string } }>>([])
  const [maxCount, setMaxCount] = useState(1)

  const colorPalette = useCallback(
    (count: number) => {
      const colors = [
        '#ff0000',
        '#ff4000',
        '#fe5c00',
        '#fd7300',
        '#fc8613',
        '#fb9725',
        '#faa837',
        '#fab749',
        '#fac55c',
        '#fad370'
      ]
      const step = maxCount / colors.length
      const colorIndex = Math.floor(count / step)
      if (colorIndex > colors.length) {
        return colors[0]
      }
      return colors.reverse()[colorIndex]
    },
    [maxCount]
  )

  useEffect(() => {
    const abortController = new AbortController()
    setDataLoading(true)
    ;(async () => {
      const locations = await getAllResults(fetchLocation, {
        _list: [cohortId],
        size: LOCATION_FETCH_BATCH_SIZE,
        signal: abortController.signal
      })
      if (locations) {
        const newZones = locations.map((ft) => ({
          shape: parseShape(ft.extension?.find((ext) => ext.url === LOCATION_SHAPE_EXTENSION_URL)?.valueString) || [],
          meta: {
            count: ft.extension?.find((ext) => ext.url === LOCATION_COUNT_EXTENSION_URL)?.valueInteger || 0,
            name: ft.name || ''
          }
        }))
        const maxCount =
          d3.quantile(
            newZones.map((zone) => zone.meta.count),
            MAX_COUNT_QUANTILE
          ) || Math.max(...newZones.map((zone) => zone.meta.count))
        setZones(newZones)
        setMaxCount(maxCount)
        setDataLoading(false)
      }
    })()
    return () => {
      cancelPendingRequest(abortController)
    }
  }, [cohortId])

  return (
    <div style={{ width: '100%', padding: '10px' }}>
      {dataLoading ? (
        <div
          style={{ height: '500px', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <CircularProgress />
        </div>
      ) : (
        <MapContainer
          preferCanvas={true}
          renderer={L.canvas()}
          center={center}
          zoom={10}
          scrollWheelZoom={true}
          style={{ height: '500px', width: '100%' }}
        >
          <TileLayer attribution={MAP_COPYRIGHTS} url={TILE_URL} />
          {zones.map((zone, i) => (
            <Polygon
              key={i}
              pathOptions={{ color: colorPalette(zone.meta.count), fillOpacity: ZONE_COLOR_OPACITY }}
              positions={zone.shape}
            >
              <Tooltip sticky>
                <div>
                  <b>{zone.meta.name}</b>
                </div>
                <div>Total: {zone.meta.count}</div>
              </Tooltip>
            </Polygon>
          ))}
        </MapContainer>
      )}
    </div>
  )
}

export default LocationMap
