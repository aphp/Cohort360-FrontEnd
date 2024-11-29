import { Comparators, CriteriaType, ImagingParamsKeys, ResourceType } from 'types/requestCriterias'
import {
  CommonCriteriaData,
  CriteriaForm,
  NewDurationRangeType,
  NumberAndComparatorDataType,
  WithEncounterDateDataType,
  WithEncounterStatusDataType
} from '../CriteriaForm/types'
import { LabelObject } from 'types/searchCriterias'
import { getConfig } from 'config'
import { SourceType } from 'types/scope'

export type ImagingDataType = CommonCriteriaData &
  WithEncounterDateDataType &
  WithEncounterStatusDataType & {
    type: CriteriaType.IMAGING
    occurrence: NumberAndComparatorDataType
    studyDate: NewDurationRangeType | null
    studyModalities: LabelObject[] | null
    studyDescription: string
    studyProcedure: string
    numberOfSeries: NumberAndComparatorDataType
    numberOfIns: NumberAndComparatorDataType
    withDocument: LabelObject[]
    daysOfDelay: string | null
    studyUid: string
    seriesDate: NewDurationRangeType | null
    seriesDescription: string
    seriesProtocol: string
    seriesModalities: LabelObject[] | null
    seriesUid: string
  }

export const form: () => CriteriaForm<ImagingDataType> = () => ({
  label: "Critère d'Imagerie",
  initialData: {
    title: "Critère d'Imagerie",
    type: CriteriaType.IMAGING,
    isInclusive: true,
    occurrence: {
      value: 1,
      comparator: Comparators.GREATER_OR_EQUAL
    },
    encounterService: null,
    encounterStatus: [],
    encounterStartDate: null,
    encounterEndDate: null,
    studyDate: null,
    studyModalities: [],
    studyDescription: '',
    studyProcedure: '',
    numberOfSeries: { value: 1, comparator: Comparators.GREATER_OR_EQUAL },
    numberOfIns: { value: 1, comparator: Comparators.GREATER_OR_EQUAL },
    withDocument: [{ id: 'NONE', label: 'Aucun' }],
    daysOfDelay: null,
    studyUid: '',
    seriesDate: null,
    seriesDescription: '',
    seriesProtocol: '',
    seriesModalities: [],
    seriesUid: ''
  },
  errorMessages: {
    INCOHERENT_AGE_ERROR: "Erreur de cohérence d'âge",
    SEARCHINPUT_ERROR: 'Erreur de saisie de recherche',
    UID_ERROR: 'Erreur de UID',
    ADVANCED_INPUTS_ERROR: "Erreur d'entrées avancées"
  },
  buildInfo: {
    criteriaType: CriteriaType.IMAGING,
    resourceType: ResourceType.IMAGING,
    defaultFilter: 'patient.active=true'
  },
  itemSections: [
    {
      items: [
        {
          valueKey: 'occurrence',
          type: 'numberAndComparator',
          label: "Nombre d'occurrences",
          buildInfo: {
            chipDisplayMethodExtraArgs: [{ type: 'string', value: "Nombre d'occurences" }]
          }
        },
        {
          valueKey: 'encounterStatus',
          type: 'autocomplete',
          label: 'Statut de la visite associée',
          valueSetId: getConfig().core.valueSets.encounterStatus.url,
          noOptionsText: 'Veuillez entrer un statut de visite associée',
          buildInfo: {
            fhirKey: ImagingParamsKeys.ENCOUNTER_STATUS,
            chipDisplayMethodExtraArgs: [{ type: 'string', value: 'Statut de la visite associée' }]
          }
        }
      ]
    },
    {
      title: 'Critères liés à une étude',
      info: "Une étude est un examen. Il s'agit, au sens DICOM, de l'ensemble des acquisitions réalisées durant la visite d'un patient et, s'il existe, le compte-rendu (SR) DICOM associé.",
      defaulCollapsed: true,
      items: [
        {
          valueKey: 'studyDate',
          type: 'calendarRange',
          label: "Date de l'étude",
          errorType: 'INCOHERENT_AGE_ERROR',
          buildInfo: {
            fhirKey: ImagingParamsKeys.DATE,
            chipDisplayMethodExtraArgs: [{ type: 'string', value: "Date de l'étude : " }]
          }
        },
        {
          valueKey: 'studyModalities',
          type: 'autocomplete',
          label: 'Modalités',
          valueSetId: getConfig().features.imaging.valueSets.imagingModalities.url,
          noOptionsText: 'Veuillez entrer des modalités',
          buildInfo: {
            fhirKey: ImagingParamsKeys.MODALITY,
            chipDisplayMethodExtraArgs: [{ type: 'string', value: "Modalités d'étude :" }]
          }
        },
        {
          valueKey: 'studyDescription',
          type: 'textWithCheck',
          label: 'Rechercher dans les descriptions',
          placeholder: 'Rechercher dans les descriptions',
          errorType: 'SEARCHINPUT_ERROR',
          buildInfo: {
            fhirKey: ImagingParamsKeys.STUDY_DESCRIPTION,
            chipDisplayMethodExtraArgs: [{ type: 'string', value: "Description de l'étude : " }]
          }
        },
        {
          valueKey: 'studyProcedure',
          type: 'textWithCheck',
          label: 'Rechercher dans les codes procédures',
          placeholder: 'Rechercher dans les codes procédures',
          errorType: 'SEARCHINPUT_ERROR',
          buildInfo: {
            fhirKey: ImagingParamsKeys.STUDY_PROCEDURE,
            chipDisplayMethodExtraArgs: [{ type: 'string', value: "Code procédure de l'étude : " }]
          }
        },
        {
          valueKey: 'numberOfSeries',
          type: 'numberAndComparator',
          label: 'Nombre de séries',
          buildInfo: {
            fhirKey: ImagingParamsKeys.NB_OF_SERIES,
            chipDisplayMethodExtraArgs: [{ type: 'string', value: 'Nombre de séries : ' }]
          }
        },
        {
          valueKey: 'numberOfIns',
          type: 'numberAndComparator',
          label: "Nombre d'instances",
          buildInfo: {
            fhirKey: ImagingParamsKeys.NB_OF_INS,
            chipDisplayMethodExtraArgs: [{ type: 'string', value: "Nombre d'instances : " }]
          }
        },
        {
          valueKey: 'withDocument',
          type: 'autocomplete',
          label: 'Méthode de rattachement à un document',
          valueSetId: 'documentAttachementMethod',
          singleChoice: true,
          valueSetData: getConfig().features.imaging.valueSets.documentAttachementMethod.data,
          noOptionsText: 'Veuillez entrer une méthode de rattachement',
          buildInfo: {
            fhirKey: ImagingParamsKeys.WITH_DOCUMENT,
            buildMethod: 'buildWithDocument',
            buildMethodExtraArgs: [{ type: 'reference', value: 'daysOfDelay' }],
            chipDisplayMethodExtraArgs: [{ type: 'reference', value: 'daysOfDelay' }]
          }
        },
        {
          valueKey: 'daysOfDelay',
          type: 'number',
          label: 'Plage de jours',
          errorType: 'INCOHERENT_AGE_ERROR',
          displayCondition: (data) => (data.withDocument as LabelObject[])?.at(0)?.id === 'INFERENCE_TEMPOREL'
        },
        {
          valueKey: 'studyUid',
          type: 'textWithRegex',
          label: "Recherche par uid d'étude",
          regex: '[^0-9.,]',
          inverseCheck: true,
          checkErrorMessage: 'Seuls les chiffres, points, ou les virgules sont autorisés.',
          placeholder: "Ajouter une liste d'uid séparés par des virgules",
          multiline: true,
          buildInfo: {
            fhirKey: ImagingParamsKeys.STUDY_UID,
            buildMethodExtraArgs: [
              { type: 'string', value: getConfig().features.imaging.extensions.imagingStudyUidUrl }
            ],
            chipDisplayMethod: 'idListLabel',
            chipDisplayMethodExtraArgs: [{ type: 'string', value: "uuid d'étude" }]
          }
        }
      ]
    },
    {
      title: 'Critères liés à une série',
      info: "Une série est une des acquisitions lors d'un examen.",
      defaulCollapsed: true,
      items: [
        {
          valueKey: 'seriesDate',
          type: 'calendarRange',
          label: 'Date de la série',
          errorType: 'INCOHERENT_AGE_ERROR',
          buildInfo: {
            fhirKey: ImagingParamsKeys.SERIES_DATE,
            chipDisplayMethodExtraArgs: [{ type: 'string', value: 'Date de la série : ' }]
          }
        },
        {
          valueKey: 'seriesDescription',
          type: 'textWithCheck',
          label: 'Rechercher dans les descriptions',
          placeholder: 'Rechercher dans les descriptions',
          errorType: 'SEARCHINPUT_ERROR',
          buildInfo: {
            fhirKey: ImagingParamsKeys.SERIES_DESCRIPTION,
            chipDisplayMethodExtraArgs: [{ type: 'string', value: 'Description de la série : ' }]
          }
        },
        {
          valueKey: 'seriesProtocol',
          type: 'textWithCheck',
          label: 'Rechercher dans les protocoles',
          placeholder: 'Rechercher dans les protocoles',
          errorType: 'SEARCHINPUT_ERROR',
          buildInfo: {
            fhirKey: ImagingParamsKeys.SERIES_PROTOCOL,
            chipDisplayMethodExtraArgs: [{ type: 'string', value: 'Protocole de la série : ' }]
          }
        },
        {
          valueKey: 'seriesModalities',
          type: 'autocomplete',
          label: 'Modalités',
          valueSetId: getConfig().features.imaging.valueSets.imagingModalities.url,
          noOptionsText: 'Veuillez entrer des modalités',
          buildInfo: {
            fhirKey: ImagingParamsKeys.SERIES_MODALITIES,
            chipDisplayMethodExtraArgs: [{ type: 'string', value: 'Modalités de la série : ' }]
          }
        },
        {
          valueKey: 'seriesUid',
          type: 'textWithRegex',
          label: 'Recherche par uid de série',
          regex: '[^0-9.,]',
          checkErrorMessage: 'Seuls les chiffres, points, ou les virgules sont autorisés.',
          placeholder: "Ajouter une liste d'uid séparés par des virgules",
          multiline: true,
          buildInfo: {
            fhirKey: ImagingParamsKeys.SERIES_UID,
            chipDisplayMethod: 'idListLabel',
            chipDisplayMethodExtraArgs: [{ type: 'string', value: 'uuid de série' }]
          }
        }
      ]
    },
    {
      title: 'Options avancées',
      defaulCollapsed: true,
      items: [
        {
          valueKey: 'encounterService',
          label: 'Unité exécutrice',
          type: 'executiveUnit',
          sourceType: SourceType.IMAGING,
          buildInfo: {
            fhirKey: ImagingParamsKeys.EXECUTIVE_UNITS
          }
        },
        {
          valueKey: 'encounterStartDate',
          type: 'calendarRange',
          errorType: 'ADVANCED_INPUTS_ERROR',
          label: 'Début de prise en charge',
          extraInfo: 'Ne concerne pas les consultations',
          labelAltStyle: true,
          extraLabel: () => 'Prise en charge',
          withOptionIncludeNull: true,
          buildInfo: {
            fhirKey: 'encounter.period-start',
            chipDisplayMethodExtraArgs: [{ type: 'string', value: 'Date de début de prise en charge' }]
          }
        },
        {
          valueKey: 'encounterEndDate',
          type: 'calendarRange',
          label: 'Fin de prise en charge',
          labelAltStyle: true,
          errorType: 'ADVANCED_INPUTS_ERROR',
          withOptionIncludeNull: true,
          buildInfo: {
            fhirKey: 'encounter.period-end',
            chipDisplayMethodExtraArgs: [{ type: 'string', value: 'Date de fin de prise en charge' }]
          }
        }
      ]
    }
  ]
})
