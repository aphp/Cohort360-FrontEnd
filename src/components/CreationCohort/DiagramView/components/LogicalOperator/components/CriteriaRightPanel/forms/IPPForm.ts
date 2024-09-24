import { CriteriaType, IppParamsKeys, ResourceType } from 'types/requestCriterias'
import { CommonCriteriaData, CriteriaForm } from '../CriteriaForm/types'

export type IPPListDataType = CommonCriteriaData & {
  type: CriteriaType.IPP_LIST
  search: string
}

export const form: () => CriteriaForm<IPPListDataType> = () => ({
  label: "Liste d'IPP",
  initialData: {
    type: CriteriaType.IPP_LIST,
    title: "Liste d'IPP",
    isInclusive: true,
    encounterService: null,
    search: ''
  },
  buildInfo: {
    criteriaType: CriteriaType.IPP_LIST,
    resourceType: ResourceType.IPP_LIST // TODO should be ResourceType.PATIENT
  },
  errorMessages: {},
  itemSections: [
    {
      items: [
        {
          valueKey: 'search',
          type: 'textWithRegex',
          label: "Recherche par uid d'étude",
          regex: '(?:^|\\D+)?(8\\d{9})(?:$|\\D+)',
          placeholder: "Ajouter une liste d'IPP",
          extractValidValues: true,
          multiline: true,
          buildInfo: {
            fhirKey: IppParamsKeys.IPP_LIST_FHIR,
            chipDisplayMethod: 'idListLabel',
            chipDisplayMethodExtraArgs: [{ type: 'string', value: 'patient' }]
          }
        }
      ]
    }
  ]
})
