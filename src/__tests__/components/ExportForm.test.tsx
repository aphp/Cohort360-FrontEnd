import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router'

const dispatch = vi.fn()
vi.mock('state', () => ({ useAppDispatch: () => dispatch }))
vi.mock('state/warningDialog', () => ({ showDialog: vi.fn((p) => ({ type: 'show', payload: p })) }))

const fetchExportableCohorts = vi.fn(async (..._a: any[]) => [])
const fetchExportableCohort = vi.fn(async (..._a: any[]) => [{ uuid: 'c1', group_id: 'g1', name: 'Cohorte' }])
vi.mock('services/aphp/callApi', () => ({
  fetchExportableCohorts: (...a: any[]) => fetchExportableCohorts(...a),
  fetchExportableCohort: (...a: any[]) => fetchExportableCohort(...a)
}))

const fetchExportTablesInfo = vi.fn(async (..._a: any[]) => [
  { name: 'person', columns: [], fhirResourceName: 'Patient', isFhirStandard: true, isOmopStandard: false }
])
vi.mock('services/aphp/serviceExportCohort', () => ({
  fetchExportTablesInfo: (...a: any[]) => fetchExportTablesInfo(...a),
  fetchExportTablesRelationsInfo: vi.fn(async () => []),
  postExportCohort: vi.fn(async () => ({ data: {} }))
}))

vi.mock('pages/ExportRequest/components/exportUtils', () => ({
  sortTables: (t: unknown[]) => t
}))

// On isole ExportForm de son enfant ExportTable
vi.mock('../ExportTable', () => ({ default: () => <div data-testid="export-table" /> }))
vi.mock('pages/ExportRequest/components/ExportTable', () => ({ default: () => <div data-testid="export-table" /> }))

import ExportForm from 'pages/ExportRequest/components/ExportForm'

const renderForm = (initialEntry = '/export') =>
  render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <ExportForm />
    </MemoryRouter>
  )

beforeEach(() => {
  vi.clearAllMocks()
})

describe('ExportForm', () => {
  it('charge la liste des cohortes exportables au montage (sans groupId)', async () => {
    renderForm('/export')
    await waitFor(() => {
      expect(fetchExportableCohorts).toHaveBeenCalled()
    })
  })

  it('charge la liste des tables d’export au montage', async () => {
    renderForm('/export')
    await waitFor(() => {
      expect(fetchExportTablesInfo).toHaveBeenCalled()
    })
  })

  it('vérifie l’existence de la cohorte quand groupId est présent', async () => {
    renderForm('/export?groupId=g1')
    await waitFor(() => {
      expect(fetchExportableCohort).toHaveBeenCalledWith('g1')
    })
  })

  it('gère une erreur de chargement des tables sans planter', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    fetchExportTablesInfo.mockRejectedValueOnce(new Error('boom'))
    renderForm('/export')
    await waitFor(() => {
      expect(errorSpy).toHaveBeenCalled()
    })
    errorSpy.mockRestore()
  })

  it('affiche un avertissement si la cohorte n’existe pas', async () => {
    fetchExportableCohort.mockResolvedValueOnce([])
    renderForm('/export?groupId=inexistant')
    await waitFor(() => {
      expect(dispatch).toHaveBeenCalled()
    })
  })
})
