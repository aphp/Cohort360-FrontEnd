import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import L, { LatLngBounds, LatLngTuple } from 'leaflet'
// https://github.com/PaulLeCam/react-leaflet/issues/1077
//@ts-ignore
import { Polygon, Rectangle, Tooltip, useMap, useMapEvents } from 'react-leaflet'
//@ts-ignore
import { MapContainer } from 'react-leaflet/MapContainer'
//@ts-ignore
import { TileLayer } from 'react-leaflet/TileLayer'
import axios from 'axios'
import { fetchLocation } from 'services/aphp/callApi'
import { getAllResults } from 'utils/apiHelpers'
import {
  colorize,
  computeCentroid,
  computeNearFilter,
  getColorPalette,
  isBoundCovered,
  parseShape,
  uncoveredBoundMeshUnits
} from './utils'
import { cancelPendingRequest } from 'utils/abortController'
import * as d3 from 'd3'
import { CircularProgress, Slider, Typography } from '@mui/material'
import CircularProgressWithLabel from 'components/ui/CircularProgressWithLabel'
import useMultipartDataLoading from './useMultipartDataLoading'
import { getExtension } from 'utils/fhir'
import { AppConfig } from 'config'
import { Location } from 'fhir/r4'

const DEBUG_SHOW_LOADED_BOUNDS = false
const SHOW_OPACITY_CONTROL = false
const MAX_COUNT_DEFAULT = 1
const LOCATION_FETCH_BATCH_SIZE = 2000
const MAX_COUNT_QUANTILE = 0.96
const ZONE_COLOR_OPACITY = 0.37
const BORDER_RELATIVE_OPACITY = 1.33
const MIN_ZOOM = 8
const DEFAULT_MAP_CENTER: LatLngTuple = [48.8575, 2.3514]
const TILE_URL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
const MAP_COPYRIGHTS = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
const COLOR_PALETTE = [
  '#fad370',
  '#fac55c',
  '#fab749',
  '#faa837',
  '#fb9725',
  '#fc8613',
  '#fd7300',
  '#fe5c00',
  '#ff4000',
  '#ff0000'
]

type LocationMapProps = {
  cohortId: string
  center?: LatLngTuple
}

type ZoneInfo = { shape: LatLngTuple[]; meta: { count: number; name: string; id: string } }

type IrisZonesProps = {
  cohortId: string
}

// Number of locations to fetch to find the best center (fetched without geo-filter, sorted by count desc)
const AUTO_CENTER_FETCH_SIZE = 100

/**
 * Component that auto-centers the map on the zone with the highest patient density.
 * Fetches a sample of locations without geo-filter on initial load and cohort change,
 * finds the one with the highest count, and pans the map to its centroid.
 */
const AutoCenterMap = (props: { cohortId: string }) => {
  const { cohortId } = props
  const appConfig = useContext(AppConfig)
  const map = useMap()
  const [hasCentered, setHasCentered] = useState(false)
  const abortControllerRef = useRef<AbortController | null>(null)

  useEffect(() => {
    // Reset centered flag when cohort changes
    setHasCentered(false)
  }, [cohortId])

  useEffect(() => {
    if (hasCentered) return

    // Cancel any previous in-flight request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    const abortController = new AbortController()
    abortControllerRef.current = abortController

    ;(async () => {
      try {
        // Fetch locations without geo-filter to find the zone with highest patient count
        const response = await fetchLocation({
          _list: [cohortId],
          size: AUTO_CENTER_FETCH_SIZE,
          signal: abortController.signal
        })

        if (abortController.signal.aborted) return

        const locations = response.data?.entry?.map((e) => e.resource).filter(Boolean) || []
        if (locations.length === 0) return

        // Find the location with the highest count
        let maxCount = 0
        let bestLocation: Location | null = null
        for (const loc of locations) {
          const count = getExtension(loc, appConfig.features.locationMap.extensions.locationCount)?.valueInteger || 0
          if (count > maxCount) {
            maxCount = count
            bestLocation = loc
          }
        }

        if (!bestLocation) return

        // Parse the shape and compute the centroid
        const shapeString = getExtension(
          bestLocation,
          appConfig.features.locationMap.extensions.locationShapeUrl
        )?.valueString
        const shape = parseShape(shapeString)
        if (!shape || shape.length === 0) return

        const centroid = computeCentroid(shape)
        if (!centroid) return

        // Pan the map to the centroid with animation
        map.flyTo(centroid, map.getZoom(), { animate: true, duration: 0.5 })
        setHasCentered(true)
      } catch (error) {
        // Ignore abort/cancel errors
        if (axios.isCancel(error) || (error instanceof Error && error.name === 'AbortError')) {
          return
        }
        console.error('Failed to auto-center map:', error)
      }
    })()

    return () => {
      cancelPendingRequest(abortController)
    }
  }, [cohortId, hasCentered, map, appConfig.features.locationMap.extensions.locationCount, appConfig.features.locationMap.extensions.locationShapeUrl])

  return null // This component only produces side effects
}

const IrisZones = (props: IrisZonesProps) => {
  const { cohortId } = props
  const appConfig = useContext(AppConfig)
  const { dataLoading, dataLoadingProgress, updateLoadingProgress, setDataLoading } = useMultipartDataLoading()
  const [zones, setZones] = useState<{ [id: string]: ZoneInfo }>({})
  const [visibleZones, setVisibleZones] = useState<Array<ZoneInfo>>([])
  const [bounds, setBounds] = useState<LatLngBounds | null>(null)
  const [loadedBounds, setLoadedBounds] = useState<LatLngBounds[]>([])
  const [loadingBounds, setLoadingBounds] = useState<LatLngBounds[]>([])
  const [maxCount, setMaxCount] = useState(MAX_COUNT_DEFAULT)
  const [zoneOpacity, setZoneOpacity] = useState(ZONE_COLOR_OPACITY * 100)
  const colorPalette = getColorPalette(COLOR_PALETTE, maxCount)

  const updateBounds = useCallback((newBounds: LatLngBounds) => {
    setBounds((prevBounds) => {
      if (prevBounds !== null && newBounds.equals(prevBounds)) {
        return prevBounds
      }
      return newBounds
    })
  }, [])

  // Update bounds on map move
  const map = useMapEvents({
    moveend: () => {
      updateBounds(map.getBounds())
    },
    zoomend: () => {
      updateBounds(map.getBounds())
    }
  })
  // Update bounds on first render
  useEffect(() => {
    updateBounds(map.getBounds())
  }, [map, updateBounds])

  // Reset zones when cohortId changes
  useEffect(() => {
    setVisibleZones([])
    setZones({})
    setLoadedBounds([])
    setMaxCount(MAX_COUNT_DEFAULT)
  }, [cohortId])

  // Fetch zones when bounds or nearFilter change
  useEffect(() => {
    const abortController = new AbortController()
    if (bounds) {
      // If the current viewbox is already covered by the loaded bounds, do not fetch new locations
      if (isBoundCovered(map, bounds, loadedBounds)) {
        setDataLoading(false)
        return
      }

      ;(async () => {
        try {
          setDataLoading(true)
          // Fetch fhir locations for the current viewbox using the near filter
          const smallBounds = uncoveredBoundMeshUnits(map, bounds, loadedBounds)
          if (DEBUG_SHOW_LOADED_BOUNDS) {
            setLoadingBounds(smallBounds)
          }
          const locationParts = await Promise.all(
            smallBounds.map(async (boundPart, i) => {
              const loadingPartProgress = (stage: number, total: number) => {
                updateLoadingProgress(i, stage, total, smallBounds.length)
              }
              const nearFilter = computeNearFilter(map, boundPart)
              return await getAllResults(
                fetchLocation,
                {
                  _list: [cohortId],
                  size: LOCATION_FETCH_BATCH_SIZE,
                  near: nearFilter,
                  signal: abortController.signal
                },
                loadingPartProgress
              )
            })
          )
          const locations = locationParts.flat()

          if (locations) {
            // updates loaded zones
            setZones((existingZones) => {
              const newZones = locations.reduce(
                (acc, ft) => {
                  if (ft.id && !Object.prototype.hasOwnProperty.call(acc, ft.id)) {
                    acc[ft.id] = {
                      shape:
                        parseShape(
                          getExtension(ft, appConfig.features.locationMap.extensions.locationShapeUrl)?.valueString
                        ) || [],
                      meta: {
                        count:
                          getExtension(ft, appConfig.features.locationMap.extensions.locationCount)?.valueInteger || 0,
                        name: ft.name || '',
                        id: ft.id || ''
                      }
                    }
                  }
                  return acc
                },
                { ...existingZones }
              )
              // update the loaded bounds
              setLoadedBounds((prevLoadedBounds) => {
                if (prevLoadedBounds.some((b) => b.equals(bounds))) {
                  return prevLoadedBounds
                }
                return prevLoadedBounds.concat(bounds)
              })

              return newZones
            })
          }
          setDataLoading(false)
        } catch (error) {
          // TODO use snackbar setMessage to display error instead
          // except if the error if of type AbortError (which is normal when the user moves the map too fast)
          console.error(error)
        }
      })()
    }
    return () => {
      cancelPendingRequest(abortController)
    }
  }, [
    cohortId,
    bounds,
    updateLoadingProgress,
    setDataLoading,
    map,
    loadedBounds,
    appConfig.features.locationMap.extensions.locationShapeUrl,
    appConfig.features.locationMap.extensions.locationCount
  ])

  // Update visible zones (and max visible count) when zones or bounds change
  useEffect(() => {
    const newVisibleZones = Object.values(zones).filter((zone: ZoneInfo) =>
      zone.shape.some((shape) => bounds?.contains(shape))
    )
    setVisibleZones(newVisibleZones)
    const maxCount =
      newVisibleZones.length === 0
        ? MAX_COUNT_DEFAULT
        : d3.quantile(
            newVisibleZones.map((zone) => zone.meta.count),
            MAX_COUNT_QUANTILE
          ) || Math.max(...newVisibleZones.map((zone) => zone.meta.count))
    setMaxCount(Math.floor(maxCount))
  }, [zones, bounds])

  /***************************************************** */
  /*                    RENDERING                        */
  /***************************************************** */

  const renderLoader = useMemo(() => {
    return (
      dataLoading && (
        <div
          style={{
            position: 'absolute',
            height: '500px',
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            backgroundColor: '#ffffffb2'
          }}
        >
          {dataLoadingProgress ? <CircularProgressWithLabel value={dataLoadingProgress} /> : <CircularProgress />}
        </div>
      )
    )
  }, [dataLoading, dataLoadingProgress])

  const renderControls = () => {
    return (
      <div
        className="leaflet-control leaflet-bar"
        style={{
          position: 'absolute',
          bottom: '10px',
          left: '120px',
          backgroundColor: 'white',
          padding: '10px',
          borderRadius: '5px',
          width: '100px',
          height: '120px',
          boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
          zIndex: 1000
        }}
      >
        <Typography variant="h6" color={'black'}>
          Controles
        </Typography>
        <div>
          <div>Visibilité :</div>
          <div style={{ display: 'flex', justifyContent: 'center', width: '100%', height: '10px' }}>
            <Slider value={zoneOpacity} onChange={(_, val) => setZoneOpacity(val as number)} />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      {renderLoader}
      {SHOW_OPACITY_CONTROL && renderControls()}
      {DEBUG_SHOW_LOADED_BOUNDS && (
        <div>
          {loadedBounds &&
            loadedBounds.map((b, i) => (
              <Rectangle
                key={`mesh_${i}`}
                pathOptions={{
                  color: '#0000ff',
                  opacity: 1,
                  fillOpacity: 0.5
                }}
                bounds={b}
              />
            ))}
          {loadingBounds &&
            loadingBounds.map((b, i) => (
              <Rectangle
                key={`mesh_${i}`}
                pathOptions={{
                  color: '#ff00ff',
                  opacity: 1,
                  fillOpacity: 0.5
                }}
                bounds={b}
              />
            ))}
        </div>
      )}
      {visibleZones.map((zone) => {
        return (
          <Polygon
            key={zone.meta.id}
            pathOptions={{
              color: colorize(colorPalette, zone.meta.count, maxCount),
              opacity: (BORDER_RELATIVE_OPACITY * zoneOpacity) / 100,
              fillOpacity: zoneOpacity / 100
            }}
            positions={zone.shape}
          >
            <Tooltip sticky>
              <div>
                <b>{zone.meta.name}</b>
              </div>
              <div>Total: {zone.meta.count}</div>
            </Tooltip>
          </Polygon>
        )
      })}
      <MapLegend maxCount={maxCount} colorPalette={colorPalette} />
    </div>
  )
}

const MapLegend = (props: { maxCount: number; colorPalette: string[] }) => {
  const { maxCount, colorPalette } = props
  return (
    <div
      className="leaflet-control leaflet-bar"
      style={{
        position: 'absolute',
        bottom: '10px',
        left: '10px',
        backgroundColor: 'white',
        padding: '10px',
        borderRadius: '5px',
        width: '100px',
        boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
        zIndex: 1000
      }}
    >
      <div style={{ color: 'black', fontWeight: 'bold', marginBottom: '4px' }}>Legende</div>
      <div>
        <div>Densité</div>
        <div style={{ display: 'flex', justifyContent: 'center', width: '100%', height: '10px' }}>
          {colorPalette.map((color, i) => (
            <div key={i} style={{ flexGrow: 1, backgroundColor: color }} />
          ))}
        </div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between'
          }}
        >
          <div>1</div>
          <div>{maxCount}+</div>
        </div>
      </div>
    </div>
  )
}

const LocationMap = (props: LocationMapProps) => {
  const { cohortId, center = DEFAULT_MAP_CENTER } = props
  const appConfig = useContext(AppConfig)

  return (
    <div style={{ width: '100%', padding: '10px', position: 'relative' }}>
      <MapContainer
        preferCanvas={true}
        renderer={L.canvas()}
        center={center}
        zoom={10}
        minZoom={appConfig.features.locationMap.minZoom || MIN_ZOOM}
        scrollWheelZoom={true}
        style={{ height: '500px', width: '100%' }}
      >
        <AutoCenterMap cohortId={cohortId} />
        <IrisZones cohortId={cohortId} />
        <TileLayer attribution={MAP_COPYRIGHTS} url={TILE_URL} />
      </MapContainer>
    </div>
  )
}

export default LocationMap
