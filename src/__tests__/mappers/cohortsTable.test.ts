import { describe, it, expect, vi } from 'vitest'
import { mapCohortsToTable } from 'mappers/cohorts'
import { getConfig } from 'config'
import { Cohort, JobStatus } from 'types'
import { CohortCallbacks, ResearchesTableLabels } from 'types/cohorts'
import { accessType } from 'types/scope'
import { CellType } from 'types/table'

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

  describe('colonne sensibilité (CNIL)', () => {
    const sensitivityCell = (table: ReturnType<typeof mapCohortsToTable>, uuid: string) =>
      table.rows[0].find((cell) => cell.id === `${uuid}-sensitivity`)

    it('ajoute une colonne "sensibilité" après le statut', () => {
      const table = mapCohortsToTable([cohort()], false, appConfig, callbacks, [], undefined, false)
      const labels = table.columns.map((col) => col.label)
      expect(labels).toContain(ResearchesTableLabels.SENSITIVITY)
      expect(labels.indexOf(ResearchesTableLabels.SENSITIVITY)).toBe(
        labels.indexOf(ResearchesTableLabels.STATUS) + 1
      )
    })

    it('rend la cellule sensibilité, y compris en mode simplifié', () => {
      const table = mapCohortsToTable([cohort()], true, appConfig, callbacks, [], 'req-1', false)
      expect(sensitivityCell(table, 'c1')?.type).toBe(CellType.TEXT)
    })

    it('affiche "Nominatif" quand l\'utilisateur a le droit de lecture nominative (read_patient_nomi)', () => {
      const table = mapCohortsToTable(
        [cohort({ rights: { read_patient_nomi: true, read_patient_pseudo: true } })],
        false,
        appConfig,
        callbacks,
        [],
        undefined,
        false
      )
      expect(sensitivityCell(table, 'c1')?.value).toBe(accessType.NOMINAL)
    })

    it('affiche "Pseudonymisé" quand seule la lecture pseudonymisée est autorisée', () => {
      const table = mapCohortsToTable(
        [cohort({ rights: { read_patient_nomi: false, read_patient_pseudo: true } })],
        false,
        appConfig,
        callbacks,
        [],
        undefined,
        false
      )
      expect(sensitivityCell(table, 'c1')?.value).toBe(accessType.PSEUDO)
    })

    it("ne se fie pas au droit d'export : export nominatif sans lecture nominative => Pseudonymisé", () => {
      const table = mapCohortsToTable(
        [cohort({ rights: { export_csv_xlsx_nomi: true, read_patient_nomi: false, read_patient_pseudo: true } })],
        false,
        appConfig,
        callbacks,
        [],
        undefined,
        false
      )
      expect(sensitivityCell(table, 'c1')?.value).toBe(accessType.PSEUDO)
    })

    it('reste indéterminée (valeur vide) quand les droits sont absents', () => {
      const table = mapCohortsToTable([cohort()], false, appConfig, callbacks, [], undefined, false)
      expect(sensitivityCell(table, 'c1')?.value).toBe('')
    })
  })
})
