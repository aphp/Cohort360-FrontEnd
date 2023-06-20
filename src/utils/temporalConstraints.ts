import { CriteriaGroupType } from 'types'
import { SelectedCriteriaType } from 'types/requestCriterias'

// function used to get AND groups that contain AT LEAST 2 criteria that are not of type IPP or Patient
export const getSelectableGroups = (selectedCriteria: SelectedCriteriaType[], criteriaGroups: CriteriaGroupType[]) => {
  const selectableCriteria = selectedCriteria
    .filter(({ type }) => type !== 'IPPList' && type !== 'Patient')
    .map((criteria) => criteria.id)
  const andGroupsWithSelectableCriteria = criteriaGroups
    .filter(({ type }) => type === 'andGroup')
    .map((group) => {
      return { ...group, criteriaIds: group.criteriaIds.filter((id) => selectableCriteria.includes(id)) }
    })
  const selectableGroups = andGroupsWithSelectableCriteria.filter((group) => group.criteriaIds.length >= 2)

  return selectableGroups
}
