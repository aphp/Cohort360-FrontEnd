import { ResourceType } from 'types/requestCriterias'

export type ExportTableType = {
  id: string[]
  name: string
  label: string
  subtitle?: string
  resourceType: ResourceType
}

const exportTable: ExportTableType[] = [
  {
    id: ['person'],
    name: 'Patient',
    label: 'person',
    resourceType: ResourceType.PATIENT
  },
  {
    id: ['iris'],
    name: 'Zone géographique',
    label: 'iris',
    resourceType: ResourceType.UNKNOWN
  },
  {
    id: ['visit_occurrence'],
    name: 'Prise en charge',
    label: 'visit_occurrence',
    resourceType: ResourceType.UNKNOWN
  },
  {
    id: ['visit_detail'],
    name: 'Détail de prise en charge',
    label: 'visit_detail',
    resourceType: ResourceType.UNKNOWN
  },
  {
    id: ['condition_occurrence'],
    name: 'Fait - PMSI - Diagnostics',
    label: 'condition_occurrence',
    resourceType: ResourceType.CONDITION
  },
  {
    id: ['procedure_occurrence'],
    name: 'Fait - PMSI - Actes',
    label: 'procedure_occurrence',
    resourceType: ResourceType.PROCEDURE
  },
  {
    id: ['cost'],
    name: 'Fait - PMSI - GHM',
    label: 'cost',
    resourceType: ResourceType.CLAIM
  },
  // {
  //   id: ['note'],
  //   name: 'Fait - Documents cliniques',
  //   label: 'note',
  //   resourceType: ResourceType.DOCUMENTS
  // },
  {
    id: ['drug_exposure_prescription'],
    name: 'Fait - Médicaments - Prescription',
    label: 'drug_exposure_prescription',
    resourceType: ResourceType.MEDICATION_REQUEST
  },
  {
    id: ['drug_exposure_administration'],
    name: 'Fait - Médicaments - Administration',
    label: 'drug_exposure_administration',
    resourceType: ResourceType.MEDICATION_ADMINISTRATION
  },
  {
    id: ['care_site', 'fact_relationship'],
    name: 'Référentiel - Structure hospitalière',
    label: 'care_site - fact_relationship',
    resourceType: ResourceType.UNKNOWN
  },
  {
    id: ['imaging_study', 'imaging_series'],
    name: 'Fait - Imagerie - Étude & Séries',
    label: 'imaging_study - imaging_series',
    resourceType: ResourceType.IMAGING
  },
  {
    id: [
      'questionnaire',
      'questionnaire__item',
      'questionnaireresponse',
      'questionnaireresponse__item',
      'questionnaireresponse__item__answer'
    ],
    name: 'Formulaires',
    label:
      'questionnaire - questionnaire__item - questionnaireresponse - questionnaireresponse__item - questionnaireresponse__item__answer',
    resourceType: ResourceType.UNKNOWN
  }
]

export default exportTable
