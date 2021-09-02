export type ExportTableType = {
  id: string
  table_name: string
  table_id: string
}

const exportTable: ExportTableType[] = [
  {
    id: 'person',
    table_name: 'Patient',
    table_id: 'person'
  },
  {
    id: 'observation_demographic',
    table_name: 'Patient - Données démographiques',
    table_id: 'observation_demographic'
  },
  {
    id: 'visit_occurrence',
    table_name: 'Visite',
    table_id: 'visit_occurrence'
  },
  {
    id: 'visit_detail',
    table_name: 'Visite - Mouvements / Passages ',
    table_id: 'visit_detail'
  },
  {
    id: 'cohort_definition',
    table_name: 'Cohorte - Information',
    table_id: 'cohort_definition'
  },
  {
    id: 'condition_occurrence',
    table_name: 'Fait - PMSI - Diagnostics',
    table_id: 'condition_occurrence'
  },
  {
    id: 'procedure_occurrence',
    table_name: 'Fait - PMSI - Actes',
    table_id: 'procedure_occurrence'
  },
  {
    id: 'cost',
    table_name: 'Fait - PMSI - GHM',
    table_id: 'cost'
  },
  {
    id: 'note',
    table_name: 'Fait - Documents médicaux',
    table_id: 'note'
  },
  {
    id: 'care_site',
    table_name: 'Référentiel - Structure hospitalière',
    table_id: 'care_site'
  },
  {
    id: 'fact_relationship',
    table_name: 'Référentiel - Liens entre entités',
    table_id: 'fact_relationship'
  },
  {
    id: 'concept_relationship',
    table_name: 'Référentiel - Terminologie - Lien entre concepts',
    table_id: 'concept_relationship'
  },
  {
    id: 'vocabulary',
    table_name: 'Référentiel - Terminologie - Vocabulaire et nomenclature',
    table_id: 'vocabulary'
  },
  {
    id: 'concept',
    table_name: 'Référentiel - Terminologie - Concept',
    table_id: 'concept'
  }
]

export default exportTable
