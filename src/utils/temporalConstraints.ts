import { CriteriaGroupType } from 'types'
import { RessourceType, SelectedCriteriaType } from 'types/requestCriterias'

// function used to get AND groups that contain AT LEAST 2 criteria that are not of type IPP or Patient
export const getSelectableGroups = (
  selectedCriteria: SelectedCriteriaType[],
  criteriaGroups: CriteriaGroupType[],
  isEpisode?: boolean
) => {
  const selectableCriteria = selectedCriteria
    .filter(({ type }) =>
      isEpisode
        ? type === RessourceType.PREGNANCY || type === RessourceType.HOSPIT
        : type !== RessourceType.IPP_LIST && type !== RessourceType.PATIENT
    )
    .map((criteria) => criteria.id)
  const andGroupsWithSelectableCriteria = criteriaGroups
    .filter(({ type }) => type === 'andGroup')
    .map((group) => {
      return { ...group, criteriaIds: group.criteriaIds.filter((id) => selectableCriteria.includes(id)) }
    })
  const selectableGroups = andGroupsWithSelectableCriteria.filter((group) => group.criteriaIds.length >= 2)

  return selectableGroups
}
