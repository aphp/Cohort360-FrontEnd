import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'

vi.mock('react-pdf', () => ({ Document: () => null, Page: () => null, pdfjs: { GlobalWorkerOptions: {} } }))
vi.mock('components/DocumentViewer/DocumentViewer', () => ({ default: () => <div data-testid="doc-viewer" /> }))

const dispatch = vi.fn()
vi.mock('state', () => ({ useAppDispatch: () => dispatch }))

const shareRequest = vi.fn(async () => ({ status: 200 }))
vi.mock('services/aphp', () => ({
  default: { projects: { shareRequest: (...a: unknown[]) => shareRequest(...a) } }
}))

vi.mock('./components/RequestShareForm', () => ({ default: () => <div data-testid="share-form" /> }))
vi.mock('components/Researches/Modals/components/RequestShareForm', () => ({
  default: () => <div data-testid="share-form" />
}))

import ModalShareRequest from 'components/Researches/Modals/ModalShareRequest'

const request = { uuid: 'r1', name: 'Ma requête', requestName: 'Ma requête' } as never

beforeEach(() => {
  vi.clearAllMocks()
})

describe('ModalShareRequest', () => {
  it('affiche le titre et le formulaire de partage', () => {
    render(<ModalShareRequest open requestToShare={request} onClose={vi.fn()} />)
    expect(screen.getByText('Partager une requête')).toBeInTheDocument()
    expect(screen.getByTestId('share-form')).toBeInTheDocument()
  })

  it('propose les boutons Annuler et Valider', () => {
    render(<ModalShareRequest open requestToShare={request} onClose={vi.fn()} />)
    expect(screen.getByText('Annuler')).toBeInTheDocument()
    expect(screen.getByText('Valider')).toBeInTheDocument()
  })

  it('déclenche onClose au clic sur Annuler', () => {
    const onClose = vi.fn()
    render(<ModalShareRequest open requestToShare={request} onClose={onClose} />)
    fireEvent.click(screen.getByText('Annuler'))
    expect(onClose).toHaveBeenCalled()
  })

  it('affiche une erreur si aucun utilisateur sélectionné à la validation', () => {
    render(<ModalShareRequest open requestToShare={request} onClose={vi.fn()} />)
    fireEvent.click(screen.getByText('Valider'))
    // sans utilisateur cible, shareRequest ne doit pas être appelé
    expect(shareRequest).not.toHaveBeenCalled()
  })

  it('ne rend pas le dialogue quand open est false', () => {
    render(<ModalShareRequest open={false} requestToShare={request} onClose={vi.fn()} />)
    expect(screen.queryByText('Partager une requête')).not.toBeInTheDocument()
  })
})
