import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

const navigate = vi.fn()
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>()
  return { ...actual, useNavigate: () => navigate }
})

let exploredCohort = { cohort: null as unknown, cohortId: 'c1' }
vi.mock('state', () => ({
  useAppSelector: (selector: (s: unknown) => unknown) => selector({ exploredCohort })
}))

import PatientHeader from 'components/Patient/PatientHeader/PatientHeader'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const patient = (overrides: any = {}): any => ({
  deidentified: false,
  id: 'p1',
  infos: {
    resourceType: 'Patient',
    birthDate: '1990-05-15',
    gender: 'male',
    name: [{ use: 'official', given: ['Jean'], family: 'Dupont' }],
    identifier: [{ value: 'IPP123' }],
    ...overrides.infos
  },
  ...overrides
})

const renderHeader = (p = patient(), groupId = 'g1') =>
  render(
    <MemoryRouter>
      <PatientHeader patient={p} groupId={groupId} />
    </MemoryRouter>
  )

beforeEach(() => {
  vi.clearAllMocks()
  exploredCohort = { cohort: null, cohortId: 'c1' }
})

describe('Patient/PatientHeader', () => {
  it('affiche le nom du patient en mode nominatif', () => {
    renderHeader()
    expect(screen.getByText(/Jean/)).toBeInTheDocument()
  })

  it('affiche "Information Patient" en mode pseudonymisé', () => {
    renderHeader(patient({ deidentified: true }))
    expect(screen.getByText('Information Patient')).toBeInTheDocument()
  })

  it('se rend avec le contexte cohorte', () => {
    const { container } = renderHeader()
    expect(container.firstChild).toBeInTheDocument()
  })

  it('gère le contexte "tous mes patients" (sans cohorte)', () => {
    exploredCohort = { cohort: null, cohortId: '' }
    const { container } = renderHeader()
    expect(container.firstChild).toBeInTheDocument()
  })

  it('gère le contexte périmètres', () => {
    exploredCohort = { cohort: [{ id: 's1' }] as never, cohortId: '' }
    const { container } = renderHeader()
    expect(container.firstChild).toBeInTheDocument()
  })
})
