import { ResourceType } from 'types/requestCriterias'
import { Order } from 'types/searchCriterias'

export const mapMedicationToOrderByCode = (
  code: Order,
  resourceType: ResourceType.MEDICATION_REQUEST | ResourceType.MEDICATION_ADMINISTRATION
) => {
  const dateName = {
    [ResourceType.MEDICATION_REQUEST]: Order.PERIOD_START,
    [ResourceType.MEDICATION_ADMINISTRATION]: Order.EFFECTIVE_TIME
  }

  return code === Order.PERIOD_START ? dateName[resourceType] : code
}
