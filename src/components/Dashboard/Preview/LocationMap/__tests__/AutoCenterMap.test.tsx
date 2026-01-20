import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, waitFor, act } from '@testing-library/react'
import { AppConfig, getConfig } from 'config'
import L from 'leaflet'

// Mock react-leaflet hooks
const mockFlyTo = vi.fn()
const mockGetZoom = vi.fn().mockReturnValue(12)
const mockGetBounds = vi.fn().mockReturnValue(
  new L.LatLngBounds([48.8, 2.3], [48.9, 2.4])
)
const mockMap = {
  flyTo: mockFlyTo,
  getZoom: mockGetZoom,
  getBounds: mockGetBounds,
  project: vi.fn((latlng: L.LatLng) => L.point(latlng.lng * 1000, latlng.lat * 1000)),
  unproject: vi.fn((point: L.Point) => L.latLng(point.y / 1000, point.x / 1000)),
  distance: vi.fn(() => 10000)
}

vi.mock('react-leaflet', () => ({
  useMap: () => mockMap,
  useMapEvents: (handlers: Record<string, () => void>) => {
    // Just return the mock map, ignore the event handlers for tests
    return mockMap
  },
  Polygon: () => null,
  Rectangle: () => null,
  Tooltip: () => null
}))

vi.mock('react-leaflet/MapContainer', () => ({
  MapContainer: ({ children }: { children: React.ReactNode }) => <div data-testid="map-container">{children}</div>
}))

vi.mock('react-leaflet/TileLayer', () => ({
  TileLayer: () => null
}))

// Mock fetchLocation API
const mockFetchLocation = vi.fn()
vi.mock('services/aphp/callApi', () => ({
  fetchLocation: (...args: unknown[]) => mockFetchLocation(...args)
}))

// Mock getExtension utility
vi.mock('utils/fhir', () => ({
  getExtension: (resource: { id?: string }, url: string) => {
    // Return mock extension data based on URL and resource
    if (url.includes('count')) {
      // Return higher count for Paris location
      if (resource?.id === 'paris-center') return { valueInteger: 500 }
      if (resource?.id === 'hendaye') return { valueInteger: 150 }
      if (resource?.id === 'berck') return { valueInteger: 50 }
      return { valueInteger: 0 }
    }
    if (url.includes('shape')) {
      // Paris center IRIS zone
      if (resource?.id === 'paris-center') {
        return { valueString: 'POLYGON((2.35 48.85, 2.36 48.85, 2.36 48.86, 2.35 48.86, 2.35 48.85))' }
      }
      // Hendaye (Basque Country)
      if (resource?.id === 'hendaye') {
        return { valueString: 'POLYGON((-1.77 43.36, -1.76 43.36, -1.76 43.37, -1.77 43.37, -1.77 43.36))' }
      }
      // Berck (Picardy coast)
      if (resource?.id === 'berck') {
        return { valueString: 'POLYGON((1.56 50.40, 1.57 50.40, 1.57 50.41, 1.56 50.41, 1.56 50.40))' }
      }
      return null
    }
    return null
  }
}))

// Import component after mocks are set up
import LocationMap from '../index'

const createMockLocation = (id: string, name: string) => ({
  resourceType: 'Location',
  id,
  name
})

const renderLocationMap = (cohortId: string) => {
  return render(
    <AppConfig.Provider value={getConfig()}>
      <LocationMap cohortId={cohortId} />
    </AppConfig.Provider>
  )
}

describe('AutoCenterMap', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should center on zone with highest patient count', async () => {
    mockFetchLocation.mockResolvedValueOnce({
      data: {
        entry: [
          { resource: createMockLocation('hendaye', 'Hendaye') },
          { resource: createMockLocation('paris-center', 'Paris Centre') },
          { resource: createMockLocation('berck', 'Berck-sur-Mer') }
        ]
      }
    })

    await act(async () => {
      renderLocationMap('test-cohort-1')
    })

    await waitFor(
      () => {
        expect(mockFlyTo).toHaveBeenCalled()
      },
      { timeout: 3000 }
    )

    // Should fly to Paris center (highest count = 500)
    const flyToCall = mockFlyTo.mock.calls[0]
    const [center] = flyToCall

    // Paris centroid should be around [48.855, 2.355]
    expect(center[0]).toBeCloseTo(48.855, 2)
    expect(center[1]).toBeCloseTo(2.355, 2)
  })

  it('should not center when no locations are returned', async () => {
    mockFetchLocation.mockResolvedValueOnce({
      data: { entry: [] }
    })

    await act(async () => {
      renderLocationMap('empty-cohort')
    })

    // Wait a bit to ensure the async effect ran
    await new Promise((r) => setTimeout(r, 100))

    expect(mockFlyTo).not.toHaveBeenCalled()
  })

  it('should handle locations without shape data gracefully', async () => {
    mockFetchLocation.mockResolvedValueOnce({
      data: {
        entry: [{ resource: createMockLocation('no-shape', 'No Shape Location') }]
      }
    })

    await act(async () => {
      renderLocationMap('no-shape-cohort')
    })

    // Wait a bit to ensure the async effect ran
    await new Promise((r) => setTimeout(r, 100))

    // Should not crash, just not center
    expect(mockFlyTo).not.toHaveBeenCalled()
  })

  it('should center on distant hospital (Hendaye) when it has highest count', async () => {
    // Override mock to make Hendaye have highest count
    mockFetchLocation.mockResolvedValueOnce({
      data: {
        entry: [
          { resource: createMockLocation('hendaye', 'Hôpital Hendaye') },
          { resource: createMockLocation('paris-center', 'Paris Centre') }
        ]
      }
    })

    // Temporarily override getExtension mock for this test
    const originalMock = vi.mocked(await import('utils/fhir')).getExtension
    vi.mocked(await import('utils/fhir')).getExtension = vi.fn((resource: { id?: string }, url: string) => {
      if (url.includes('count')) {
        // Hendaye has more patients than Paris for this test
        if (resource?.id === 'hendaye') return { valueInteger: 1000 }
        if (resource?.id === 'paris-center') return { valueInteger: 100 }
        return { valueInteger: 0 }
      }
      if (url.includes('shape')) {
        if (resource?.id === 'hendaye') {
          return { valueString: 'POLYGON((-1.77 43.36, -1.76 43.36, -1.76 43.37, -1.77 43.37, -1.77 43.36))' }
        }
        if (resource?.id === 'paris-center') {
          return { valueString: 'POLYGON((2.35 48.85, 2.36 48.85, 2.36 48.86, 2.35 48.86, 2.35 48.85))' }
        }
        return null
      }
      return null
    })

    await act(async () => {
      renderLocationMap('hendaye-cohort')
    })

    await waitFor(
      () => {
        expect(mockFlyTo).toHaveBeenCalled()
      },
      { timeout: 3000 }
    )

    // Should fly to Hendaye (highest count in this test)
    const flyToCall = mockFlyTo.mock.calls[0]
    const [center] = flyToCall

    // Hendaye centroid should be around [43.365, -1.765]
    expect(center[0]).toBeCloseTo(43.365, 2)
    expect(center[1]).toBeCloseTo(-1.765, 2)
  })

  it('should reset centering when cohort changes', async () => {
    mockFetchLocation
      .mockResolvedValueOnce({
        data: {
          entry: [{ resource: createMockLocation('paris-center', 'Paris') }]
        }
      })
      .mockResolvedValueOnce({
        data: {
          entry: [{ resource: createMockLocation('hendaye', 'Hendaye') }]
        }
      })

    const { rerender } = await act(async () => {
      return renderLocationMap('cohort-1')
    })

    await waitFor(() => {
      expect(mockFlyTo).toHaveBeenCalledTimes(1)
    })

    mockFlyTo.mockClear()

    // Change cohort
    await act(async () => {
      rerender(
        <AppConfig.Provider value={getConfig()}>
          <LocationMap cohortId="cohort-2" />
        </AppConfig.Provider>
      )
    })

    // Should center again for new cohort
    await waitFor(
      () => {
        expect(mockFlyTo).toHaveBeenCalled()
      },
      { timeout: 3000 }
    )
  })

  it('should handle API errors gracefully', async () => {
    mockFetchLocation.mockRejectedValueOnce(new Error('Network error'))

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    await act(async () => {
      renderLocationMap('error-cohort')
    })

    await new Promise((r) => setTimeout(r, 100))

    // Should log error but not crash
    expect(consoleSpy).toHaveBeenCalledWith('Failed to auto-center map:', expect.any(Error))
    expect(mockFlyTo).not.toHaveBeenCalled()

    consoleSpy.mockRestore()
  })
})
