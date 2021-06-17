export type ExportTableType = {
  id: string
  table_name: string
  table_id: string
}

const exportTable: ExportTableType[] = [
  {
    id: 'care_site',
    table_name: 'TABLE NAME - care_site',
    table_id: 'care_site'
  },
  {
    id: 'cohort',
    table_name: 'TABLE NAME - cohort',
    table_id: 'cohort'
  },
  {
    id: 'cohort_definition',
    table_name: 'TABLE NAME - cohort_definition',
    table_id: 'cohort_definition'
  },
  {
    id: 'concept',
    table_name: 'TABLE NAME - concept',
    table_id: 'concept'
  },
  {
    id: 'concept_fhir',
    table_name: 'TABLE NAME - concept_fhir',
    table_id: 'concept_fhir'
  },
  {
    id: 'concept_relationship',
    table_name: 'TABLE NAME - concept_relationship',
    table_id: 'concept_relationship'
  },
  {
    id: 'concept_synonym',
    table_name: 'TABLE NAME - concept_synonym',
    table_id: 'concept_synonym'
  },
  {
    id: 'condition_occurrence',
    table_name: 'TABLE NAME - condition_occurrence',
    table_id: 'condition_occurrence'
  },
  {
    id: 'cost',
    table_name: 'TABLE NAME - cost',
    table_id: 'cost'
  },
  {
    id: 'drug_exposure',
    table_name: 'TABLE NAME - drug_exposure',
    table_id: 'drug_exposure'
  },
  {
    id: 'drug_exposure_administration',
    table_name: 'TABLE NAME - drug_exposure_administration',
    table_id: 'drug_exposure_administration'
  },
  {
    id: 'drug_exposure_prescription',
    table_name: 'TABLE NAME - drug_exposure_prescription',
    table_id: 'drug_exposure_prescription'
  },
  {
    id: 'fact_relationship',
    table_name: 'TABLE NAME - fact_relationship',
    table_id: 'fact_relationship'
  },
  {
    id: 'location',
    table_name: 'TABLE NAME - location',
    table_id: 'location'
  },
  {
    id: 'location_history',
    table_name: 'TABLE NAME - location_history',
    table_id: 'location_history'
  },
  {
    id: 'measurement',
    table_name: 'TABLE NAME - measurement',
    table_id: 'measurement'
  },
  {
    id: 'measurement_physio',
    table_name: 'TABLE NAME - measurement_physio',
    table_id: 'measurement_physio'
  },
  {
    id: 'note',
    table_name: 'TABLE NAME - note',
    table_id: 'note'
  },
  {
    id: 'note_content',
    table_name: 'TABLE NAME - note_content',
    table_id: 'note_content'
  },
  {
    id: 'note_section',
    table_name: 'TABLE NAME - note_section',
    table_id: 'note_section'
  },
  {
    id: 'observation',
    table_name: 'TABLE NAME - observation',
    table_id: 'observation'
  },
  {
    id: 'observation_demographic',
    table_name: 'TABLE NAME - observation_demographic',
    table_id: 'observation_demographic'
  },
  {
    id: 'observation_form',
    table_name: 'TABLE NAME - observation_form',
    table_id: 'observation_form'
  },
  {
    id: 'person',
    table_name: 'TABLE NAME - person',
    table_id: 'person'
  },
  {
    id: 'procedure_occurrence',
    table_name: 'TABLE NAME - procedure_occurrence',
    table_id: 'procedure_occurrence'
  },
  {
    id: 'relationship',
    table_name: 'TABLE NAME - relationship',
    table_id: 'relationship'
  },
  {
    id: 'specimen',
    table_name: 'TABLE NAME - specimen',
    table_id: 'specimen'
  },
  {
    id: 'visit_detail',
    table_name: 'TABLE NAME - visit_detail',
    table_id: 'visit_detail'
  },
  {
    id: 'visit_occurrence',
    table_name: 'TABLE NAME - visit_occurrence',
    table_id: 'visit_occurrence'
  },
  {
    id: 'vocabulary',
    table_name: 'TABLE NAME - vocabulary',
    table_id: 'vocabulary'
  }
]

export default exportTable
