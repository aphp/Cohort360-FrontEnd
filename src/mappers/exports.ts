import { Order } from 'types/searchCriterias'
import { Action, CellType, Column, Row, Table } from 'types/table'
import { mapToDateHours } from './dates'
import { ExportCallbacks, ExportList } from 'types/export'
import { mapJobStatus } from 'utils/status'
import Download from 'assets/icones/download.svg?react'
import { JobStatus } from 'types'
import { isDateBefore } from 'utils/formatDate'

const mapExportsToRows = (list: ExportList[], callbacks: ExportCallbacks) => {
  const rows: Row[] = []
  const unknown = 'N/A'
  const { onDownload } = callbacks
  list.forEach((elem) => {
    const actions = [
      {
        title: 'Télécharger l’export',
        icon: Download,
        onClick: () => onDownload(elem.uuid),
        disabled:
          elem.request_job_status !== JobStatus.FINISHED || (elem.created_at && isDateBefore(elem.created_at, 7))
      }
    ]
    const row: Row = [
      {
        id: `${elem.cohort_id}-number`,
        value: elem.cohort_id ?? unknown,
        type: CellType.TEXT
      },
      {
        id: `${elem.cohort_id}-name`,
        value: elem.cohort_name ?? unknown,
        type: CellType.TEXT
      },
      {
        id: `${elem.cohort_id}-target_name`,
        value: elem.target_name ?? unknown,
        type: CellType.TEXT
      },
      {
        id: `${elem.cohort_id}-patient_count`,
        value: elem.patients_count ?? unknown,
        type: CellType.TEXT
      },
      {
        id: `${elem.cohort_id}-output_format`,
        value: elem.output_format ?? unknown,
        type: CellType.TEXT
      },
      {
        id: `${elem.cohort_id}-created_at`,
        value: elem.created_at ? mapToDateHours(elem.created_at) : unknown,
        type: CellType.TEXT
      },
      {
        id: `${elem.cohort_id}-request_job_status`,
        value: mapJobStatus(elem.request_job_status ?? undefined),
        type: CellType.STATUS_CHIP
      },
      { id: `${elem.cohort_id}-actions`, value: actions as Action[], type: CellType.ACTIONS }
    ].filter((elem) => elem) as Row
    rows.push(row)
  })
  return rows
}

const mapExportsToColumns = (): Column[] => {
  return [
    { label: 'N° de cohorte' },
    { label: 'Nom de la cohorte' },
    { label: "Nom de l'export" },
    { label: 'Nombre de patient' },
    { label: 'Format', code: Order.OUTPUT_FORMAT },
    { label: 'Date de l’export', code: Order.CREATED_AT },
    { label: 'Statut', code: Order.STATUS },
    { label: '' }
  ]
}

export const mapExportListToTable = (exportList: ExportList[], callbacks: ExportCallbacks) => {
  const table: Table = { rows: [], columns: [] }
  table.columns = mapExportsToColumns()
  table.rows = mapExportsToRows(exportList, callbacks)
  return table
}
