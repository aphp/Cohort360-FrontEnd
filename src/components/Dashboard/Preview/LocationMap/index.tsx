import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react'
import L, { LatLngBounds, LatLngTuple } from 'leaflet'
// https://github.com/PaulLeCam/react-leaflet/issues/1077
//@ts-ignore
import { Polygon, Rectangle, Tooltip, useMapEvents } from 'react-leaflet'
//@ts-ignore
import { MapContainer } from 'react-leaflet/MapContainer'
//@ts-ignore
import { TileLayer } from 'react-leaflet/TileLayer'
import { fetchLocation } from 'services/aphp/callApi'
import { getAllResults } from 'utils/apiHelpers'
import {
  colorize,
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
        <IrisZones cohortId={cohortId} />
        <TileLayer attribution={MAP_COPYRIGHTS} url={TILE_URL} />
      </MapContainer>
    </div>
  )
}

export default LocationMap
