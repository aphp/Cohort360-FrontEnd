import { JobStatus } from 'types'

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
  pivotMerge: boolean
}

export type TableInfo = {
  columns: string[]
  fhirResourceName: string
  isFhirStandard: boolean
  isOmopStandard: boolean
  name: string
}

export type ExportList = {
  cohort_id: string | null
  cohort_name: string | null
  created_at: string | null
  output_format: 'csv' | 'xlsx' | 'hive' | null
  owner: string | null
  patients_count: number | null
  request_job_status: JobStatus | null
  target_datalab: string | null
  target_name: string | null
}
