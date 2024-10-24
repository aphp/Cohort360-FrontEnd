import { fetchExportTableInfo } from 'services/aphp/callApi'

export const getExportTable = async () => {
  const response = await fetchExportTableInfo()
  const exportTable = Object.values(response)
  const formatedTable = exportTable.filter(
    (table: any) =>
      table.name === 'person' ||
      table.name === 'iris' ||
      table.name === 'visit_occurrence' ||
      table.name === 'visit_detail' ||
      table.name === 'condition_occurrence' ||
      table.name === 'procedure_occurrence' ||
      table.name === 'cost' ||
      table.name === 'note' ||
      table.name === 'drug_exposure_prescription' ||
      table.name === 'drug_exposure_administration' ||
      table.name === 'measurement' ||
      table.name === 'care_site - fact_relationship' ||
      table.name === 'imaging_study - imaging_series' ||
      table.name === 'questionnaireresponse'
  )
  return formatedTable
}
