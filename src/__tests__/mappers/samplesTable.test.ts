import { describe, it, expect, vi } from 'vitest'
import { mapSamplesToTable } from 'mappers/samples'
import { getConfig } from 'config'
import { Cohort, JobStatus } from 'types'
import { ResearchesTableLabels } from 'types/cohorts'
import { accessType } from 'types/scope'
import { CellType } from 'types/table'

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

  describe('colonne sensibilité (CNIL)', () => {
    const sensitivityCell = (table: ReturnType<typeof mapSamplesToTable>) =>
      table.rows[0].find((cell) => cell.id === 's1-sensitivity')

    it('ajoute une colonne "sensibilité" après le statut', () => {
      const table = mapSamplesToTable([cohort()], appConfig, callbacks, [], 'cohort-1', false)
      const labels = table.columns.map((col) => col.label)
      expect(labels).toContain(ResearchesTableLabels.SENSITIVITY)
      expect(labels.indexOf(ResearchesTableLabels.SENSITIVITY)).toBe(
        labels.indexOf(ResearchesTableLabels.STATUS) + 1
      )
    })

    it('rend une cellule sensibilité pour chaque échantillon', () => {
      const table = mapSamplesToTable([cohort()], appConfig, callbacks, [], 'cohort-1', false)
      expect(sensitivityCell(table)?.type).toBe(CellType.TEXT)
    })

    it('affiche "Nominatif" quand la lecture nominative est autorisée (read_patient_nomi)', () => {
      const table = mapSamplesToTable(
        [cohort({ rights: { read_patient_nomi: true, read_patient_pseudo: true } })],
        appConfig,
        callbacks,
        [],
        'cohort-1',
        false
      )
      expect(sensitivityCell(table)?.value).toBe(accessType.NOMINAL)
    })

    it('affiche "Pseudonymisé" pour une lecture pseudonymisée, y compris avec un droit d\'export nominatif', () => {
      const pseudoOnly = mapSamplesToTable(
        [cohort({ rights: { read_patient_nomi: false, read_patient_pseudo: true } })],
        appConfig,
        callbacks,
        [],
        'cohort-1',
        false
      )
      const exportButPseudo = mapSamplesToTable(
        [cohort({ rights: { export_csv_xlsx_nomi: true, read_patient_nomi: false, read_patient_pseudo: true } })],
        appConfig,
        callbacks,
        [],
        'cohort-1',
        false
      )
      expect(pseudoOnly.rows[0].find((cell) => cell.id === 's1-sensitivity')?.value).toBe(accessType.PSEUDO)
      expect(exportButPseudo.rows[0].find((cell) => cell.id === 's1-sensitivity')?.value).toBe(accessType.PSEUDO)
    })

    it('reste indéterminée (valeur vide) quand les droits sont absents', () => {
      const table = mapSamplesToTable([cohort()], appConfig, callbacks, [], 'cohort-1', false)
      expect(sensitivityCell(table)?.value).toBe('')
    })
  })
})
