import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import ModalCohortTitle from 'components/CreationCohort/Modals/ModalCohortTitle/ModalCohortTitle'

const baseProps = {
  onExecute: vi.fn(),
  onClose: vi.fn(),
  longCohort: false,
  cohortLimit: 20000
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('ModalCohortTitle', () => {
  it('affiche le titre et le champ nom', () => {
    render(<ModalCohortTitle {...baseProps} />)
    expect(screen.getByText('Création de la cohorte')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Nom de la cohorte')).toBeInTheDocument()
  })

  it('désactive le bouton Créer tant que le titre est en erreur (vide)', () => {
    render(<ModalCohortTitle {...baseProps} />)
    expect(screen.getByText('Créer').closest('button')).toBeDisabled()
  })

  it('active le bouton Créer après saisie d’un nom valide', () => {
    render(<ModalCohortTitle {...baseProps} />)
    fireEvent.change(screen.getByPlaceholderText('Nom de la cohorte'), { target: { value: 'Ma cohorte' } })
    expect(screen.getByText('Créer').closest('button')).not.toBeDisabled()
  })

  it('appelle onExecute avec le titre à la confirmation', () => {
    const onExecute = vi.fn()
    render(<ModalCohortTitle {...baseProps} onExecute={onExecute} />)
    fireEvent.change(screen.getByPlaceholderText('Nom de la cohorte'), { target: { value: 'Cohorte X' } })
    fireEvent.click(screen.getByText('Créer'))
    expect(onExecute).toHaveBeenCalledWith('Cohorte X', expect.any(String), expect.any(Boolean))
  })

  it('déclenche onClose au clic sur Annuler', () => {
    const onClose = vi.fn()
    render(<ModalCohortTitle {...baseProps} onClose={onClose} />)
    fireEvent.click(screen.getByText('Annuler'))
    expect(onClose).toHaveBeenCalled()
  })

  it('permet de saisir une description', () => {
    render(<ModalCohortTitle {...baseProps} />)
    const desc = screen.getByPlaceholderText('Description')
    fireEvent.change(desc, { target: { value: 'Une description' } })
    expect((desc as HTMLTextAreaElement).value).toBe('Une description')
  })

  it('gère le cas d’une cohorte volumineuse (longCohort)', () => {
    render(<ModalCohortTitle {...baseProps} longCohort />)
    expect(screen.getByText('Création de la cohorte')).toBeInTheDocument()
  })
})
