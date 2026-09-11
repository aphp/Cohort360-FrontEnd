import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { CriteriaGroupType, TemporalConstraintsKind } from 'types'
import { CriteriaType } from 'types/requestCriterias'

// Le composant lit criteriaGroup/selectedCriteria depuis le store; on mocke state.
const state = {
  cohortCreation: {
    request: {
      criteriaGroup: [
        { id: 0, title: 'Groupe principal', type: CriteriaGroupType.AND_GROUP, criteriaIds: [1, 2], isInclusive: true }
      ],
      selectedCriteria: [
        { id: 1, type: CriteriaType.CONDITION, title: 'Diagnostic' },
        { id: 2, type: CriteriaType.PROCEDURE, title: 'Acte' }
      ]
    }
  }
}

vi.mock('state', () => ({
  useAppSelector: (selector: (s: unknown) => unknown) => selector(state)
}))

import PartialConstraintLayout from 'components/ui/PartialConstraintLayout'

const baseData = {
  title: 'Même séjour',
  constraints: [],
  selectableGroups: [
    { id: 0, title: 'Groupe principal', type: CriteriaGroupType.AND_GROUP, criteriaIds: [1, 2], isInclusive: true }
  ]
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('ui/PartialConstraintLayout', () => {
  it('affiche l’icône d’ajout quand aucune contrainte', () => {
    render(
      <PartialConstraintLayout
        data={baseData as never}
        actions={{ onConfirm: vi.fn(), onDelete: vi.fn() }}
      />
    )
    expect(screen.getByTestId('AddCircleIcon')).toBeInTheDocument()
  })

  it('affiche les contraintes existantes (SAME_ENCOUNTER) et permet la suppression', () => {
    const onDelete = vi.fn()
    const data = {
      ...baseData,
      constraints: [{ idList: [1, 2], constraintType: TemporalConstraintsKind.SAME_ENCOUNTER }]
    }
    render(
      <PartialConstraintLayout data={data as never} actions={{ onConfirm: vi.fn(), onDelete }} />
    )
    // les critères de la contrainte sont affichés par leur titre
    expect(screen.getByText(/Diagnostic/)).toBeInTheDocument()
    fireEvent.click(screen.getByTestId('DeleteIcon'))
    expect(onDelete).toHaveBeenCalled()
  })

  it('ouvre la carte d’ajout au clic sur l’icône et propose Annuler/Valider', () => {
    render(
      <PartialConstraintLayout data={baseData as never} actions={{ onConfirm: vi.fn(), onDelete: vi.fn() }} />
    )
    fireEvent.click(screen.getByTestId('AddCircleIcon'))
    expect(screen.getByText('Valider')).toBeInTheDocument()
    expect(screen.getByText('Annuler')).toBeInTheDocument()
    // Valider est désactivé tant que < 2 critères sélectionnés
    expect(screen.getByText('Valider').closest('button')).toBeDisabled()
  })

  it('annule l’ajout et réaffiche l’icône', () => {
    render(
      <PartialConstraintLayout data={baseData as never} actions={{ onConfirm: vi.fn(), onDelete: vi.fn() }} />
    )
    fireEvent.click(screen.getByTestId('AddCircleIcon'))
    fireEvent.click(screen.getByText('Annuler'))
    expect(screen.getByTestId('AddCircleIcon')).toBeInTheDocument()
  })

  it('filtre les contraintes SAME_EPISODE_OF_CARE en mode épisode', () => {
    const data = {
      ...baseData,
      constraints: [{ idList: [1, 2], constraintType: TemporalConstraintsKind.SAME_EPISODE_OF_CARE }]
    }
    render(
      <PartialConstraintLayout isEpisode data={data as never} actions={{ onConfirm: vi.fn(), onDelete: vi.fn() }} />
    )
    expect(screen.getByText(/Diagnostic/)).toBeInTheDocument()
  })
})
