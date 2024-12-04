import { Comparators, CriteriaType, PatientsParamsKeys, ResourceType } from 'types/requestCriterias'
import { CommonCriteriaData, CriteriaForm, NewDurationRangeType } from '../CriteriaForm/types'
import { VitalStatusOptionsLabel } from 'types/searchCriterias'
import { getConfig } from 'config'

export type DemographicDataType = CommonCriteriaData & {
  type: CriteriaType.PATIENT
  genders: string[] | null
  vitalStatus: string[] | null
  age: NewDurationRangeType | null
  birthdates: NewDurationRangeType | null
  deathDates: NewDurationRangeType | null
}

export const form: () => CriteriaForm<DemographicDataType> = () => ({
  label: 'démographique',
  title: 'Démographie patient',
  initialData: {
    type: CriteriaType.PATIENT,
    title: 'Critère démographique',
    isInclusive: true,
    occurrence: { value: 1, comparator: Comparators.GREATER_OR_EQUAL },
    encounterService: null,
    startOccurrence: null,
    encounterStartDate: null,
    encounterEndDate: null,
    encounterStatus: [],
    genders: null,
    vitalStatus: null,
    age: null,
    birthdates: null,
    deathDates: null
  },
  infoAlert: ['Tous les éléments des champs multiples sont liés par une contrainte OU'],
  buildInfo: {
    type: { [ResourceType.PATIENT]: CriteriaType.PATIENT },
    defaultFilter: 'active=true'
  },
  itemSections: [
    {
      items: [
        {
          valueKey: 'genders',
          type: 'autocomplete',
          label: 'Genre',
          valueSetId: getConfig().core.valueSets.demographicGender.url,
          noOptionsText: 'Veuillez entrer un genre',
          buildInfo: {
            fhirKey: PatientsParamsKeys.GENDERS
          }
        },
        {
          valueKey: 'vitalStatus',
          type: 'autocomplete',
          label: 'Statut vital',
          valueSetId: 'vitalStatus',
          valueSetData: [
            {
              id: 'true',
              label: 'Patients Vivants'
            },
            {
              id: 'false',
              label: 'Patient Décédés'
            }
          ],
          noOptionsText: 'Veuillez entrer un statut vital',
          buildInfo: {
            fhirKey: PatientsParamsKeys.VITAL_STATUS
          }
        },
        {
          valueKey: 'birthdates',
          type: 'calendarRange',
          extraLabel: () => 'Date de naissance',
          errorType: 'INCOHERENT_VALUE_ERROR',
          displayCondition: (data, context) => {
            return !context.deidentified
          },
          disableCondition: (data) => {
            const typedData = data as DemographicDataType
            return typedData.age !== null && (typedData.age.start !== null || typedData.age.end !== null)
          },
          buildInfo: {
            fhirKey: PatientsParamsKeys.BIRTHDATE,
            chipDisplayMethodExtraArgs: [{ type: 'string', value: 'Naissance' }]
          }
        },
        {
          valueKey: 'age',
          type: 'durationRange',
          extraLabel: (data) => {
            const typedData = data as DemographicDataType
            const vitalStatus = typedData.vitalStatus
            return vitalStatus && vitalStatus.length === 1 && vitalStatus.find((status) => status === 'false')
              ? VitalStatusOptionsLabel.deceasedAge
              : VitalStatusOptionsLabel.age
          },
          disableCondition: (data) => {
            const typedData = data as DemographicDataType
            console.log(
              'disabled',
              typedData.birthdates !== null &&
                (typedData.birthdates.start !== null || typedData.birthdates.end !== null)
            )
            return (
              typedData.birthdates !== null &&
              (typedData.birthdates.start !== null || typedData.birthdates.end !== null)
            )
          },
          buildInfo: {
            // TODO there is orignially a condition where
            // criterion.birthdates[0] === null && criterion.birthdates[1] === null
            // must be true for the filter to be applied
            // check if this is still necessary (cause the durationRange / calendarRange set the value to null when inner fields are null now)
            fhirKey: { main: PatientsParamsKeys.DATE_IDENTIFIED, deid: PatientsParamsKeys.DATE_DEIDENTIFIED },
            chipDisplayMethodExtraArgs: [{ type: 'string', value: 'Âge' }]
          }
        },
        {
          valueKey: 'deathDates',
          type: 'calendarRange',
          extraLabel: () => 'Date de décès',
          errorType: 'INCOHERENT_VALUE_ERROR',
          displayCondition: (data, context) => {
            const typedData = data as DemographicDataType
            const vitalStatus = typedData.vitalStatus
            return (
              !context.deidentified &&
              (vitalStatus === null ||
                vitalStatus.length === 0 ||
                (vitalStatus.length === 1 && !!vitalStatus.find((status) => status === 'false')))
            )
          },
          buildInfo: {
            fhirKey: PatientsParamsKeys.DEATHDATE,
            chipDisplayMethodExtraArgs: [{ type: 'string', value: 'Décès' }],
            ignoreIf: (data) => {
              const typedData = data as DemographicDataType
              const vitalStatus = typedData.vitalStatus
              return (
                vitalStatus !== null && vitalStatus.length === 1 && !!vitalStatus.find((status) => status === 'true')
              )
            }
          }
        }
      ]
    }
  ]
})
