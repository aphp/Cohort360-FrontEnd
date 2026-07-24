import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { AppConfig, getConfig } from 'config'

const dispatch = vi.fn()
const navigate = vi.fn()

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>()
  return { ...actual, useNavigate: () => navigate }
})

const state = {
  me: { id: 'user-1', displayName: 'Jean Dupont', maintenance: { active: false } },
  drawer: true,
  cohortCreation: { request: { requestName: 'Ma requête', requestId: 'r1' } }
}

vi.mock('state', () => ({
  useAppDispatch: () => dispatch,
  useAppSelector: (selector: (s: unknown) => unknown) => selector(state)
}))

vi.mock('state/me', () => ({ logout: vi.fn(() => ({ type: 'logout' })) }))
vi.mock('state/drawer', () => ({ open: vi.fn(() => ({ type: 'open' })), close: vi.fn(() => ({ type: 'close' })) }))
vi.mock('state/cohortCreation', () => ({ resetCohortCreation: vi.fn(() => ({ type: 'reset' })) }))

vi.mock('components/Impersonation', () => ({ default: () => <div data-testid="impersonation" /> }))
vi.mock('components/ui/ShimmerBadge', () => ({ default: ({ children }: { children?: unknown }) => <div>{children as never}</div> }))

import LeftSideBar from 'components/Routes/LeftSideBar/LeftSideBar'

const renderBar = (open = true) =>
  render(
    <AppConfig.Provider value={getConfig()}>
      <MemoryRouter>
        <LeftSideBar open={open} />
      </MemoryRouter>
    </AppConfig.Provider>
  )

beforeEach(() => {
  vi.clearAllMocks()
  state.me.maintenance.active = false
})

describe('LeftSideBar', () => {
  it('affiche les entrées de navigation principales', () => {
    renderBar()
    expect(screen.getByText('Accueil')).toBeInTheDocument()
    expect(screen.getByText('Mes patients')).toBeInTheDocument()
  })

  it('affiche le bouton Nouvelle requête', () => {
    renderBar()
    expect(screen.getByText('Nouvelle requête')).toBeInTheDocument()
  })

  it('affiche "Nouvelle requête désactivée" en maintenance', () => {
    state.me.maintenance.active = true
    renderBar()
    expect(screen.getByText('Nouvelle requête désactivée')).toBeInTheDocument()
  })

  it('navigue vers l’accueil au clic sur Accueil', () => {
    renderBar()
    fireEvent.click(screen.getByText('Accueil'))
    expect(navigate).toHaveBeenCalled()
  })

  it('dispatch l’ouverture/fermeture du drawer au montage', () => {
    renderBar(true)
    expect(dispatch).toHaveBeenCalled()
  })

  it('affiche la requête en cours', () => {
    renderBar()
    expect(screen.getByText('Ma requête')).toBeInTheDocument()
  })
})
