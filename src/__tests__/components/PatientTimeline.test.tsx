import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, waitFor } from '@testing-library/react'

vi.mock('react-pdf', () => ({ Document: () => null, Page: () => null, pdfjs: { GlobalWorkerOptions: {} } }))
vi.mock('components/DocumentViewer/DocumentViewer', () => ({ default: () => <div data-testid="doc-viewer" /> }))

const getCodeList = vi.fn(async () => ({ results: [{ id: 'dp', label: 'Diagnostic principal' }] }))
vi.mock('services/aphp/serviceValueSets', () => ({
  getCodeList: (...a: unknown[]) => getCodeList(...a)
}))

vi.mock('components/ExplorationBoard/CriteriasSection', () => ({ default: () => <div data-testid="criterias-section" /> }))
vi.mock('components/ExplorationBoard/SearchSection/FilterBy', () => ({ default: () => <div data-testid="filter-by" /> }))
vi.mock('./Timeline', () => ({ default: () => <div data-testid="timeline" /> }))
vi.mock('components/Patient/PatientTimeline/Timeline', () => ({ default: () => <div data-testid="timeline" /> }))

import PatientTimeline from 'components/Patient/PatientTimeline'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const encounter = (start: string): any => ({ resourceType: 'Encounter', id: `e-${start}`, period: { start } })

const baseProps = {
  groupId: 'g1',
  deidentified: false,
  hospits: [encounter('2023-01-01')],
  procedures: [],
  diagnostics: []
} as never

beforeEach(() => {
  vi.clearAllMocks()
})

describe('Patient/PatientTimeline', () => {
  it('se rend et récupère les listes de codes', async () => {
    const { container } = render(<PatientTimeline {...baseProps} />)
    await waitFor(() => {
      expect(getCodeList).toHaveBeenCalled()
    })
    expect(container.firstChild).toBeInTheDocument()
  })

  it('récupère les listes de codes (types de diagnostic / statut de visite)', async () => {
    render(<PatientTimeline {...baseProps} />)
    await waitFor(() => {
      expect(getCodeList).toHaveBeenCalled()
    })
  })

  it('gère l’absence de données', async () => {
    const { container } = render(<PatientTimeline {...baseProps} hospits={[]} procedures={[]} diagnostics={[]} />)
    await waitFor(() => {
      expect(getCodeList).toHaveBeenCalled()
    })
    expect(container.firstChild).toBeInTheDocument()
  })
})
