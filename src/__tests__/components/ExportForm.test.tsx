import { describe, it, expect, vi, beforeEach } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

const dispatch = vi.fn()
vi.mock('state', () => ({ useAppDispatch: () => dispatch }))
vi.mock('state/warningDialog', () => ({ showDialog: vi.fn((p) => ({ type: 'show', payload: p })) }))

vi.mock('services/aphp/callApi', () => ({
  fetchExportableCohorts: vi.fn(async () => []),
  fetchExportableCohort: vi.fn(async () => [{ uuid: 'c1', group_id: 'g1', name: 'Cohorte' }])
}))

vi.mock('services/aphp/serviceExportCohort', () => ({
  fetchExportTablesInfo: vi.fn(async () => [
    { name: 'Patient', columns: [], fhirResourceName: 'Patient', isFhirStandard: true, isOmopStandard: false }
  ]),
  fetchExportTablesRelationsInfo: vi.fn(async () => []),
  postExportCohort: vi.fn(async () => ({ data: {} }))
}))

vi.mock('pages/ExportRequest/components/exportUtils', () => ({
  sortTables: (t: unknown[]) => t
}))

vi.mock('../ExportTable', () => ({ default: () => <div data-testid="export-table" /> }))
vi.mock('pages/ExportRequest/components/ExportTable', () => ({ default: () => <div data-testid="export-table" /> }))

import ExportForm from 'pages/ExportRequest/components/ExportForm'

const renderForm = () =>
  render(
    <MemoryRouter initialEntries={['/export?groupId=g1']}>
      <ExportForm />
    </MemoryRouter>
  )

const fillMotivationAndConditions = () => {
  fireEvent.change(screen.getByLabelText(/Motif de l'export/), { target: { value: "Export pour l'étude" } })
  fireEvent.click(screen.getByRole('checkbox', { name: /conditions ci-dessus/i }))
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('ExportForm', () => {
  it('bloque le regroupement en un seul fichier quand une seule table est sélectionnée', async () => {
    renderForm()
    await waitFor(() => expect(screen.getByRole('button', { name: 'Confirmer' })).toBeInTheDocument())

    fillMotivationAndConditions()
    fireEvent.click(screen.getByRole('checkbox', { name: /Regrouper plusieurs tables en un seul fichier/i }))

    expect(screen.getByRole('button', { name: 'Confirmer' })).toBeDisabled()
    expect(screen.getByText(/au moins deux tables pour regrouper l'export/i)).toBeInTheDocument()
  })

  it('autorise l’export d’une seule table hors regroupement', async () => {
    renderForm()
    await waitFor(() => expect(screen.getByRole('button', { name: 'Confirmer' })).toBeInTheDocument())

    fillMotivationAndConditions()

    expect(screen.getByRole('button', { name: 'Confirmer' })).toBeEnabled()
    expect(screen.queryByText(/au moins deux tables pour regrouper l'export/i)).not.toBeInTheDocument()
  })
})
