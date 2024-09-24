import { Comparators, CriteriaType, PatientsParamsKeys, ResourceType } from 'types/requestCriterias'
import { CommonCriteriaData, CriteriaForm, NewDurationRangeType } from '../CriteriaForm/types'
import { LabelObject, VitalStatusOptionsLabel } from 'types/searchCriterias'
import { getConfig } from 'config'

export type DemographicDataType = CommonCriteriaData & {
  type: CriteriaType.PATIENT
  genders: LabelObject[] | null
  vitalStatus: LabelObject[] | null
  age: NewDurationRangeType | null
  birthdates: NewDurationRangeType | null
  deathDates: NewDurationRangeType | null
}

export const form: () => CriteriaForm<DemographicDataType> = () => ({
  label: 'Démographie patient',
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
  errorMessages: {
    INCOHERENT_VALUE_ERROR: 'La valeur minimale ne peut pas être supérieure à la valeur maximale.',
    INVALID_VALUE_ERROR: 'Veuillez entrer un nombre valide.',
    MISSING_VALUE_ERROR: 'Veuillez entrer 2 valeurs avec ce comparateur.',
    ADVANCED_INPUTS_ERROR: 'Erreur dans les options avancées.',
    NO_ERROR: ''
  },
  buildInfo: {
    criteriaType: CriteriaType.PATIENT,
    resourceType: ResourceType.PATIENT,
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
          label: 'Date de naissance',
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
            return vitalStatus &&
              vitalStatus.length === 1 &&
              vitalStatus.find((status: LabelObject) => status.id === 'false')
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
          label: 'Date de décès',
          errorType: 'INCOHERENT_VALUE_ERROR',
          displayCondition: (data, context) => {
            const typedData = data as DemographicDataType
            const vitalStatus = typedData.vitalStatus
            return (
              !context.deidentified &&
              (vitalStatus === null ||
                vitalStatus.length === 0 ||
                (vitalStatus.length === 1 && !!vitalStatus.find((status: LabelObject) => status.id === 'false')))
            )
          },
          buildInfo: {
            fhirKey: PatientsParamsKeys.DEATHDATE,
            chipDisplayMethodExtraArgs: [{ type: 'string', value: 'Décès' }]
          }
        }
      ]
    }
  ]
})
