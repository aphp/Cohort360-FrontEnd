import { describe, it, expect, vi } from 'vitest'
import { mapSamplesToTable } from 'mappers/samples'
import { getConfig } from 'config'
import { Cohort, JobStatus } from 'types'

const appConfig = getConfig()

const callbacks = {
  onSelectAll: vi.fn(),
  onSelect: vi.fn(),
  onClickRow: vi.fn(),
  onClickFav: vi.fn(),
  onClickEdit: vi.fn(),
  onClickExport: vi.fn(),
  onClickDelete: vi.fn()
} as never

const cohort = (overrides: Partial<Cohort> = {}): Cohort =>
  ({
    uuid: 's1',
    name: 'Échantillon',
    result_size: 500,
    request_job_status: JobStatus.FINISHED,
    created_at: '2024-01-01T00:00:00Z',
    ...overrides
  }) as Cohort

describe('mappers/samples.mapSamplesToTable', () => {
  it('construit une table avec colonnes et lignes', () => {
    const table = mapSamplesToTable([cohort()], appConfig, callbacks, [], 'cohort-1', false)
    expect(table.columns.length).toBeGreaterThan(0)
    expect(table.rows).toHaveLength(1)
  })

  it('gère une liste vide', () => {
    const table = mapSamplesToTable([], appConfig, callbacks, [], undefined, false)
    expect(table.rows).toEqual([])
  })

  it('gère plusieurs échantillons et une sélection', () => {
    const list = [cohort({ uuid: 's1' }), cohort({ uuid: 's2', request_job_status: JobStatus.PENDING })]
    const table = mapSamplesToTable(list, appConfig, callbacks, [list[0]], 'cohort-1', true)
    expect(table.rows).toHaveLength(2)
  })
})
