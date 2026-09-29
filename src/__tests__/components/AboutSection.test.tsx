import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { AppConfig, getConfig } from 'config'
import AboutSection from 'components/Routes/LeftSideBar/AboutSection'

const dispatch = vi.fn()
const navigate = vi.fn()
const { mockUseOnboardingEnabled } = vi.hoisted(() => ({ mockUseOnboardingEnabled: vi.fn() }))

vi.mock('react-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router')>()
  return { ...actual, useNavigate: () => navigate }
})

const state = { drawer: true }

vi.mock('state', () => ({
  useAppDispatch: () => dispatch,
  useAppSelector: (selector: (s: unknown) => unknown) => selector(state)
}))

vi.mock('state/drawer', () => ({ open: vi.fn(() => ({ type: 'open' })) }))

vi.mock('hooks/onboarding/useOnboardingEnabled', () => ({ default: () => mockUseOnboardingEnabled() }))

vi.mock('components/ui/ShimmerBadge', () => ({ default: ({ children }: { children?: unknown }) => <div>{children as never}</div> }))

const DOC_URL = 'https://doc.example.org'

const renderSection = (path = '/', urlDoc?: string) =>
  render(
    <AppConfig.Provider value={{ ...getConfig(), system: { ...getConfig().system, urlDoc } }}>
      <MemoryRouter initialEntries={[path]}>
        <AboutSection />
      </MemoryRouter>
    </AppConfig.Provider>
  )

beforeEach(() => {
  vi.clearAllMocks()
  state.drawer = true
  mockUseOnboardingEnabled.mockReturnValue(false)
})

describe('AboutSection', () => {
  describe('feature flag onboarding désactivé', () => {
    it('n’affiche pas la section « À propos de Cohort360 »', () => {
      renderSection('/', DOC_URL)
      expect(screen.queryByText('À propos de Cohort360')).not.toBeInTheDocument()
      expect(screen.queryByText('Mes habilitations')).not.toBeInTheDocument()
      expect(screen.queryByText('Mes engagements')).not.toBeInTheDocument()
      expect(screen.queryByText('Mes tutoriels')).not.toBeInTheDocument()
    })

    it('garde l’entrée Documentation d’avant', () => {
      renderSection('/', DOC_URL)
      const link = screen.getByText('Documentation').closest('a')
      expect(link).toHaveAttribute('id', 'documentation')
      expect(link).toHaveAttribute('href', DOC_URL)
      expect(link).toHaveAttribute('target', '_blank')
      expect(document.getElementById('about-collapse')).not.toBeInTheDocument()
    })

    it('n’affiche rien quand aucune documentation n’est configurée', () => {
      const { container } = renderSection()
      expect(container).toBeEmptyDOMElement()
    })
  })

  describe('feature flag onboarding actif', () => {
    beforeEach(() => {
      mockUseOnboardingEnabled.mockReturnValue(true)
    })

    it('est dépliée par défaut, avec ses quatre entrées dont la documentation', () => {
      renderSection('/', DOC_URL)
      expect(screen.getByText('À propos de Cohort360')).toBeInTheDocument()
      const section = within(document.getElementById('about-collapse') as HTMLElement)
      expect(section.getByText('Mes habilitations')).toBeInTheDocument()
      expect(section.getByText('Mes engagements')).toBeInTheDocument()
      expect(section.getByText('Mes tutoriels')).toBeInTheDocument()
      const documentation = section.getByText('Documentation').closest('a')
      expect(documentation).toHaveAttribute('href', DOC_URL)
      expect(documentation).toHaveAttribute('target', '_blank')
    })

    it('ne liste pas la documentation quand aucune URL n’est configurée', () => {
      renderSection()
      expect(screen.getByText('Mes tutoriels')).toBeInTheDocument()
      expect(screen.queryByText('Documentation')).not.toBeInTheDocument()
    })

    it('se replie au clic sur son titre', async () => {
      renderSection()
      fireEvent.click(screen.getByText('À propos de Cohort360'))
      await waitFor(() => expect(screen.queryByText('Mes habilitations')).not.toBeInTheDocument())
    })

    it('rouvre le menu replié sans replier la section', () => {
      state.drawer = false
      renderSection()
      fireEvent.click(screen.getByText('À propos de Cohort360'))
      expect(dispatch).toHaveBeenCalledWith({ type: 'open' })
      expect(screen.getByText('Mes habilitations')).toBeInTheDocument()
    })

    it.each([
      ['Mes habilitations', 'habilitations'],
      ['Mes engagements', 'engagements'],
      ['Mes tutoriels', 'tutoriels']
    ])('« %s » ouvre son écran de l’onboarding en mémorisant la page courante', (label: string, section: string) => {
      renderSection('/my-patients?tab=list')
      fireEvent.click(screen.getByText(label))
      expect(navigate).toHaveBeenCalledWith('/onboarding', { state: { from: '/my-patients?tab=list', section } })
    })
  })
})
