import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { AppConfig, getConfig } from 'config'
import { URLS } from 'types/exploration'
import { AccessLevel } from 'components/ui/AccessBadge'

const dispatch = vi.fn()
const navigate = vi.fn()
vi.mock('react-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router')>()
  return { ...actual, useNavigate: () => navigate }
})

const exploredCohort = { name: 'Ma cohorte', description: 'desc', cohortId: 'c1', loading: false, cohort: null }
vi.mock('state', () => ({
  useAppDispatch: () => dispatch,
  useAppSelector: (selector: (s: unknown) => unknown) =>
    selector({ me: { maintenance: { active: false } }, exploredCohort })
}))

vi.mock('hooks/researches/useCreateSample', () => ({ default: () => ({ mutate: vi.fn(), isPending: false }) }))
vi.mock('hooks/researches/useDeleteCohort', () => ({ default: () => ({ mutate: vi.fn(), isPending: false }) }))
vi.mock('hooks/researches/useEditCohort', () => ({ default: () => ({ mutate: vi.fn(), isPending: false }) }))
vi.mock('services/aphp', () => ({
  default: { patients: { fetchPatientsCount: vi.fn(async () => 0) } }
}))

vi.mock('components/Researches/Modals/AddOrEditItem', () => ({ default: () => <div data-testid="add-edit" /> }))
vi.mock('components/Researches/Modals/ConfirmDeletion', () => ({ default: () => <div data-testid="confirm-del" /> }))
vi.mock('components/Researches/Modals/CreateSample', () => ({ default: () => <div data-testid="create-sample" /> }))

import TopBar from 'components/TopBar/TopBar'

const renderTopBar = (context: URLS = URLS.COHORT) =>
  render(
    <AppConfig.Provider value={getConfig()}>
      <MemoryRouter>
        <TopBar context={context} patientsNb={1234} access={AccessLevel.NOMINATIVE ?? ('nominative' as never)} />
      </MemoryRouter>
    </AppConfig.Provider>
  )

beforeEach(() => {
  vi.clearAllMocks()
})

describe('TopBar', () => {
  it('affiche le nom de la cohorte en contexte COHORT', () => {
    renderTopBar(URLS.COHORT)
    expect(screen.getByText('Ma cohorte')).toBeInTheDocument()
  })

  it('affiche le libellé "Tous mes patients" en contexte PATIENTS', () => {
    renderTopBar(URLS.PATIENTS)
    expect(screen.getByText('Tous mes patients')).toBeInTheDocument()
  })

  it('affiche le libellé d’exploration de périmètres', () => {
    renderTopBar(URLS.PERIMETERS)
    expect(screen.getByText('Exploration de périmètres')).toBeInTheDocument()
  })

  it('se rend sans planter avec les données de cohorte', () => {
    const { container } = renderTopBar(URLS.COHORT)
    expect(container.firstChild).toBeInTheDocument()
  })
})
