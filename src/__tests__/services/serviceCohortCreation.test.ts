import { describe, it, expect, beforeEach, vi } from 'vitest'
import { AxiosResponse } from 'axios'

vi.mock('../../services/apiBackend', () => ({
  default: { get: vi.fn(), post: vi.fn(), patch: vi.fn() }
}))

vi.mock('config', () => ({
  getConfig: vi.fn(() => ({ features: { cohort: { shortCohortLimit: 20000 } } }))
}))

import apiBack from '../../services/apiBackend'
import servicesCohortCreation from 'services/aphp/serviceCohortCreation'

const mockGet = vi.mocked(apiBack.get)
const mockPost = vi.mocked(apiBack.post)
const mockPatch = vi.mocked(apiBack.patch)

const asAxios = <T,>(data: T, status = 200): AxiosResponse<T> =>
  ({ data, status, statusText: '', headers: {}, config: {} }) as AxiosResponse<T>

beforeEach(() => {
  vi.clearAllMocks()
})

describe('serviceCohortCreation.createSample', () => {
  it('poste l’échantillon avec les bons champs (status 201)', async () => {
    mockPost.mockResolvedValue(asAxios({ uuid: 'c1' }, 201))
    await servicesCohortCreation.createSample({
      parentCohort: 'parent-1',
      cohortName: 'Echantillon',
      cohortDescription: 'desc',
      samplingRatio: 0.5
    })
    expect(mockPost).toHaveBeenCalledWith(
      '/cohort/cohorts/',
      expect.objectContaining({ parent_cohort: 'parent-1', sampling_ratio: 0.5, name: 'Echantillon' })
    )
  })

  it('lève une erreur quand status != 201', async () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    mockPost.mockResolvedValue(asAxios({}, 200))
    await expect(
      servicesCohortCreation.createSample({
        parentCohort: 'p',
        cohortName: 'n',
        cohortDescription: 'd',
        samplingRatio: 0.1
      })
    ).rejects.toThrow()
    spy.mockRestore()
  })
})

describe('serviceCohortCreation.createCohort', () => {
  it('retourne null si un argument requis manque', async () => {
    expect(await servicesCohortCreation.createCohort(undefined, 'dm', 'snap', 'req')).toBeNull()
    expect(await servicesCohortCreation.createCohort('json', undefined, 'snap', 'req')).toBeNull()
    expect(mockPost).not.toHaveBeenCalled()
  })

  it('poste la cohorte avec globalCount défaut à false', async () => {
    mockPost.mockResolvedValue(asAxios({ uuid: 'c1' }, 201))
    const result = await servicesCohortCreation.createCohort('json', 'dm-1', 'snap-1', 'req-1', 'Nom', 'Desc')
    expect(result?.data).toEqual({ uuid: 'c1' })
    expect(mockPost).toHaveBeenCalledWith(
      '/cohort/cohorts/',
      expect.objectContaining({
        dated_measure_id: 'dm-1',
        request_query_snapshot_id: 'snap-1',
        request_id: 'req-1',
        global_estimate: false
      })
    )
  })
})

describe('serviceCohortCreation.countCohort', () => {
  it('récupère une mesure existante par uuid (GET)', async () => {
    mockGet.mockResolvedValue(
      asAxios({ created_at: '2024-01-01', request_job_status: 'finished', uuid: 'dm-1', measure: 42, cohort_limit: 100 })
    )
    const result = await servicesCohortCreation.countCohort(undefined, undefined, undefined, 'dm-1')
    expect(result).toMatchObject({ status: 'finished', uuid: 'dm-1', includePatient: 42, byrequest: 0, shortCohortLimit: 100 })
    expect(mockGet).toHaveBeenCalledWith('/cohort/dated-measures/dm-1/')
  })

  it('crée une nouvelle mesure via POST quand pas d’uuid', async () => {
    mockPost.mockResolvedValue(asAxios({ created_at: '2024-01-02', request_job_status: 'pending', uuid: 'dm-2' }))
    const result = await servicesCohortCreation.countCohort('json', 'snap-1', 'req-1')
    expect(result).toMatchObject({ status: 'pending', uuid: 'dm-2' })
    expect(mockPost).toHaveBeenCalledWith(
      '/cohort/dated-measures/',
      expect.objectContaining({ request_query_snapshot_id: 'snap-1', request_id: 'req-1' })
    )
  })

  it('retourne le status "error" par défaut si absent', async () => {
    mockPost.mockResolvedValue(asAxios({ uuid: 'dm-3' }))
    const result = await servicesCohortCreation.countCohort('json', 'snap-1', 'req-1')
    expect(result?.status).toBe('error')
  })

  it('retourne null quand ni uuid ni triplet complet', async () => {
    expect(await servicesCohortCreation.countCohort('json', undefined, 'req-1')).toBeNull()
  })
})

describe('serviceCohortCreation.createSnapshot', () => {
  it('utilise request_id la première fois', async () => {
    mockPost.mockResolvedValue(asAxios({ uuid: 'snap-1' }))
    const result = await servicesCohortCreation.createSnapshot('req-1', '{}', true)
    expect(result).toEqual({ uuid: 'snap-1' })
    expect(mockPost).toHaveBeenCalledWith(
      '/cohort/request-query-snapshots/',
      expect.objectContaining({ request_id: 'req-1', serialized_query: '{}' })
    )
  })

  it('utilise previous_snapshot_id ensuite', async () => {
    mockPost.mockResolvedValue(asAxios({ uuid: 'snap-2' }))
    await servicesCohortCreation.createSnapshot('snap-1', '{}', false)
    expect(mockPost).toHaveBeenCalledWith(
      '/cohort/request-query-snapshots/',
      expect.objectContaining({ previous_snapshot_id: 'snap-1' })
    )
  })

  it('retourne null quand pas de data', async () => {
    mockPost.mockResolvedValue(undefined as never)
    expect(await servicesCohortCreation.createSnapshot('id', '{}')).toBeNull()
  })
})

describe('serviceCohortCreation.fetchRequest', () => {
  it('trie les snapshots par date décroissante et filtre les mesures Global', async () => {
    mockGet
      .mockResolvedValueOnce(
        asAxios({
          name: 'Ma requête',
          query_snapshots: [
            { uuid: 's-old', created_at: '2024-01-01' },
            { uuid: 's-new', created_at: '2024-06-01' }
          ]
        })
      )
      .mockResolvedValueOnce(
        asAxios({
          serialized_query: '{"query":1}',
          dated_measures: [
            { mode: 'Global', cohort_limit: 999, count_outdated: true },
            { mode: 'Snapshot', cohort_limit: 500, count_outdated: false }
          ]
        })
      )
    const result = await servicesCohortCreation.fetchRequest('req-1')
    expect(result.requestName).toBe('Ma requête')
    // le snapshot le plus récent est utilisé
    expect(mockGet).toHaveBeenNthCalledWith(2, '/cohort/request-query-snapshots/s-new/')
    // la mesure Global est filtrée => shortCohortLimit provient de la mesure Snapshot
    expect(result.shortCohortLimit).toBe(500)
    expect(result.count_outdated).toBe(false)
    expect(result.json).toBe('{"query":1}')
  })

  it('retourne un résultat par défaut quand aucun snapshot', async () => {
    mockGet.mockResolvedValueOnce(asAxios({ name: 'Vide', query_snapshots: [] }))
    const result = await servicesCohortCreation.fetchRequest('req-1')
    expect(result.snapshotsHistory).toEqual([])
    expect(result.json).toBe('')
    // shortCohortLimit provient de la config par défaut
    expect(result.shortCohortLimit).toBe(20000)
  })
})

describe('serviceCohortCreation.fetchSnapshot / updateSnapshotName', () => {
  it('fetchSnapshot retourne la data', async () => {
    mockGet.mockResolvedValue(asAxios({ uuid: 'snap-1' }))
    expect(await servicesCohortCreation.fetchSnapshot('snap-1')).toEqual({ uuid: 'snap-1' })
  })

  it('fetchSnapshot retourne {} sans data', async () => {
    mockGet.mockResolvedValue(asAxios(null as never))
    expect(await servicesCohortCreation.fetchSnapshot('snap-1')).toEqual({})
  })

  it('updateSnapshotName patch le nom', async () => {
    mockPatch.mockResolvedValue(asAxios({ uuid: 'snap-1', name: 'Nouveau' }))
    const result = await servicesCohortCreation.updateSnapshotName('snap-1', 'Nouveau')
    expect(result).toEqual({ uuid: 'snap-1', name: 'Nouveau' })
    expect(mockPatch).toHaveBeenCalledWith('/cohort/request-query-snapshots/snap-1/', { name: 'Nouveau' })
  })

  it('updateSnapshotName propage l’erreur', async () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    mockPatch.mockRejectedValue(new Error('boom'))
    await expect(servicesCohortCreation.updateSnapshotName('snap-1', 'x')).rejects.toThrow()
    spy.mockRestore()
  })
})
