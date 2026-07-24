import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import AddOrEditItem from 'components/Researches/Modals/AddOrEditItem'

beforeEach(() => {
  vi.clearAllMocks()
})

describe('AddOrEditItem (modal)', () => {
  it('affiche le titre de création quand aucun item sélectionné', () => {
    render(
      <AddOrEditItem
        open
        selectedItem={null}
        onCreate={vi.fn()}
        onUpdate={vi.fn()}
        titleCreate="Nouveau projet"
        titleEdit="Éditer le projet"
        onClose={vi.fn()}
      />
    )
    expect(screen.getByText('Nouveau projet')).toBeInTheDocument()
    expect(screen.getByText('Créer')).toBeInTheDocument()
  })

  it('affiche le titre d’édition avec un item sélectionné', () => {
    render(
      <AddOrEditItem
        open
        selectedItem={{ uuid: 'p1', name: 'Projet A', description: 'desc' } as never}
        onUpdate={vi.fn()}
        titleEdit="Éditer le projet"
        onClose={vi.fn()}
      />
    )
    expect(screen.getByText('Éditer le projet')).toBeInTheDocument()
    expect(screen.getByText('Modifier')).toBeInTheDocument()
  })

  it('désactive le bouton et affiche une erreur si le nom est vide après interaction', () => {
    render(
      <AddOrEditItem open selectedItem={null} onCreate={vi.fn()} onUpdate={vi.fn()} titleCreate="Nouveau" titleEdit="Édition" onClose={vi.fn()} />
    )
    const nameInput = screen.getByPlaceholderText('Nom')
    fireEvent.change(nameInput, { target: { value: 'a' } })
    fireEvent.change(nameInput, { target: { value: '' } })
    expect(screen.getByText(/Le nom doit comporter au moins un caractère/)).toBeInTheDocument()
    expect(screen.getByText('Créer').closest('button')).toBeDisabled()
  })

  it('appelle onCreate à la soumission d’un nouveau projet', () => {
    const onCreate = vi.fn()
    const onClose = vi.fn()
    render(
      <AddOrEditItem open selectedItem={null} onCreate={onCreate} onUpdate={vi.fn()} titleCreate="Nouveau" titleEdit="Édition" onClose={onClose} />
    )
    fireEvent.change(screen.getByPlaceholderText('Nom'), { target: { value: 'Mon projet' } })
    fireEvent.click(screen.getByText('Créer'))
    expect(onCreate).toHaveBeenCalledWith(expect.objectContaining({ name: 'Mon projet' }))
    expect(onClose).toHaveBeenCalled()
  })

  it('appelle onUpdate à la modification d’un item existant', () => {
    const onUpdate = vi.fn()
    render(
      <AddOrEditItem
        open
        selectedItem={{ uuid: 'p1', name: 'Projet A', description: '' } as never}
        onUpdate={onUpdate}
        titleEdit="Éditer"
        onClose={vi.fn()}
      />
    )
    fireEvent.change(screen.getByPlaceholderText('Nom'), { target: { value: 'Projet renommé' } })
    fireEvent.click(screen.getByText('Modifier'))
    expect(onUpdate).toHaveBeenCalledWith(expect.objectContaining({ uuid: 'p1', name: 'Projet renommé' }))
  })

  it('affiche une erreur si le nom dépasse 255 caractères', () => {
    render(
      <AddOrEditItem open selectedItem={null} onCreate={vi.fn()} onUpdate={vi.fn()} titleCreate="Nouveau" titleEdit="Édition" onClose={vi.fn()} />
    )
    fireEvent.change(screen.getByPlaceholderText('Nom'), { target: { value: 'a'.repeat(256) } })
    expect(screen.getByText(/trop long/)).toBeInTheDocument()
  })

  it('déclenche onClose au clic sur Annuler', () => {
    const onClose = vi.fn()
    render(
      <AddOrEditItem open selectedItem={null} onCreate={vi.fn()} onUpdate={vi.fn()} titleCreate="Nouveau" titleEdit="Édition" onClose={onClose} />
    )
    fireEvent.click(screen.getByText('Annuler'))
    expect(onClose).toHaveBeenCalled()
  })
})
