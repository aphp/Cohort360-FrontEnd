import { Cohort, JobStatus } from 'types'
import { CohortCallbacks, ResearchesTableLabels, SubItemType } from 'types/cohorts'
import { Order } from 'types/searchCriterias'
import { Action, CellType, Column, Favorite, Row, SubItem, Table } from 'types/table'
import { getExportTooltip, getGlobalEstimation, isCohortExportable, isExportDisabled } from 'utils/explorationUtils'
import { formatDate } from 'utils/formatDate'
import { format } from 'utils/numbers'
import Download from 'assets/icones/download.svg?react'
import EditIcon from '@mui/icons-material/Edit'
import FluentNavigation from 'assets/icones/fluent_navigation.svg?react'
import Picker from 'assets/icones/color-picker.svg?react'
import { AppConfig } from 'config'
import { isChecked } from 'utils/filters'
import { mapJobStatus } from 'utils/status'

const getCohortInfos = (cohort: Cohort) => {
  const name = cohort.name ?? 'N/A'
  const parentName = cohort.request?.name ?? 'N/A'
  const statusChip = mapJobStatus(cohort.request_job_status, cohort.request_job_fail_msg)
  const total = format(cohort.result_size)
  const globalTotal = getGlobalEstimation(cohort)
  const createdAt = formatDate(cohort.created_at)
  const samples = cohort.sample_cohorts?.length ?? 0

  return { name, parentName, statusChip, total, globalTotal, createdAt, samples }
}

const mapCohortsToRows = (
  list: Cohort[],
  appConfig: AppConfig,
  simplified: boolean,
  callbacks: CohortCallbacks,
  selectedCohorts: Cohort[],
  requestId?: string,
  disabled = false
) => {
  const rows: Row[] = []
  list.forEach((cohort) => {
    const { name, parentName, statusChip, total, globalTotal, createdAt, samples } = getCohortInfos(cohort)
    const {
      onClickCreateSample,
      onClickRow,
      onClickFav,
      onClickExport,
      onClickEdit,
      onSelectCohort,
      onClickCohortVersion,
      onClickSamples
    } = callbacks
    const actions = [
      {
        title: getExportTooltip(isCohortExportable(cohort, appConfig), cohort) ?? '',
        icon: Download,
        onClick: () => onClickExport(cohort),
        disabled: isExportDisabled(cohort, disabled, isCohortExportable(cohort, appConfig))
      },
      {
        title: 'Créer un échantillon à partir de la cohorte',
        icon: Picker,
        onClick: () => onClickCreateSample(cohort),
        disabled: disabled || cohort.request_job_status !== JobStatus.FINISHED
      },
      {
        title: 'Accéder à la version de la requête ayant créé la cohorte',
        icon: FluentNavigation,
        onClick: () => onClickCohortVersion(cohort),
        disabled: disabled
      },
      {
        title: 'Éditer la cohorte',
        icon: EditIcon,
        onClick: () => onClickEdit(cohort),
        disabled: disabled
      }
    ]
    const row: Row = [
      ...(!simplified
        ? [
            {
              id: `${cohort.uuid}-select`,
              value: {
                disabled,
                onClick: () => onSelectCohort(cohort),
                isChecked: isChecked(cohort, selectedCohorts)
              },
              type: CellType.CHECKBOX
            }
          ]
        : []),
      {
        id: `${cohort.uuid}-isFavorite`,
        value: {
          isFavorite: cohort.favorite,
          disabled,
          onClick: () => onClickFav(cohort)
        } as Favorite,
        type: CellType.FAV_ICON
      },
      {
        id: `${cohort.uuid}-name`,
        value: name,
        type: CellType.TEXT,
        sx: {
          fontWeight: 900,
          width: simplified ? '240px' : '400px',
          maxWidth: simplified ? '240px' : '400px',
          whiteSpace: 'wrap'
        }
      },
      {
        id: `${cohort.uuid}-actions`,
        value: actions as Action[],
        type: CellType.ACTIONS,
        sx: { width: 'fit-content' }
      },
      ...(!requestId
        ? [
            {
              id: `${cohort.uuid}-parentName`,
              value: parentName,
              type: CellType.TEXT,
              sx: {
                fontWeight: 900,
                width: simplified ? '240px' : 'inherit',
                maxWidth: simplified ? '240px' : 'inherit',
                whiteSpace: 'wrap'
              }
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
        type: CellType.TEXT,
        sx: { width: 150 }
      },
      {
        id: `${cohort.uuid}-globalTotal`,
        value: globalTotal,
        type: CellType.TEXT,
        sx: { width: 160 }
      },
      {
        id: `${cohort.uuid}-createdAt`,
        value: createdAt,
        type: CellType.TEXT,
        sx: { width: 200 }
      },
      {
        id: `${cohort.uuid}-samples`,
        value: { label: SubItemType.SAMPLES, total: samples, onClick: () => onClickSamples(cohort) } as SubItem,
        type: CellType.SUB_ITEM
      }
    ]
    row._onClick = () => onClickRow(cohort)
    rows.push(row)
  })

  return rows
}

const mapCohortsToColumns = (
  simplified: boolean,
  cohortsList: Cohort[],
  selectedCohorts: Cohort[],
  onSelectAll: () => void,
  requestId?: string
): Column[] => {
  const columns: Column[] = [
    ...(!simplified
      ? [
          {
            label: '',
            isCheckbox: true,
            checkboxProps: {
              isChecked: selectedCohorts.length === cohortsList.length,
              isIndeterminate: selectedCohorts.length > 0 && selectedCohorts.length < cohortsList.length,
              onSelectAll
            }
          }
        ]
      : []),
    { label: '', code: !simplified ? Order.FAVORITE : undefined },
    { label: ResearchesTableLabels.COHORT_NAME, code: !simplified ? Order.NAME : undefined, align: 'left' },
    { label: '' },
    ...(!requestId
      ? [{ label: ResearchesTableLabels.PARENT_REQUEST, code: !simplified ? Order.REQUEST : undefined }]
      : []),
    { label: ResearchesTableLabels.STATUS },
    { label: ResearchesTableLabels.PATIENT_TOTAL, code: !simplified ? Order.RESULT_SIZE : undefined },
    {
      label: ResearchesTableLabels.APHP_TOTAL,
      tooltip:
        "Cet intervalle correspond à une estimation du nombre de patients correspondant aux critères de votre requête avec comme population source tous les hôpitaux de l'APHP."
    },
    { label: ResearchesTableLabels.CREATED_AT, code: !simplified ? Order.CREATED_AT : undefined },
    { label: ResearchesTableLabels.SAMPLES }
  ]

  return columns
}

export const mapCohortsToTable = (
  list: Cohort[],
  simplified: boolean,
  appConfig: AppConfig,
  callbacks: CohortCallbacks,
  selectedCohorts: Cohort[],
  requestId?: string,
  disabled = false
): Table => {
  const table: Table = { rows: [], columns: [] }
  table.columns = mapCohortsToColumns(simplified, list, selectedCohorts, callbacks.onSelectAll, requestId)
  table.rows = mapCohortsToRows(list, appConfig, simplified, callbacks, selectedCohorts, requestId, disabled)
  return table
}
