import { MedicationAdministration, MedicationRequest } from 'fhir/r4'
import { CohortMedication } from 'types'
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

export const getMedicationDate = (
  type: ResourceType.MEDICATION_ADMINISTRATION | ResourceType.MEDICATION_REQUEST,
  item: MedicationAdministration | MedicationRequest
) => {
  const dateMapper = {
    [ResourceType.MEDICATION_REQUEST]: (item as MedicationRequest).dispenseRequest?.validityPeriod?.start,
    [ResourceType.MEDICATION_ADMINISTRATION]: (item as MedicationAdministration).effectivePeriod?.start
  }
  return dateMapper[type]
}

export const getCodes = (
  item: CohortMedication<MedicationRequest | MedicationAdministration>,
  codeSystem: string,
  altCodeSystemRegex?: string
): [string, string, boolean, string | undefined] => {
  const standardCoding = item.medicationCodeableConcept?.coding?.find(
    (code) => code.userSelected && code.system === codeSystem
  )
  const coding =
    standardCoding ||
    item.medicationCodeableConcept?.coding?.find((code) => altCodeSystemRegex && code.system?.match(altCodeSystemRegex))

  return [
    coding?.code ? coding.code : 'Non Renseigné',
    coding?.display ? coding.display : 'Non Renseigné',
    !!standardCoding,
    coding?.system
  ]
}
