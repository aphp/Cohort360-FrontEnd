import { CriteriaGroup, CriteriaGroupType } from 'types'
import { Comparators } from 'types/requestCriterias'

export const hasOptions = (
  group?: CriteriaGroup
): group is Extract<CriteriaGroup, { type: CriteriaGroupType.N_AMONG_M }> =>
  !!group && group.type === CriteriaGroupType.N_AMONG_M && !!group.options

export const getOptionsForGroupType = (groupType: CriteriaGroupType) => {
  const restOptions = { number: 1, timeDelayMin: 0, timeDelayMax: 0 }
  switch (groupType) {
    case CriteriaGroupType.AT_LEAST:
      return {
        type: CriteriaGroupType.N_AMONG_M,
        options: { operator: Comparators.GREATER_OR_EQUAL, ...restOptions }
      }
    case CriteriaGroupType.AT_MOST:
      return {
        type: CriteriaGroupType.N_AMONG_M,
        options: { operator: Comparators.GREATER, ...restOptions }
      }
    case CriteriaGroupType.EXACTLY:
      return {
        type: CriteriaGroupType.N_AMONG_M,
        options: { operator: Comparators.EQUAL, ...restOptions }
      }
    case CriteriaGroupType.OR_GROUP:
      return {
        type: CriteriaGroupType.OR_GROUP
      }
    default:
      return {
        type: CriteriaGroupType.AND_GROUP
      }
  }
}
