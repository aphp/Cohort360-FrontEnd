import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { SearchByTypes } from 'types/searchCriterias'

vi.mock('state', () => ({
  useAppSelector: (selector: (s: unknown) => unknown) => selector({ me: { maintenance: { active: false } } })
}))

vi.mock('../Filters', () => ({ default: () => <div data-testid="exploration-filters" /> }))
vi.mock('components/ExplorationBoard/Filters', () => ({ default: () => <div data-testid="exploration-filters" /> }))

import EditSavedFilter from 'components/ExplorationBoard/SearchSection/EditSavedFilter'

const criteria = {
  filterName: 'Mon filtre',
  filterParams: {
    searchBy: SearchByTypes.TEXT,
    searchInput: 'recherche',
    orderBy: {},
    filters: {}
  }
} as never

const infos = { deidentified: false } as never

const baseProps = {
  open: true,
  criteria,
  infos,
  onEdit: vi.fn(),
  onClose: vi.fn()
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('ExplorationBoard/EditSavedFilter', () => {
  it('rend la modale d’édition avec les filtres', () => {
    render(<EditSavedFilter {...baseProps} />)
    expect(screen.getByTestId('exploration-filters')).toBeInTheDocument()
  })

  it('affiche le champ du nom du filtre pré-rempli', () => {
    render(<EditSavedFilter {...baseProps} />)
    // le formulaire est initialisé avec le nom du filtre
    expect(screen.getByDisplayValue('Mon filtre')).toBeInTheDocument()
  })

  it('ne rend pas la modale quand open est false', () => {
    render(<EditSavedFilter {...baseProps} open={false} />)
    expect(screen.queryByTestId('exploration-filters')).not.toBeInTheDocument()
  })
})
