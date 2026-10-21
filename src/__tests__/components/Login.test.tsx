import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
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

describe('views/Login - annonce double authentification (#3663)', () => {
  const renderAt = (isoDate: string) => {
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date(isoDate))
    return renderLogin()
  }
  const isBefore = (a: Element, b: Element) => !!(a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING)

  afterEach(() => vi.useRealTimers())

  it.each(['2026-10-21T23:59:00+02:00'])("n'affiche rien avant le 22/10/2026 (%s)", (date) => {
    renderAt(date)
    expect(document.getElementById('mfa-banner')).toBeNull()
    expect(document.getElementById('mfa-help')).toBeNull()
  })

  it.each(['2026-10-22T00:00:00+02:00', '2026-10-28T23:59:00+01:00'])(
    "affiche le bandeau d'annonce sans aide (%s)",
    (date) => {
      renderAt(date)
      const banner = document.getElementById('mfa-banner')!
      expect(screen.getByText('A partir du 29 octobre 2026 : double authentification')).toBeInTheDocument()
      expect(screen.getByText(/donnent accès à des données sensibles/)).toBeInTheDocument()
      expect(document.getElementById('mfa-help')).toBeNull()
      expect(isBefore(screen.getByText('Bienvenue ! Connectez-vous.'), banner)).toBe(true)
      expect(isBefore(banner, screen.getByRole('button', { name: /Connexion via OIDC/ }))).toBe(true)
      expect(banner.querySelector('button')).toBeNull()
    }
  )

  it.each(['2026-10-29T00:00:00+01:00', '2026-11-11T23:59:00+01:00'])(
    "affiche le bandeau avec l'aide au-dessus du bouton OIDC (%s)",
    (date) => {
      renderAt(date)
      const banner = document.getElementById('mfa-banner')!
      const help = document.getElementById('mfa-help')!
      expect(banner).toContainElement(help)
      expect(screen.getByRole('link', { name: 'ce lien' })).toBeInTheDocument()
      expect(screen.getByRole('link', { name: 'id.recherche.support.dsn@aphp.fr' })).toHaveAttribute(
        'href',
        'mailto:id.recherche.support.dsn@aphp.fr'
      )
      expect(isBefore(banner, screen.getByRole('button', { name: /Connexion via OIDC/ }))).toBe(true)
    }
  )

  it.each(['2026-11-12T00:00:00+01:00', '2027-06-01T12:00:00+02:00'])(
    "n'affiche plus que l'aide, sous le bouton OIDC (%s)",
    (date) => {
      renderAt(date)
      expect(document.getElementById('mfa-banner')).toBeNull()
      const help = document.getElementById('mfa-help')!
      expect(isBefore(screen.getByRole('button', { name: /Connexion via OIDC/ }), help)).toBe(true)
      expect(isBefore(help, screen.getByText('En vous connectant, vous acceptez les mentions légales.'))).toBe(true)
    }
  )
})
