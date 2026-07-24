import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import CriteriaLayout from 'components/ui/CriteriaLayout'

const baseProps = {
  isEdition: false,
  goBack: vi.fn(),
  onSubmit: vi.fn(),
  disabled: false,
  criteriaLabel: 'Diagnostic',
  mainTitle: 'Critère de diagnostic',
  title: 'Mon critère',
  onChangeTitle: vi.fn(),
  isInclusive: true,
  onChangeIsInclusive: vi.fn()
}

describe('ui/CriteriaLayout', () => {
  it('affiche le titre d’ajout en mode création', () => {
    render(<CriteriaLayout {...baseProps}><div>contenu</div></CriteriaLayout>)
    expect(screen.getByText(/Ajouter un critère/)).toBeInTheDocument()
    expect(screen.getByText('contenu')).toBeInTheDocument()
  })

  it('affiche le titre de modification en mode édition', () => {
    render(<CriteriaLayout {...baseProps} isEdition><div /></CriteriaLayout>)
    expect(screen.getByText(/Modifier un critère/)).toBeInTheDocument()
  })

  it('notifie le changement de nom du critère', () => {
    const onChangeTitle = vi.fn()
    render(<CriteriaLayout {...baseProps} onChangeTitle={onChangeTitle}><div /></CriteriaLayout>)
    fireEvent.change(screen.getByPlaceholderText('Nom du critère'), { target: { value: 'Nouveau' } })
    expect(onChangeTitle).toHaveBeenCalledWith('Nouveau')
  })

  it('déclenche onSubmit au clic sur Confirmer', () => {
    const onSubmit = vi.fn()
    render(<CriteriaLayout {...baseProps} onSubmit={onSubmit}><div /></CriteriaLayout>)
    fireEvent.click(screen.getByText('Confirmer'))
    expect(onSubmit).toHaveBeenCalled()
  })

  it('déclenche onChangeIsInclusive au clic sur le switch d’exclusion', () => {
    const onChangeIsInclusive = vi.fn()
    render(<CriteriaLayout {...baseProps} onChangeIsInclusive={onChangeIsInclusive}><div /></CriteriaLayout>)
    fireEvent.click(screen.getByText(/Exclure les patients/))
    expect(onChangeIsInclusive).toHaveBeenCalledWith(false)
  })

  it('désactive le bouton Confirmer quand disabled', () => {
    render(<CriteriaLayout {...baseProps} disabled><div /></CriteriaLayout>)
    expect(screen.getByText('Confirmer').closest('button')).toBeDisabled()
  })

  it('affiche Annuler en mode création et le masque en édition', () => {
    const { rerender } = render(<CriteriaLayout {...baseProps}><div /></CriteriaLayout>)
    expect(screen.getByText('Annuler')).toBeInTheDocument()
    rerender(<CriteriaLayout {...baseProps} isEdition><div /></CriteriaLayout>)
    expect(screen.queryByText('Annuler')).not.toBeInTheDocument()
  })
})
