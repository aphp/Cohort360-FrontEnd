import { describe, it, expect, beforeEach, vi } from 'vitest'
import { AxiosResponse } from 'axios'
import { Direction, Order } from 'types/searchCriterias'
import { JobStatus } from 'types'
import { CohortsType } from 'types/cohorts'

vi.mock('../../services/apiBackend', () => ({
  default: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() }
}))

vi.mock('services/aphp/serviceCohorts', () => ({
  default: { fetchCohortsRights: vi.fn(async (list) => list) }
}))

import apiBack from '../../services/apiBackend'
import servicesCohorts from 'services/aphp/serviceCohorts'
import servicesProjects from 'services/aphp/serviceProjects'

const mockGet = vi.mocked(apiBack.get)
const mockPost = vi.mocked(apiBack.post)
const mockPatch = vi.mocked(apiBack.patch)
const mockDelete = vi.mocked(apiBack.delete)
const mockFetchRights = vi.mocked(servicesCohorts.fetchCohortsRights)

const asAxios = <T,>(data: T, status = 200): AxiosResponse<T> =>
  ({ data, status, statusText: '', headers: {}, config: {} }) as AxiosResponse<T>

const listPayload = <T,>(results: T[]) => ({ count: results.length, next: null, previous: null, results })

beforeEach(() => {
  vi.clearAllMocks()
  mockFetchRights.mockImplementation(async (list) => list as never)
})

describe('serviceProjects.fetchProject / fetchRequest', () => {
  it('retourne les données du projet (nominal)', async () => {
    mockGet.mockResolvedValue(asAxios({ uuid: 'p1', name: 'Projet' }))
    expect(await servicesProjects.fetchProject('p1')).toEqual({ uuid: 'p1', name: 'Projet' })
    expect(mockGet).toHaveBeenCalledWith('/cohort/folders/p1/', expect.anything())
  })

  it('log l’erreur et retourne undefined si l’appel échoue', async () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    mockGet.mockRejectedValue(new Error('boom'))
    expect(await servicesProjects.fetchProject('p1')).toBeUndefined()
    expect(spy).toHaveBeenCalled()
    spy.mockRestore()
  })

  it('fetchRequest interroge le bon endpoint', async () => {
    mockGet.mockResolvedValue(asAxios({ uuid: 'r1' }))
    expect(await servicesProjects.fetchRequest('r1')).toEqual({ uuid: 'r1' })
    expect(mockGet).toHaveBeenCalledWith('/cohort/requests/r1/', expect.anything())
  })
})

describe('serviceProjects.fetchCohort', () => {
  it('récupère la cohorte et applique ses droits', async () => {
    mockGet.mockResolvedValue(asAxios({ uuid: 'c1' }))
    mockFetchRights.mockResolvedValue([{ uuid: 'c1', rights: {} }] as never)
    const result = await servicesProjects.fetchCohort('c1')
    expect(result).toEqual({ uuid: 'c1', rights: {} })
    expect(mockFetchRights).toHaveBeenCalledWith([{ uuid: 'c1' }])
  })

  it('retourne {} en cas d’erreur', async () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    mockGet.mockRejectedValue(new Error('boom'))
    expect(await servicesProjects.fetchCohort('c1')).toEqual({})
    spy.mockRestore()
  })
})

describe('serviceProjects.fetchProjectsList', () => {
  it('construit les paramètres et retourne les données (nominal)', async () => {
    mockGet.mockResolvedValue(asAxios(listPayload([{ uuid: 'p1' }])))
    const result = await servicesProjects.fetchProjectsList({
      limit: 10,
      offset: 20,
      searchInput: 'abc',
      filters: { startDate: '2024-01-01', endDate: '2024-02-01' } as never,
      order: { orderBy: Order.CREATED_AT, orderDirection: Direction.DESC }
    })
    expect(result.results).toEqual([{ uuid: 'p1' }])
    const url = mockGet.mock.calls[0][0] as string
    expect(url).toContain('ordering=-created_at')
    expect(url).toContain('limit=10')
    expect(url).toContain('offset=20')
    expect(url).toContain('search=abc')
    expect(url).toContain('min_created_at=2024-01-01')
    expect(url).toContain('max_created_at=2024-02-01')
  })

  it('retourne une liste vide en cas d’erreur', async () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    mockGet.mockRejectedValue(new Error('boom'))
    const result = await servicesProjects.fetchProjectsList({})
    expect(result).toEqual({ count: 0, next: '', previous: '', results: [] })
    spy.mockRestore()
  })
})

describe('serviceProjects.addProject / editProject / deleteProject', () => {
  it('addProject retourne les données quand status 201', async () => {
    mockPost.mockResolvedValue(asAxios({ uuid: 'p1' }, 201))
    expect(await servicesProjects.addProject({ name: 'x' } as never)).toEqual({ uuid: 'p1' })
  })

  it('addProject lève une erreur quand status != 201', async () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    mockPost.mockResolvedValue(asAxios({}, 200))
    await expect(servicesProjects.addProject({ name: 'x' } as never)).rejects.toThrow()
    spy.mockRestore()
  })

  it('editProject réussit avec status 200', async () => {
    mockPatch.mockResolvedValue(asAxios({}, 200))
    await expect(servicesProjects.editProject({ uuid: 'p1', name: 'n' } as never)).resolves.toBeUndefined()
  })

  it('editProject lève une erreur avec status != 200', async () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    mockPatch.mockResolvedValue(asAxios({}, 500))
    await expect(servicesProjects.editProject({ uuid: 'p1' } as never)).rejects.toThrow()
    spy.mockRestore()
  })

  it('deleteProject réussit avec status 204', async () => {
    mockDelete.mockResolvedValue(asAxios({}, 204))
    await expect(servicesProjects.deleteProject({ uuid: 'p1' } as never)).resolves.toBeUndefined()
  })

  it('deleteProject lève une erreur avec status != 204', async () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    mockDelete.mockResolvedValue(asAxios({}, 200))
    await expect(servicesProjects.deleteProject({ uuid: 'p1' } as never)).rejects.toThrow()
    spy.mockRestore()
  })
})

describe('serviceProjects.fetchRequestsList', () => {
  it('utilise parent_folder quand parentId est fourni', async () => {
    mockGet.mockResolvedValue(asAxios(listPayload([{ uuid: 'r1' }])))
    await servicesProjects.fetchRequestsList({ parentId: 'folder-1', searchInput: 'ignored' })
    const url = mockGet.mock.calls[0][0] as string
    expect(url).toContain('parent_folder=folder-1')
    // search ignoré quand parentId présent
    expect(url).not.toContain('search=')
  })

  it('retourne une liste vide en cas d’erreur', async () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    mockGet.mockRejectedValue(new Error('boom'))
    expect(await servicesProjects.fetchRequestsList({})).toEqual({
      count: 0,
      next: null,
      previous: null,
      results: []
    })
    spy.mockRestore()
  })
})

describe('serviceProjects.addRequest / editRequest', () => {
  it('addRequest retourne les données quand status 201', async () => {
    mockPost.mockResolvedValue(asAxios({ uuid: 'r1' }, 201))
    const result = await servicesProjects.addRequest({ name: 'r', parent_folder: { uuid: 'f1' } } as never)
    expect(result).toEqual({ uuid: 'r1' })
    expect(mockPost).toHaveBeenCalledWith('/cohort/requests/', expect.objectContaining({ parent_folder: 'f1' }))
  })

  it('addRequest lève une erreur quand status != 201', async () => {
    mockPost.mockResolvedValue(asAxios({}, 400))
    await expect(servicesProjects.addRequest({ name: 'r' } as never)).rejects.toThrow()
  })

  it('editRequest lève une erreur quand status != 200', async () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    mockPatch.mockResolvedValue(asAxios({}, 500))
    await expect(servicesProjects.editRequest({ uuid: 'r1' } as never)).rejects.toThrow()
    spy.mockRestore()
  })
})

describe('serviceProjects.moveRequests', () => {
  it('patch chaque requête vers le nouveau dossier (nominal)', async () => {
    mockPatch.mockResolvedValue(asAxios({}, 200))
    await servicesProjects.moveRequests([{ uuid: 'r1' }, { uuid: 'r2' }] as never, 'folder-2')
    expect(mockPatch).toHaveBeenCalledTimes(2)
    expect(mockPatch).toHaveBeenCalledWith('/cohort/requests/r1/', { parent_folder: 'folder-2' })
  })

  it('lève une erreur si un patch échoue', async () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    mockPatch.mockResolvedValueOnce(asAxios({}, 200)).mockResolvedValueOnce(asAxios({}, 500))
    await expect(servicesProjects.moveRequests([{ uuid: 'r1' }, { uuid: 'r2' }] as never, 'f')).rejects.toThrow()
    spy.mockRestore()
  })
})

describe('serviceProjects.fetchCohortsList', () => {
  it('développe le statut PENDING et applique les droits', async () => {
    mockGet.mockResolvedValue(asAxios(listPayload([{ uuid: 'c1' }])))
    const result = await servicesProjects.fetchCohortsList({
      isSample: false,
      filters: {
        status: [{ id: JobStatus.PENDING, label: 'x' }],
        favorite: [CohortsType.FAVORITE],
        minPatients: 10,
        maxPatients: 100,
        startDate: null,
        endDate: null
      } as never,
      searchInput: 'abc',
      orderBy: { orderBy: Order.CREATED_AT, orderDirection: Direction.DESC }
    })
    expect(result.results).toEqual([{ uuid: 'c1' }])
    const url = mockGet.mock.calls[0][0] as string
    expect(url).toContain(`status=${JobStatus.LONG_PENDING},${JobStatus.PENDING},${JobStatus.STARTED}`)
    expect(url).toContain('favorite=true')
    expect(url).toContain('min_result_size=10')
    expect(url).toContain('max_result_size=100')
    expect(mockFetchRights).toHaveBeenCalled()
  })

  it('retourne une liste vide en cas d’erreur', async () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    mockGet.mockRejectedValue(new Error('boom'))
    const result = await servicesProjects.fetchCohortsList({
      isSample: false,
      filters: { status: [], favorite: [], startDate: null, endDate: null } as never,
      orderBy: { orderBy: Order.CREATED_AT, orderDirection: Direction.DESC }
    })
    expect(result).toEqual({ count: 0, next: '', previous: '', results: [] })
    spy.mockRestore()
  })
})

describe('serviceProjects.addCohort / editCohort / deleteCohorts', () => {
  it('addCohort retourne la cohorte quand status 201', async () => {
    mockPost.mockResolvedValue(asAxios({ uuid: 'c1' }, 201))
    expect(await servicesProjects.addCohort({ name: 'c' } as never)).toEqual({ uuid: 'c1' })
  })

  it('addCohort lève une erreur quand status != 201', async () => {
    mockPost.mockResolvedValue(asAxios({}, 400))
    await expect(servicesProjects.addCohort({ name: 'c' } as never)).rejects.toThrow()
  })

  it('editCohort normalise favorite en booléen', async () => {
    mockPatch.mockResolvedValue(asAxios({}, 200))
    await servicesProjects.editCohort({ uuid: 'c1', name: 'n', favorite: 1 } as never)
    expect(mockPatch).toHaveBeenCalledWith('/cohort/cohorts/c1/', expect.objectContaining({ favorite: true }))
  })

  it('deleteCohorts joint les ids et réussit avec 204', async () => {
    mockDelete.mockResolvedValue(asAxios({}, 204))
    await servicesProjects.deleteCohorts([{ uuid: 'c1' }, { uuid: 'c2' }] as never)
    expect(mockDelete).toHaveBeenCalledWith('/cohort/cohorts/c1,c2/')
  })

  it('deleteCohorts lève une erreur avec status != 204', async () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    mockDelete.mockResolvedValue(asAxios({}, 200))
    await expect(servicesProjects.deleteCohorts([{ uuid: 'c1' }] as never)).rejects.toThrow()
    spy.mockRestore()
  })
})
