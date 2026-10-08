import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AppConfig, getConfig } from 'config'

const dispatch = vi.fn()
const navigate = vi.fn()
vi.mock('react-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router')>()
  return { ...actual, useNavigate: () => navigate }
})

let meState: unknown = null
vi.mock('state', () => ({
  useAppDispatch: () => dispatch,
  useAppSelector: (selector: (s: unknown) => unknown) => selector({ me: meState })
}))

// Authentification en échec par défaut ; la maintenance en 503 arrête le chargement qui suit une authentification réussie
const authenticateWithCredentials = vi.fn<() => Promise<unknown>>(async () => null)
const maintenance = vi.fn(async () => ({ status: 503 }))
vi.mock('services/aphp', () => ({
  default: {
    practitioner: {
      authenticate: vi.fn(async () => ({})),
      authenticateWithCredentials: () => authenticateWithCredentials(),
      maintenance: () => maintenance(),
      fetchPractitioner: vi.fn(async () => ({}))
    }
  }
}))

import Login from 'views/Login/Login'
import { ACCESS_TOKEN } from 'constants.js'
import { clearUser } from 'state/me'
import { registerSessionUsername } from 'utils/sessionUser'

const makeJwt = (payload: Record<string, unknown>) => `header.${btoa(JSON.stringify(payload))}.signature`
const validTokenFor = (username: string) => makeJwt({ username, exp: Math.floor(Date.now() / 1000) + 3600 })

const configWithJwt = () => {
  const cfg = getConfig()
  return {
    ...cfg,
    system: { ...cfg.system, displayJwtLogin: true, mailSupport: 'support@test.fr' }
  }
}

const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })

const renderLogin = () =>
  render(
    <QueryClientProvider client={queryClient}>
      <AppConfig.Provider value={configWithJwt() as never}>
        <MemoryRouter>
          <Login />
        </MemoryRouter>
      </AppConfig.Provider>
    </QueryClientProvider>
  )

beforeEach(() => {
  vi.clearAllMocks()
  meState = null
  localStorage.clear()
  registerSessionUsername(() => undefined)
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

  it("oublie l'utilisateur d'une session précédente avant la requête d'authentification", async () => {
    renderLogin()
    fireEvent.change(screen.getByLabelText(/Identifiant/), { target: { value: 'userB' } })
    fireEvent.change(screen.getByLabelText(/mot de passe/), { target: { value: 'secret' } })
    fireEvent.click(screen.getByRole('button', { name: 'Connexion' }))

    await waitFor(() => expect(authenticateWithCredentials).toHaveBeenCalled())
    expect(dispatch).toHaveBeenCalledWith(clearUser())
    expect(dispatch.mock.invocationCallOrder[0]).toBeLessThan(authenticateWithCredentials.mock.invocationCallOrder[0])
  })

  it("redirige vers l'application quand la session persistée est valide", () => {
    meState = { userName: 'userA' }
    registerSessionUsername(() => 'userA')
    localStorage.setItem(ACCESS_TOKEN, validTokenFor('userA'))
    renderLogin()
    expect(navigate).toHaveBeenCalledWith('/home', { replace: true })
  })

  it('reste sur la page de connexion quand le token appartient à un autre utilisateur', () => {
    meState = { userName: 'userA' }
    registerSessionUsername(() => 'userA')
    localStorage.setItem(ACCESS_TOKEN, validTokenFor('userB'))
    renderLogin()
    expect(navigate).not.toHaveBeenCalled()
  })

  it('vide les données de la session précédente après une authentification réussie', async () => {
    localStorage.setItem('impersonated_user', JSON.stringify({ username: 'autre' }))
    localStorage.setItem('cle-obsolete', 'valeur')
    localStorage.setItem('old-path', '/researches/projects')
    authenticateWithCredentials.mockResolvedValueOnce({
      status: 200,
      data: { access_token: 'new-access', refresh_token: 'new-refresh', user: {}, last_login: '' }
    })
    renderLogin()
    fireEvent.change(screen.getByLabelText(/Identifiant/), { target: { value: 'userB' } })
    fireEvent.change(screen.getByLabelText(/mot de passe/), { target: { value: 'secret' } })
    fireEvent.click(screen.getByRole('button', { name: 'Connexion' }))

    await waitFor(() => expect(localStorage.getItem(ACCESS_TOKEN)).toBe('new-access'))
    expect(localStorage.getItem('impersonated_user')).toBeNull()
    expect(localStorage.getItem('cle-obsolete')).toBeNull()
    expect(localStorage.getItem('old-path')).toBe('/researches/projects')
    expect(localStorage.getItem('oidcAuth')).toBe('false')
  })
})
