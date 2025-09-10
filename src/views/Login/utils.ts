import services from 'services/aphp'
import { CustomError } from 'types'
import { ScopeElement } from 'types/scope'
import { isCustomError } from 'utils/perimeters'

export const updatePerimeters = async (
  onSuccess: (
    nominativeGroupsIds: string[],
    topLevelCareSites: string[],
    practitionerPerimeters: ScopeElement[]
  ) => void,

  onError: (error: CustomError) => void = () => {}
): Promise<void> => {
  const practitionerPerimeters = await services.perimeters.getRights({})

  if (isCustomError(practitionerPerimeters)) {
    onError(practitionerPerimeters)
  } else {
    const nominativeGroupsIds = practitionerPerimeters.results
      .filter((perimeterItem) => perimeterItem.rights?.read_access === 'DATA_NOMINATIVE')
      .map((practitionerPerimeter) => practitionerPerimeter.cohort_id)
      .filter((item) => item)

    const topLevelCareSites = practitionerPerimeters.results.map((perimeterItem) => perimeterItem.cohort_id)

    onSuccess(nominativeGroupsIds, topLevelCareSites, practitionerPerimeters.results)
  }
}
