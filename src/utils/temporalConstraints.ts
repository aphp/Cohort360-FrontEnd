import { CriteriaGroup, CriteriaGroupType } from 'types'
import { CriteriaType, SelectedCriteriaType } from 'types/requestCriterias'

// function used to get AND groups that contain AT LEAST 2 criteria that are not of type IPP or Patient
export const getSelectableGroups = (
  selectedCriteria: SelectedCriteriaType[],
  criteriaGroups: CriteriaGroup[],
  isEpisode?: boolean
) => {
  const selectableCriteria = selectedCriteria
    .filter(({ type }) =>
      isEpisode
        ? type === CriteriaType.PREGNANCY || type === CriteriaType.HOSPIT
        : type !== CriteriaType.IPP_LIST && type !== CriteriaType.PATIENT
    )
    .map((criteria) => criteria.id)
  const andGroupsWithSelectableCriteria = criteriaGroups
    .filter(({ type }) => type === CriteriaGroupType.AND_GROUP)
    .map((group) => {
      return { ...group, criteriaIds: group.criteriaIds.filter((id) => selectableCriteria.includes(id)) }
    })
  const selectableGroups = andGroupsWithSelectableCriteria.filter((group) => group.criteriaIds.length >= 2)

  return selectableGroups
}
