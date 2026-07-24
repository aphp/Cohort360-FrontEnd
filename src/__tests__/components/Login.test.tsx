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

let meState: unknown = null
vi.mock('state', () => ({
  useAppDispatch: () => dispatch,
  useAppSelector: (selector: (s: unknown) => unknown) => selector({ me: meState })
}))

vi.mock('services/aphp', () => ({
  default: { practitioner: { authenticate: vi.fn(async () => ({})), fetchPractitioner: vi.fn(async () => ({})) } }
}))

import Login from 'views/Login/Login'

const configWithJwt = () => {
  const cfg = getConfig()
  return {
    ...cfg,
    system: { ...cfg.system, displayJwtLogin: true, mailSupport: 'support@test.fr' }
  }
}

const renderLogin = () =>
  render(
    <AppConfig.Provider value={configWithJwt() as never}>
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    </AppConfig.Provider>
  )

beforeEach(() => {
  vi.clearAllMocks()
  meState = null
})

describe('views/Login', () => {
  it('affiche le formulaire de connexion JWT', () => {
    renderLogin()
    expect(screen.getByText('Connexion')).toBeInTheDocument()
    expect(screen.getByLabelText(/Identifiant/)).toBeInTheDocument()
  })

  it('permet de saisir identifiant et mot de passe', () => {
    renderLogin()
    const login = screen.getByLabelText(/Identifiant/)
    fireEvent.change(login, { target: { value: '4163689' } })
    expect((login as HTMLInputElement).value).toBe('4163689')
  })

  it('affiche le logo Cohort360', () => {
    renderLogin()
    expect(screen.getByAltText('Logo Cohort360')).toBeInTheDocument()
  })

  it('se rend sans planter quand me est null', () => {
    const { container } = renderLogin()
    expect(container.firstChild).toBeInTheDocument()
  })
})
