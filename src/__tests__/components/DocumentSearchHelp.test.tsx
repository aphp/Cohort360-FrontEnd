import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import DocumentSearchHelp from 'components/ui/Helpers/DocumentSearchHelp'

describe('ui/Helpers/DocumentSearchHelp', () => {
  it('affiche le titre et le contenu d’aide quand ouvert', () => {
    render(<DocumentSearchHelp open onClose={vi.fn()} />)
    expect(screen.getByText('Aide à la recherche textuelle')).toBeInTheDocument()
    expect(screen.getByText(/opérateurs ci-dessous/)).toBeInTheDocument()
  })

  it('propose un bouton Fermer qui déclenche onClose', () => {
    const onClose = vi.fn()
    render(<DocumentSearchHelp open onClose={onClose} />)
    fireEvent.click(screen.getByText('Fermer'))
    expect(onClose).toHaveBeenCalled()
  })

  it('ne rend pas le contenu quand fermé', () => {
    render(<DocumentSearchHelp open={false} onClose={vi.fn()} />)
    expect(screen.queryByText('Aide à la recherche textuelle')).not.toBeInTheDocument()
  })
})
