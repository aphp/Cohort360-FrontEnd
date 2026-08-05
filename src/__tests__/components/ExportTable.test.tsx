import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { AppConfig, getConfig } from 'config'
import { TableInfo, TableSetting } from 'types/export'
import { Cohort } from 'types'

// Mocks des dépendances lourdes (services, utils de count, store)
vi.mock('pages/ExportRequest/components/exportUtils', () => ({
  getResourceType: vi.fn(() => 'Patient'),
  getExportTableLabel: vi.fn(() => 'Patient'),
  fetchResourceCount2: vi.fn(async () => 42),
  fetchQuestionnaireResponseCountDetails: vi.fn(async () => [])
}))

vi.mock('services/aphp/serviceFilters', () => ({
  getProviderFilters: vi.fn(async () => [])
}))

const dispatch = vi.fn()
vi.mock('state', () => ({
  useAppDispatch: () => dispatch,
  useAppSelector: (selector: (s: unknown) => unknown) => selector({ me: { id: 'user-1' } })
}))

vi.mock('state/warningDialog', () => ({
  showDialog: vi.fn((p) => ({ type: 'show', payload: p })),
  hideDialog: vi.fn(() => ({ type: 'hide' }))
}))

import ExportTable from 'pages/ExportRequest/components/ExportTable'

const tableInfo: TableInfo = {
  name: 'person',
  columns: ['col1', 'col2'],
  fhirResourceName: 'Patient',
  isFhirStandard: true,
  isOmopStandard: false
}

const tableSetting: TableSetting = {
  tableName: 'person',
  isChecked: true,
  columns: ['col1'],
  fhirFilter: null,
  respectTableRelationships: true,
  pivotMergeColumns: [],
  pivotMergeIds: []
} as never

const cohort = { uuid: 'c1', group_id: 'g1', name: 'Cohorte' } as Cohort

const renderTable = (props: Partial<Parameters<typeof ExportTable>[0]> = {}) =>
  render(
    <AppConfig.Provider value={getConfig()}>
      <ExportTable
        exportTable={tableInfo}
        exportTableSettings={tableSetting}
        exportCohort={cohort}
        setError={vi.fn()}
        addNewTableSetting={vi.fn()}
        removeTableSetting={vi.fn()}
        onChangeTableSettings={vi.fn()}
        compatibilitiesTables={null}
        exportTypeFile="csv"
        oneFile={false}
        selectedTablesCount={1}
        {...props}
      />
    </AppConfig.Provider>
  )

beforeEach(() => {
  vi.clearAllMocks()
})

describe('ExportTable', () => {
  it('affiche le libellé de la table', async () => {
    renderTable()
    expect(await screen.findByText('Patient')).toBeInTheDocument()
  })

  it('affiche le nombre de lignes récupéré via fetchResourceCount2', async () => {
    renderTable()
    await waitFor(() => {
      expect(screen.getByText(/42/)).toBeInTheDocument()
    })
  })

  it('permet de cocher/décocher la table', () => {
    const onChangeTableSettings = vi.fn()
    const addNewTableSetting = vi.fn()
    renderTable({ onChangeTableSettings, addNewTableSetting })
    const checkbox = screen.getAllByRole('checkbox')[0]
    fireEvent.click(checkbox)
    // une action de mise à jour ou d'ajout est déclenchée
    expect(onChangeTableSettings.mock.calls.length + addNewTableSetting.mock.calls.length).toBeGreaterThan(0)
  })

  it('gère une table non cochée', async () => {
    renderTable({ exportTableSettings: { ...tableSetting, isChecked: false } as never })
    expect(await screen.findByText('Patient')).toBeInTheDocument()
  })

  it('signale la sous-table patient__identifier sur la table Patient', async () => {
    renderTable({ exportTable: { ...tableInfo, name: 'Patient' } })
    expect(await screen.findByText(/patient__identifier sera également exportée/)).toBeInTheDocument()
  })

  it("masque la mention de patient__identifier en export regroupé lorsqu'une autre table est sélectionnée", async () => {
    renderTable({ exportTable: { ...tableInfo, name: 'Patient' }, oneFile: true, selectedTablesCount: 2 })
    await screen.findAllByText('Patient')
    expect(screen.queryByText(/patient__identifier sera également exportée/)).not.toBeInTheDocument()
  })

  it('conserve la mention de patient__identifier en export regroupé sur la seule table Patient', async () => {
    renderTable({ exportTable: { ...tableInfo, name: 'Patient' }, oneFile: true, selectedTablesCount: 1 })
    expect(await screen.findByText(/patient__identifier sera également exportée/)).toBeInTheDocument()
  })
})
