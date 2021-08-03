export type ExportTableType = {
  id: string
  table_name: string
  table_id: string
}

const exportTable: ExportTableType[] = [
  {
    id: 'care_site',
    table_name: 'Périmètres - care_site',
    table_id: 'care_site'
  },
  {
    id: 'fact_relationship',
    table_name: 'Hiérarchie des périmètres  - fact_relationship',
    table_id: 'fact_relationshiFp'
  },
  // {
  //   id: 'cohort',
  //   table_name: 'Cohortes - cohort',
  //   table_id: 'cohort'
  // },
  {
    id: 'cohort_definition',
    table_name: 'Informations de la cohorte - cohort_definition',
    table_id: 'cohort_definition'
  },
  {
    id: 'concept',
    table_name: 'Terminologies - concept',
    table_id: 'concept'
  },
  {
    id: 'concept_relationship',
    table_name: 'Hiérarchie des terminologies - concept_relationship',
    table_id: 'concept_relationship'
  },
  {
    id: 'vocabulary',
    table_name: 'Vocabulaires des terminologies - vocabulary',
    table_id: 'vocabulary'
  },
  {
    id: 'condition_occurrence',
    table_name: 'Diagnostics - condition_occurrence',
    table_id: 'condition_occurrence'
  },
  // {
  //   id: 'cost',
  //   table_name: 'Facturation - cost',
  //   table_id: 'cost'
  // },
  {
    id: 'drug_exposure',
    table_name: 'Médicaments - drug_exposure',
    table_id: 'drug_exposure'
  },
  // {
  //   id: 'measurement',
  //   table_name: 'Physiologie - measurement',
  //   table_id: 'measurement'
  // },
  {
    id: 'note',
    table_name: 'Documents médicaux - note',
    table_id: 'note'
  },
  {
    id: 'observation_demographic',
    table_name: 'Données démographiques - observation_demographic',
    table_id: 'observation_demographic'
  },
  {
    id: 'person',
    table_name: 'Patients - person',
    table_id: 'person'
  },
  {
    id: 'procedure_occurrence',
    table_name: 'Actes - procedure_occurrence',
    table_id: 'procedure_occurrence'
  },
  // {
  //   id: 'specimen',
  //   table_name: 'TABLE_NAME - specimen',
  //   table_id: 'specimen'
  // },
  {
    id: 'visit_detail',
    table_name: 'Mouvements / passages - visit_detail',
    table_id: 'visit_detail'
  },
  {
    id: 'visit_occurrence',
    table_name: 'Séjours - visit_occurrence',
    table_id: 'visit_occurrence'
  }
]

export default exportTable
