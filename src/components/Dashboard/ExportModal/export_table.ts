import { ResourceType } from 'types/requestCriterias'

export type label =
  | 'person'
  | 'iris'
  | 'visit_occurrence'
  | 'visit_detail'
  | 'condition_occurrence'
  | 'procedure_occurrence'
  | 'cost'
  | 'note'
  | 'drug_exposure_prescription'
  | 'drug_exposure_administration'
  | 'measurement'
  | 'care_site - fact_relationship'
  | 'imaging_study - imaging_series'
  | 'questionnaireresponse'

export type ExportTableType = {
  id: string[]
  name: string
  label: label
  resourceType: ResourceType
  compatibleResourceTypes: label[]
}

const exportTable: ExportTableType[] = [
  {
    id: ['person'],
    name: 'Patient',
    label: 'person',
    resourceType: ResourceType.PATIENT,
    compatibleResourceTypes: [
      'person',
      'visit_occurrence',
      'condition_occurrence',
      'procedure_occurrence',
      'cost',
      'note',
      'drug_exposure_prescription',
      'drug_exposure_administration',
      'measurement',
      'imaging_study - imaging_series',
      'questionnaireresponse'
    ]
  },
  {
    id: ['iris'],
    name: 'Zone géographique',
    label: 'iris',
    resourceType: ResourceType.UNKNOWN,
    compatibleResourceTypes: []
  },
  {
    id: ['visit_occurrence'],
    name: 'Prise en charge',
    label: 'visit_occurrence',
    resourceType: ResourceType.ENCOUNTER,
    compatibleResourceTypes: [
      'visit_occurrence',
      'person',
      'condition_occurrence',
      'procedure_occurrence',
      'cost',
      'note',
      'drug_exposure_prescription',
      'drug_exposure_administration',
      'measurement',
      'imaging_study - imaging_series',
      'questionnaireresponse'
    ]
  },
  {
    id: ['visit_detail'],
    name: 'Détail de prise en charge',
    label: 'visit_detail',
    resourceType: ResourceType.ENCOUNTER,
    compatibleResourceTypes: []
  },
  {
    id: ['condition_occurrence'],
    name: 'Fait - PMSI - Diagnostics',
    label: 'condition_occurrence',
    resourceType: ResourceType.CONDITION,
    compatibleResourceTypes: ['condition_occurrence', 'person', 'visit_occurrence']
  },
  {
    id: ['procedure_occurrence'],
    name: 'Fait - PMSI - Actes',
    label: 'procedure_occurrence',
    resourceType: ResourceType.PROCEDURE,
    compatibleResourceTypes: ['procedure_occurrence', 'person', 'visit_occurrence']
  },
  {
    id: ['cost'],
    name: 'Fait - PMSI - GHM',
    label: 'cost',
    resourceType: ResourceType.CLAIM,
    compatibleResourceTypes: ['cost', 'person', 'visit_occurrence']
  },
  {
    id: ['note'],
    name: 'Fait - Documents cliniques',
    label: 'note',
    resourceType: ResourceType.DOCUMENTS,
    compatibleResourceTypes: ['note', 'person', 'visit_occurrence']
  },
  {
    id: ['drug_exposure_prescription'],
    name: 'Fait - Médicaments - Prescription',
    label: 'drug_exposure_prescription',
    resourceType: ResourceType.MEDICATION_REQUEST,
    compatibleResourceTypes: ['drug_exposure_prescription', 'person', 'visit_occurrence']
  },
  {
    id: ['drug_exposure_administration'],
    name: 'Fait - Médicaments - Administration',
    label: 'drug_exposure_administration',
    resourceType: ResourceType.MEDICATION_ADMINISTRATION,
    compatibleResourceTypes: ['drug_exposure_administration', 'person', 'visit_occurrence']
  },
  {
    id: ['measurement'],
    name: 'Fait - Biologie',
    label: 'measurement',
    resourceType: ResourceType.OBSERVATION,
    compatibleResourceTypes: ['measurement', 'person', 'visit_occurrence']
  },
  {
    id: ['care_site', 'fact_relationship'],
    name: 'Référentiel - Structure hospitalière',
    label: 'care_site - fact_relationship',
    resourceType: ResourceType.UNKNOWN,
    compatibleResourceTypes: []
  },
  {
    id: ['imaging_study', 'imaging_series'],
    name: 'Fait - Imagerie - Étude & Séries',
    label: 'imaging_study - imaging_series',
    resourceType: ResourceType.IMAGING,
    compatibleResourceTypes: ['imaging_study - imaging_series', 'person', 'visit_occurrence']
  },
  {
    id: ['questionnaireresponse'],
    name: 'Formulaires',
    label: 'questionnaireresponse',
    resourceType: ResourceType.QUESTIONNAIRE_RESPONSE,
    compatibleResourceTypes: ['questionnaireresponse', 'person', 'visit_occurrence']
  }
]

export default exportTable
