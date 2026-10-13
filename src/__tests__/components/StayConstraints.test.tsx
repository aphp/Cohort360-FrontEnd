import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { CriteriaGroupType } from 'types'
import { CriteriaType } from 'types/requestCriterias'

const state = {
  cohortCreation: {
    request: {
      criteriaGroup: [
        { id: 0, title: 'Groupe principal', type: CriteriaGroupType.AND_GROUP, criteriaIds: [1, 2], isInclusive: true }
      ],
      selectedCriteria: [
        { id: 1, type: CriteriaType.CONDITION, title: 'Diagnostic' },
        { id: 2, type: CriteriaType.OBSERVATION, title: 'Biologie' }
      ]
    }
  }
}

vi.mock('state', () => ({
  useAppSelector: (selector: (s: unknown) => unknown) => selector(state)
}))

import StayConstraints from 'components/CreationCohort/DiagramView/components/TemporalConstraintCard/components/TemporalConstraintModal/StayConstraints'

describe('StayConstraints', () => {
  it("affiche l'info-bulle des contraintes sur les séjours au survol de l'icône", async () => {
    render(<StayConstraints constraints={[]} onChangeConstraints={vi.fn()} />)
    expect(screen.getByText('Contraintes sur les séjours')).toBeInTheDocument()
    fireEvent.mouseOver(screen.getByTestId('InfoIcon'))
    expect(
      await screen.findByText(
        "Les contraintes sur les séjours ne s'appliquent pas aux critères de type : Démographie, Liste d'IPP, Biologie"
      )
    ).toBeInTheDocument()
  })
})
