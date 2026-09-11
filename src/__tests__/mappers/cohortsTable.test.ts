import { describe, it, expect, vi } from 'vitest'
import { mapCohortsToTable } from 'mappers/cohorts'
import { getConfig } from 'config'
import { Cohort, JobStatus } from 'types'
import { CohortCallbacks } from 'types/cohorts'

const appConfig = getConfig()

const callbacks: CohortCallbacks = {
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
    uuid: 'c1',
    name: 'Cohorte test',
    result_size: 1234,
    request_job_status: JobStatus.FINISHED,
    created_at: '2024-01-01T00:00:00Z',
    favorite: false,
    ...overrides
  }) as Cohort

describe('mappers/cohorts.mapCohortsToTable', () => {
  it('construit une table avec colonnes et lignes (mode complet)', () => {
    const table = mapCohortsToTable([cohort()], false, appConfig, callbacks, [], undefined, false)
    expect(table.columns.length).toBeGreaterThan(0)
    expect(table.rows).toHaveLength(1)
  })

  it('construit une table en mode simplifié', () => {
    const table = mapCohortsToTable([cohort()], true, appConfig, callbacks, [], 'req-1', false)
    expect(table.columns.length).toBeGreaterThan(0)
    expect(table.rows).toHaveLength(1)
  })

  it('gère une liste vide', () => {
    const table = mapCohortsToTable([], false, appConfig, callbacks, [], undefined, false)
    expect(table.rows).toEqual([])
  })

  it('gère plusieurs cohortes avec statuts variés', () => {
    const list = [
      cohort({ uuid: 'c1', request_job_status: JobStatus.FINISHED, favorite: true }),
      cohort({ uuid: 'c2', request_job_status: JobStatus.PENDING }),
      cohort({ uuid: 'c3', request_job_status: JobStatus.FAILED })
    ]
    const table = mapCohortsToTable(list, false, appConfig, callbacks, [list[0]], undefined, false)
    expect(table.rows).toHaveLength(3)
  })
})
