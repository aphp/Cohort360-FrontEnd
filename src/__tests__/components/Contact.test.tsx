import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'

const postIssue = vi.fn(async () => true)
vi.mock('services/aphp', () => ({
  default: { contact: { postIssue: (...a: unknown[]) => postIssue(...a) } }
}))

vi.mock('state', () => ({
  useAppSelector: (selector: (s: unknown) => unknown) => selector({ drawer: true }),
  useAppDispatch: () => vi.fn()
}))

import Contact from 'views/Contact/Contact'

beforeEach(() => {
  vi.clearAllMocks()
})

describe('Contact (vue)', () => {
  it('rend le formulaire de contact avec le bouton Envoyer', () => {
    render(<Contact />)
    expect(screen.getByText('Envoyer')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Objet')).toBeInTheDocument()
  })

  it('affiche une erreur si le type de demande est manquant à la soumission', async () => {
    render(<Contact />)
    fireEvent.click(screen.getByText('Envoyer'))
    // sans type de demande, postIssue ne doit pas être appelé
    await waitFor(() => {
      expect(postIssue).not.toHaveBeenCalled()
    })
  })

  it('n’appelle pas postIssue si objet/message manquants', async () => {
    render(<Contact />)
    // remplir uniquement l'objet, message manquant
    fireEvent.change(screen.getByPlaceholderText('Objet'), { target: { value: 'Bug' } })
    fireEvent.click(screen.getByText('Envoyer'))
    await waitFor(() => {
      expect(postIssue).not.toHaveBeenCalled()
    })
  })

  it('permet de saisir un message', () => {
    render(<Contact />)
    const message = screen.getByPlaceholderText(/Écrivez votre message ici/)
    fireEvent.change(message, { target: { value: 'Mon message détaillé' } })
    expect((message as HTMLTextAreaElement).value).toBe('Mon message détaillé')
  })
})
