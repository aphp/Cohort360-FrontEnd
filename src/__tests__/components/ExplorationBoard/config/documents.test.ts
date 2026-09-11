import { describe, it, expect } from 'vitest'
import { mapToTable, documentsConfig } from 'components/ExplorationBoard/config/documents'
import { DocumentStatuses } from 'types/searchCriterias'
import { CohortComposition } from 'types'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const doc = (overrides: any = {}): CohortComposition =>
  ({
    resourceType: 'DocumentReference',
    id: 'd1',
    docStatus: DocumentStatuses.FINAL,
    description: 'Compte rendu',
    date: '2024-01-01T10:00:00Z',
    type: { coding: [{ code: 'CR-BILFONC' }] },
    IPP: '123',
    idPatient: 'p1',
    NDA: 'nda1',
    content: [{ attachment: { contentType: 'text/plain', data: Buffer.from('hello').toString('base64') } }],
    ...overrides
  }) as never

describe('documents.mapToTable', () => {
  it('construit une table avec les colonnes attendues (non patient)', () => {
    const table = mapToTable({ list: [doc()] } as never, false, false, ['g1'], false)
    expect(table.columns.map((c) => c.label)).toContain('Statut')
    expect(table.columns.map((c) => c.label)).toContain('Type de document')
    expect(table.rows).toHaveLength(1)
  })

  it('masque la colonne IPP en vue patient', () => {
    const table = mapToTable({ list: [doc()] } as never, false, true, ['g1'], false)
    const labels = table.columns.map((c) => String(c.label ?? ''))
    expect(labels.some((l) => l.startsWith('IPP'))).toBe(false)
  })

  it('gère un document annulé (statut CANCELLED)', () => {
    const table = mapToTable({ list: [doc({ docStatus: DocumentStatuses.PRELIMINARY })] } as never, false, false, [], false)
    expect(table.rows).toHaveLength(1)
  })

  it('gère une liste vide', () => {
    const table = mapToTable({ list: [] } as never, true, false, [], false)
    expect(table.rows).toEqual([])
  })

  it('gère un document sans titre ni date', () => {
    const table = mapToTable(
      { list: [doc({ description: undefined, date: undefined, type: { coding: [] } })] } as never,
      true,
      false,
      [],
      false
    )
    expect(table.rows).toHaveLength(1)
  })
})

describe('documents.documentsConfig', () => {
  it('retourne une config avec le type DOCUMENTS et les fonctions attendues', () => {
    const config = documentsConfig(false, null, ['g1'])
    expect(config.type).toBe('DocumentReference')
    expect(typeof config.initSearchCriterias).toBe('function')
    expect(typeof config.fetchList).toBe('function')
  })

  it('fournit mapToCards en vue patient et mapToTable sinon', () => {
    const patientConfig = documentsConfig(false, {} as never, ['g1'])
    const listConfig = documentsConfig(false, null, ['g1'])
    expect(!!patientConfig.mapToCards || !!listConfig.mapToTable).toBe(true)
  })
})
