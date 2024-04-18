import { ResourceType } from 'types/requestCriterias'

export type ExportTableType = {
  id: string
  name: string
  label: string
  subtitle?: string
  resourceType: ResourceType
}

const exportTable: ExportTableType[] = [
  {
    id: 'person',
    name: 'Patient',
    label: 'person',
    resourceType: ResourceType.PATIENT
  },
  // {
  //   id: 'observation',
  //   name: 'Patient - Données démographiques',
  //   label: 'observation',
  //   subtitle: '⚠️ Attention cette table comporte des données identifiantes'
  // },
  {
    id: 'iris',
    name: 'Patient - Données géographiques',
    label: 'iris',
    resourceType: ResourceType.UNKNOWN
  },
  {
    id: 'visit_occurrence',
    name: 'Prise en charge',
    label: 'visit_occurrence',
    resourceType: ResourceType.UNKNOWN
  },
  {
    id: 'visit_detail',
    name: 'Prise en charge - Passages ',
    label: 'visit_detail',
    resourceType: ResourceType.UNKNOWN
  },
  {
    id: 'condition_occurrence',
    name: 'Fait - PMSI - Diagnostics',
    label: 'condition_occurrence',
    resourceType: ResourceType.CONDITION
  },
  {
    id: 'procedure_occurrence',
    name: 'Fait - PMSI - Actes',
    label: 'procedure_occurrence',
    resourceType: ResourceType.PROCEDURE
  },
  {
    id: 'cost',
    name: 'Fait - PMSI - GHM',
    label: 'cost',
    resourceType: ResourceType.CLAIM
  },
  // {
  //   id: 'note',
  //   table_name: 'Fait - Documents cliniques',
  //   table_id: 'note',
  //   resourceType: 'DocumentReference'
  // },
  {
    id: 'drug_exposure_prescription',
    name: 'Fait - Médicaments - Prescription',
    label: 'drug_exposure_prescription',
    resourceType: ResourceType.MEDICATION_REQUEST
  },
  {
    id: 'drug_exposure_administration',
    name: 'Fait - Médicaments - Administration',
    label: 'drug_exposure_administration',
    resourceType: ResourceType.MEDICATION_ADMINISTRATION
  },
  {
    id: 'care_site',
    name: 'Référentiel - Structure hospitalière',
    label: 'care_site',
    resourceType: ResourceType.UNKNOWN
  },
  {
    id: 'care_site',
    name: 'Référentiel - Liens entre entités',
    label: 'fact_relationship',
    resourceType: ResourceType.UNKNOWN
  },
  {
    id: 'concept',
    name: 'Référentiel - Terminologie - Concept',
    label: 'concept',
    // resourceType: 'CodableConcept'
    resourceType: ResourceType.UNKNOWN
  },
  {
    id: 'concept',
    name: 'Référentiel - Terminologie - Lien entre concepts',
    label: 'concept_relationship',
    // resourceType: 'CodableConcept'
    resourceType: ResourceType.UNKNOWN
  },
  {
    id: 'vocabulary',
    name: 'Référentiel - Terminologie - Vocabulaire et nomenclature',
    label: 'vocabulary',
    // resourceType: 'ValueSet'
    resourceType: ResourceType.UNKNOWN
  },
  {
    id: 'imaging_study',
    name: 'Fait - Imagerie - Étude',
    label: 'imaging_study',
    // resourceType: 'ImagingStudies'
    resourceType: ResourceType.UNKNOWN
  },
  {
    id: 'imaging_series',
    name: 'Fait - Imagerie - Série',
    label: 'imaging_series',
    // resourceType: 'ImagingSeries'
    resourceType: ResourceType.UNKNOWN
  },
  // ---------------------------------
  {
    id: 'questionnaire',
    name: 'Formulaires',
    label: 'questionnaire',
    resourceType: ResourceType.UNKNOWN
  },
  {
    id: 'questionnaire__item',
    // name: 'Champs des formulaires',
    name: 'Formulaires',
    label: 'questionnaire__item',
    resourceType: ResourceType.UNKNOWN
  },
  {
    id: 'questionnaireresponse',
    // name: 'Réponses aux formulaires',
    name: 'Formulaires',
    label: 'questionnaireresponse',
    resourceType: ResourceType.UNKNOWN
  },
  {
    id: 'questionnaireresponse__item',
    // name: 'Champs de réponses aux formulaires',
    name: 'Formulaires',
    label: 'questionnaireresponse__item',
    resourceType: ResourceType.UNKNOWN
  },
  {
    id: 'questionnaireresponse__item__answer',
    // name: 'Valeurs de réponses aux formulaires',
    name: 'Formulaires',
    label: 'questionnaireresponse__item__answer',
    resourceType: ResourceType.UNKNOWN
  }
]

export default exportTable
