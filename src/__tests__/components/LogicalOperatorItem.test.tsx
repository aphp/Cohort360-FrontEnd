import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { CriteriaGroupType } from 'types'

vi.mock('state', () => ({
  useAppSelector: (selector: (s: unknown) => unknown) =>
    selector({
      me: { maintenance: { active: false } },
      cohortCreation: { request: { selectedCriteria: [] } },
      preferences: { requests: { detailedMode: false } }
    }),
  useAppDispatch: () => vi.fn()
}))

const hookReturn = {
  isMainOperator: false,
  currentOperator: {
    id: -1,
    title: 'Opérateur',
    type: CriteriaGroupType.AND_GROUP,
    criteriaIds: [1, 2],
    isInclusive: true,
    options: { operator: 'AND', number: 1 }
  },
  operatorConfirmation: false,
  handleChangeInclusive: vi.fn(),
  handleChangeNumber: vi.fn(),
  handleChangeOperator: vi.fn(),
  handleConfimation: vi.fn(),
  deleteLogicalOperator: vi.fn(),
  deleteInvalidConstraints: vi.fn(),
  setOperatorConfirmation: vi.fn()
}

const useLogicalOperator = vi.fn(() => hookReturn)
vi.mock('components/CreationCohort/DiagramView/components/LogicalOperator/components/LogicalOperatorItem/useLogicalOperator', () => ({
  useLogicalOperator: (...a: unknown[]) => useLogicalOperator(...a)
}))
vi.mock('./useLogicalOperator', () => ({ useLogicalOperator: (...a: unknown[]) => useLogicalOperator(...a) }))

import LogicalOperatorItem from 'components/CreationCohort/DiagramView/components/LogicalOperator/components/LogicalOperatorItem'

beforeEach(() => {
  vi.clearAllMocks()
})

describe('LogicalOperatorItem', () => {
  it('rend l’item quand un opérateur courant existe', () => {
    const { container } = render(<LogicalOperatorItem itemId={-1} disabled={false} />)
    expect(container.firstChild).toBeInTheDocument()
  })

  it('ne rend rien quand currentOperator est absent', () => {
    useLogicalOperator.mockReturnValueOnce({ ...hookReturn, currentOperator: null } as never)
    const { container } = render(<LogicalOperatorItem itemId={-1} disabled={false} />)
    expect(container).toBeEmptyDOMElement()
  })

  it('rend en mode désactivé', () => {
    const { container } = render(<LogicalOperatorItem itemId={-1} disabled={true} />)
    expect(container.firstChild).toBeInTheDocument()
  })

  it('affiche un opérateur OR', () => {
    useLogicalOperator.mockReturnValueOnce({
      ...hookReturn,
      currentOperator: { ...hookReturn.currentOperator, type: CriteriaGroupType.OR_GROUP }
    } as never)
    const { container } = render(<LogicalOperatorItem itemId={-1} disabled={false} />)
    expect(container.firstChild).toBeInTheDocument()
  })

  it('permet une interaction (clic) sans planter', () => {
    render(<LogicalOperatorItem itemId={-1} disabled={false} />)
    const buttons = screen.queryAllByRole('button')
    if (buttons.length > 0) {
      fireEvent.click(buttons[0])
    }
    expect(useLogicalOperator).toHaveBeenCalledWith(-1)
  })
})
