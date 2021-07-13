export type ExportTableType = {
  id: string
  table_name: string
  table_id: string
}

const exportTable: ExportTableType[] = [
  {
    id: 'care_site',
    table_name: 'Structures',
    table_id: 'care_site'
  },
  {
    id: 'cohort',
    table_name: 'Cohortes - cohort',
    table_id: 'cohort'
  },
  {
    id: 'cohort_definition',
    table_name: 'Cohortes - cohort_definition',
    table_id: 'cohort_definition'
  },
  {
    id: 'concept',
    table_name: 'Nomenclatures et métadonnées - concept',
    table_id: 'concept'
  },
  {
    id: 'concept_fhir',
    table_name: 'Nomenclatures et métadonnées - concept_fhir',
    table_id: 'concept_fhir'
  },
  {
    id: 'concept_relationship',
    table_name: 'Nomenclatures et métadonnées - concept_relationship',
    table_id: 'concept_relationship'
  },
  {
    id: 'concept_synonym',
    table_name: 'Nomenclatures et métadonnées - concept_synonym',
    table_id: 'concept_synonym'
  },
  {
    id: 'condition_occurrence',
    table_name: 'Diagnostics - condition_occurrence',
    table_id: 'condition_occurrence'
  },
  {
    id: 'cost',
    table_name: 'Facturation - cost',
    table_id: 'cost'
  },
  {
    id: 'drug_exposure',
    table_name: 'Médicaments - drug_exposure',
    table_id: 'drug_exposure'
  },
  {
    id: 'drug_exposure_administration',
    table_name: 'Médicaments - drug_exposure_administration',
    table_id: 'drug_exposure_administration'
  },
  {
    id: 'drug_exposure_prescription',
    table_name: 'Médicaments - drug_exposure_prescription',
    table_id: 'drug_exposure_prescription'
  },
  {
    id: 'fact_relationship',
    table_name: 'Structures Patients - fact_relationship',
    table_id: 'fact_relationship'
  },
  {
    id: 'location',
    table_name: 'Patient - location',
    table_id: 'location'
  },
  {
    id: 'location_history',
    table_name: 'Patient - location_history',
    table_id: 'location_history'
  },
  {
    id: 'measurement',
    table_name: 'TABLE_NAME - measurement',
    table_id: 'measurement'
  },
  {
    id: 'measurement_physio',
    table_name: 'TABLE_NAME - measurement_physio',
    table_id: 'measurement_physio'
  },
  {
    id: 'note',
    table_name: 'Documents médicaux - note',
    table_id: 'note'
  },
  {
    id: 'note_content',
    table_name: 'Documents médicaux - note_content',
    table_id: 'note_content'
  },
  {
    id: 'note_section',
    table_name: 'Documents médicaux - note_section',
    table_id: 'note_section'
  },
  {
    id: 'observation',
    table_name: 'Patient - observation',
    table_id: 'observation'
  },
  {
    id: 'observation_demographic',
    table_name: 'Patient - observation_demographic',
    table_id: 'observation_demographic'
  },
  {
    id: 'observation_form',
    table_name: 'Patient - observation_form',
    table_id: 'observation_form'
  },
  {
    id: 'person',
    table_name: 'Patient - person',
    table_id: 'person'
  },
  {
    id: 'procedure_occurrence',
    table_name: 'Actes - procedure_occurrence',
    table_id: 'procedure_occurrence'
  },
  {
    id: 'relationship',
    table_name: 'Nomenclatures et métadonnées - relationship',
    table_id: 'relationship'
  },
  {
    id: 'specimen',
    table_name: 'TABLE_NAME - specimen',
    table_id: 'specimen'
  },
  {
    id: 'visit_detail',
    table_name: 'Mouvements du patient PMSI - visit_detail',
    table_id: 'visit_detail'
  },
  {
    id: 'visit_occurrence',
    table_name: 'Séjours du patient - visit_occurrence',
    table_id: 'visit_occurrence'
  },
  {
    id: 'vocabulary',
    table_name: 'Nomenclatures et métadonnées - vocabulary',
    table_id: 'vocabulary'
  }
]

export default exportTable
