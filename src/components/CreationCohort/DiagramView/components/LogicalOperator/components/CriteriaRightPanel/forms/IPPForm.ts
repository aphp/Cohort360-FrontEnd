import { CriteriaType, IppParamsKeys, ResourceType } from 'types/requestCriterias'
import { plural } from 'utils/string'
import { CommonCriteriaData, CriteriaForm } from '../CriteriaForm/types'

export type IPPListDataType = CommonCriteriaData & {
  type: CriteriaType.IPP_LIST
  search: string
}

export const form: () => CriteriaForm<IPPListDataType> = () => ({
  label: "de liste d'IPP",
  title: "Liste d'IPP",
  initialData: {
    type: CriteriaType.IPP_LIST,
    title: "Liste d'IPP",
    isInclusive: true,
    encounterService: null,
    search: ''
  },
  buildInfo: {
    type: { [ResourceType.IPP_LIST]: CriteriaType.IPP_LIST } // TODO should be ResourceType.PATIENT
  },
  errorMessages: {
    AT_LEAST_ONE_IPP: 'Merci de renseigner au moins un IPP'
  },
  globalErrorCheck: (data) => {
    if (data.search && (data.search as string).length > 0) {
      return undefined
    }
    return 'AT_LEAST_ONE_IPP'
  },
  itemSections: [
    {
      items: [
        {
          valueKey: 'search',
          type: 'textWithRegex',
          regex: '(?:^|\\D+)?(8\\d{9})(?:$|\\D+)',
          placeholder: "Ajouter une liste d'IPP",
          extraInfo:
            "Un IPP est une chaîne de 10 chiffres commençant par un 8. Les IPP peuvent être séparés par n'importe quel symbole ou un retour à la ligne. Ils peuvent être saisis manuellement ou collés depuis une autre source.",
          extraLabel: () => "Liste d'IPP",
          displayCheckError: false,
          extractValidValues: true,
          displayValueSummary: (value) => {
            const ippList = (value as string)
              .trim()
              .split(',')
              .filter((ipp) => ipp.length > 0)
            return `${ippList.length} IPP détecté${plural(ippList.length)}.`
          },
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
