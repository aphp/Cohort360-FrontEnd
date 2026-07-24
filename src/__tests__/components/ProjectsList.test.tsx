import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

vi.mock('react-pdf', () => ({ Document: () => null, Page: () => null, pdfjs: { GlobalWorkerOptions: {} } }))
vi.mock('components/DocumentViewer/DocumentViewer', () => ({ default: () => <div data-testid="doc-viewer" /> }))

const navigate = vi.fn()
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>()
  return { ...actual, useNavigate: () => navigate }
})

vi.mock('state', () => ({
  useAppSelector: (selector: (s: unknown) => unknown) => selector({ me: { maintenance: { active: false } } })
}))

const useProjects = vi.fn(() => ({
  projectsList: [{ uuid: 'p1', name: 'Projet 1' }],
  total: 1,
  loading: false
}))
vi.mock('hooks/researches/useProjects', () => ({ default: (...a: unknown[]) => useProjects(...a) }))
vi.mock('hooks/researches/useCreateProject', () => ({ default: () => ({ mutate: vi.fn(), isPending: false }) }))
vi.mock('hooks/researches/useDeleteProject', () => ({ default: () => ({ mutate: vi.fn(), isPending: false }) }))
vi.mock('hooks/researches/useEditProject', () => ({ default: () => ({ mutate: vi.fn(), isPending: false }) }))

vi.mock('./Modals/AddOrEditItem', () => ({ default: () => <div data-testid="add-edit" /> }))
vi.mock('./Modals/ConfirmDeletion', () => ({ default: () => <div data-testid="confirm-del" /> }))

import ProjectsList from 'components/Researches/ProjectsList'

const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })

const renderList = () =>
  render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/researches/projects']}>
        <ProjectsList />
      </MemoryRouter>
    </QueryClientProvider>
  )

beforeEach(() => {
  vi.clearAllMocks()
})

describe('ProjectsList', () => {
  it('affiche le bouton Nouveau projet', () => {
    renderList()
    expect(screen.getByText('Nouveau projet')).toBeInTheDocument()
  })

  it('appelle useProjects', () => {
    renderList()
    expect(useProjects).toHaveBeenCalled()
  })

  it('gère l’état de chargement', () => {
    useProjects.mockReturnValueOnce({ projectsList: [], total: 0, loading: true })
    const { container } = renderList()
    expect(container.firstChild).toBeInTheDocument()
  })

  it('gère une liste vide', () => {
    useProjects.mockReturnValueOnce({ projectsList: [], total: 0, loading: false })
    const { container } = renderList()
    expect(container.firstChild).toBeInTheDocument()
  })
})
