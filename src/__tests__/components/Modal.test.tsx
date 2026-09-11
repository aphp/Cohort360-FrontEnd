import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import Modal from 'components/ui/Modal'

describe('ui/Modal', () => {
  it('ne rend rien de visible quand open est false', () => {
    render(
      <Modal open={false} title="Titre">
        <div>contenu</div>
      </Modal>
    )
    expect(screen.queryByText('contenu')).not.toBeInTheDocument()
  })

  it('rend le titre, le contenu et les boutons par défaut', () => {
    render(
      <Modal open title="Mon titre">
        <div>contenu modal</div>
      </Modal>
    )
    expect(screen.getByText('Mon titre')).toBeInTheDocument()
    expect(screen.getByText('contenu modal')).toBeInTheDocument()
    expect(screen.getByText('Valider')).toBeInTheDocument()
    expect(screen.getByText('Annuler')).toBeInTheDocument()
  })

  it('utilise les libellés personnalisés submit/cancel', () => {
    render(
      <Modal open submitText="Enregistrer" cancelText="Fermer">
        <div />
      </Modal>
    )
    expect(screen.getByText('Enregistrer')).toBeInTheDocument()
    expect(screen.getByText('Fermer')).toBeInTheDocument()
  })

  it('déclenche onSubmit et onClose', () => {
    const onSubmit = vi.fn()
    const onClose = vi.fn()
    render(
      <Modal open onSubmit={onSubmit} onClose={onClose}>
        <div />
      </Modal>
    )
    fireEvent.click(screen.getByText('Valider'))
    fireEvent.click(screen.getByText('Annuler'))
    expect(onSubmit).toHaveBeenCalled()
    expect(onClose).toHaveBeenCalled()
  })

  it('désactive le bouton submit quand isError est vrai', () => {
    render(
      <Modal open isError submitText="Valider">
        <div />
      </Modal>
    )
    expect(screen.getByText('Valider').closest('button')).toBeDisabled()
  })

  it('en mode readonly, n’affiche que le bouton de fermeture', () => {
    render(
      <Modal open readonly cancelText="Fermer">
        <div />
      </Modal>
    )
    expect(screen.getByText('Fermer')).toBeInTheDocument()
    expect(screen.queryByText('Valider')).not.toBeInTheDocument()
  })

  it('ne rend pas de titre quand title est absent', () => {
    render(
      <Modal open>
        <div>sans titre</div>
      </Modal>
    )
    expect(screen.getByText('sans titre')).toBeInTheDocument()
  })
})
