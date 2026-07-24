import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { CriteriaGroupType } from 'types'

const state = {
  cohortCreation: {
    request: {
      criteriaGroup: [
        { id: 0, title: 'root', type: CriteriaGroupType.AND_GROUP, criteriaIds: [1, 2, 3], isInclusive: true }
      ],
      selectedCriteria: [
        { id: 1, type: 'Condition', title: 'Diagnostic' },
        { id: 2, type: 'Procedure', title: 'Acte' },
        { id: 3, type: 'Patient', title: 'Patient' }
      ]
    }
  }
}

vi.mock('state', () => ({
  useAppSelector: (selector: (s: unknown) => unknown) => selector(state)
}))

import TemporalConstraintConfig from 'components/CreationCohort/DiagramView/components/TemporalConstraintCard/components/TemporalConstraintConfig/TemporalConstraintConfig'

beforeEach(() => {
  vi.clearAllMocks()
})

describe('TemporalConstraintConfig', () => {
  it('se rend avec la liste de critères sélectionnables', () => {
    const { container } = render(
      <TemporalConstraintConfig newConstraintsList={[]} onChangeNewConstraintsList={vi.fn()} />
    )
    expect(container.firstChild).toBeInTheDocument()
    expect(screen.getByText(/s'est produit avant/)).toBeInTheDocument()
  })

  it('affiche la section d’intervalle temporel', () => {
    render(<TemporalConstraintConfig newConstraintsList={[]} onChangeNewConstraintsList={vi.fn()} />)
    expect(screen.getByText(/dans un intervalle/)).toBeInTheDocument()
  })

  it('rend des sélecteurs (comboboxes)', () => {
    render(<TemporalConstraintConfig newConstraintsList={[]} onChangeNewConstraintsList={vi.fn()} />)
    expect(screen.getAllByRole('combobox').length).toBeGreaterThan(0)
  })

  it('gère une contrainte existante dans newConstraintsList', () => {
    const { container } = render(
      <TemporalConstraintConfig
        newConstraintsList={[{ idList: [1, 2], constraintType: 'directChronologicalOrdering' } as never]}
        onChangeNewConstraintsList={vi.fn()}
      />
    )
    expect(container.firstChild).toBeInTheDocument()
  })
})
