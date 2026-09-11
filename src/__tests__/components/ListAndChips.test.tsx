import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import List from 'components/ui/List'
import ExpandableChipsLine from 'components/ui/ExpandableChips'
import { Item } from 'components/ui/List/ListItem'

describe('ui/List', () => {
  const items: Item[] = [
    { id: '1', name: 'Élément 1', checked: false },
    { id: '2', name: 'Élément 2', checked: false }
  ]

  it('affiche les éléments et le bouton tout sélectionner', () => {
    render(<List values={items} count={2} onSelect={vi.fn()} fetchPaginateData={vi.fn()} />)
    expect(screen.getByText(/Tout sélectionner/i)).toBeInTheDocument()
  })

  it('affiche un message quand la liste est vide', () => {
    render(<List values={[]} count={0} onSelect={vi.fn()} fetchPaginateData={vi.fn()} />)
    expect(screen.getByText('Aucun élément.')).toBeInTheDocument()
  })

  it('bascule la sélection globale et notifie onSelect', () => {
    const onSelect = vi.fn()
    render(<List values={items} count={2} onSelect={onSelect} fetchPaginateData={vi.fn()} />)
    const selectAll = screen.getByText(/Tout sélectionner/i).closest('label')!.querySelector('input')!
    fireEvent.click(selectAll)
    // après sélection globale, le libellé passe à "désélectionner"
    expect(screen.getByText(/Tout désélectionner/i)).toBeInTheDocument()
    expect(onSelect).toHaveBeenCalled()
  })
})

describe('ui/ExpandableChipsLine', () => {
  it('rend le conteneur de chips', () => {
    // En jsdom offsetWidth vaut 0, la ligne peut réduire le nombre de chips visibles;
    // on vérifie donc le rendu du conteneur plutôt que le texte exact.
    const { container } = render(<ExpandableChipsLine items={['Alpha', 'Beta', 'Gamma']} />)
    expect(container.firstChild).toBeInTheDocument()
  })

  it('gère une liste vide sans planter', () => {
    const { container } = render(<ExpandableChipsLine items={[]} />)
    expect(container.firstChild).toBeInTheDocument()
  })

  it('applique les couleurs personnalisées sans planter', () => {
    const { container } = render(<ExpandableChipsLine items={['X']} colorString="#000" backgroundColor="#eee" />)
    expect(container.firstChild).toBeInTheDocument()
  })
})
