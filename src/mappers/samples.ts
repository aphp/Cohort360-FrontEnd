import { AppConfig } from 'config'
import { mapCohortStatus } from 'components/Researches/CohortsTableContent'
import { Cohort } from 'types'
import { ResearchesTableLabels } from 'types/cohorts'
import { Order } from 'types/searchCriterias'
import { Action, CellType, Column, Favorite, Row, Table } from 'types/table'
import { getExportTooltip, getGlobalEstimation, isCohortExportable, isExportDisabled } from 'utils/explorationUtils'
import { formatDate } from 'utils/formatDate'
import { format } from 'utils/numbers'
import Download from 'assets/icones/download.svg?react'
import EditIcon from '@mui/icons-material/Edit'
import FluentNavigation from 'assets/icones/fluent_navigation.svg?react'

const getSamplesInfos = (cohort: Cohort) => {
  const name = cohort.name ?? 'N/A'
  const parentName = cohort.parent_cohort?.name ?? 'N/A'
  const statusChip = mapCohortStatus(cohort.request_job_status, cohort.request_job_fail_msg)
  const total = format(cohort.result_size)
  const globalTotal = getGlobalEstimation(cohort)
  const createdAt = formatDate(cohort.created_at)
  const samples = cohort.sample_cohorts?.length ?? 0
  const samplingRatio = cohort.sampling_ratio ? `${(cohort.sampling_ratio * 100).toString()} %` : 'N/A'
  return {
    name,
    parentName,
    statusChip,
    total,
    globalTotal,
    createdAt,
    samples,
    samplingRatio
  }
}

const mapSamplesToRows = (list: Cohort[], appConfig: AppConfig, requestId?: string, disabled = false) => {
  const rows: Row[] = []
  list.forEach((cohort) => {
    const { name, parentName, statusChip, total, createdAt, samplingRatio } = getSamplesInfos(cohort)
    const actions = [
      {
        title: getExportTooltip(isCohortExportable(cohort, appConfig), cohort) ?? '',
        icon: Download,
        onClick: () => {},
        disabled: isExportDisabled(cohort, disabled, isCohortExportable(cohort, appConfig))
      },
      {
        title: 'Accéder à la version de la requête ayant créé la cohorte',
        icon: FluentNavigation,
        onClick: () => {},
        disabled: disabled
      },
      {
        title: 'Éditer la cohorte',
        icon: EditIcon,
        onClick: () => {},
        disabled: disabled
      }
    ]
    const row: Row = [
      {
        id: `${cohort.uuid}-select`,
        value: '',
        type: CellType.CHECKBOX
      },
      {
        id: `${cohort.uuid}-isFavorite`,
        value: { isFavorite: cohort.favorite, disabled } as Favorite,
        type: CellType.FAV_ICON
      },
      {
        id: `${cohort.uuid}-name`,
        value: name,
        type: CellType.TEXT,
        sx: { fontWeight: 900 }
      },
      { id: `${cohort.uuid}-actions`, value: actions as Action[], type: CellType.ACTIONS },
      ...(!requestId
        ? [
            {
              id: `${cohort.uuid}-parentName`,
              value: parentName,
              type: CellType.TEXT
            }
          ]
        : []),
      {
        id: `${cohort.uuid}-statusChip`,
        value: statusChip,
        type: CellType.STATUS_CHIP
      },
      {
        id: `${cohort.uuid}-total`,
        value: total,
        type: CellType.TEXT
      },
      {
        id: `${cohort.uuid}-samplingRatio`,
        value: samplingRatio,
        type: CellType.TEXT
      },
      {
        id: `${cohort.uuid}-createdAt`,
        value: createdAt,
        type: CellType.TEXT
      }
    ]
    rows.push(row)
  })

  return rows
}

const mapSamplesToColumns = (cohortId?: string): Column[] => {
  const columns: Column[] = [
    { label: '' },
    { label: '', code: Order.FAVORITE },
    { label: ResearchesTableLabels.SAMPLE_NAME, code: Order.NAME, align: 'left' },
    { label: '' },
    ...(!cohortId ? [{ label: ResearchesTableLabels.PARENT_COHORT, code: Order.REQUEST }] : []),
    { label: ResearchesTableLabels.STATUS },
    { label: ResearchesTableLabels.PATIENT_TOTAL, code: Order.RESULT_SIZE },
    { label: ResearchesTableLabels.TOTAL_PERCENTAGE },
    { label: ResearchesTableLabels.CREATED_AT, code: Order.CREATED_AT }
  ]

  return columns
}

export const mapSamplesToTable = (
  list: Cohort[],
  appConfig: AppConfig,
  requestId?: string,
  disabled = false
): Table => {
  const table: Table = { rows: [], columns: [] }
  table.columns = mapSamplesToColumns(requestId)
  table.rows = mapSamplesToRows(list, appConfig, requestId, disabled)
  return table
}
