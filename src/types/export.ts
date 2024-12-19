export type TableSetting = {
  tableName: string
  isChecked: boolean | null
  columns: string[] | null
  fhirFilter: {
    uuid: string
    owner: string
    deleted: boolean | null
    deleted_by_cascade: boolean
    created_at: string
    modified_at: string
    fhir_resource: string
    fhir_version: string
    query_version: string
    name: string
    filter: string
    auto_generated: boolean
  } | null
  respectTableRelationships: boolean
}

export type TableInfo = {
  columns: string[]
  fhirResourceName: string
  isFhirStandard: boolean
  isOmopStandard: boolean
  name: string
}
