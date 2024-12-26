import React, { useContext } from 'react'
import { AppConfig } from 'config'
import { useNavigate, useParams } from 'react-router-dom'

import { Box, Checkbox, CircularProgress, IconButton, TableRow, Tooltip } from '@mui/material'
import FavStar from 'components/ui/FavStar'
import ResearchesTable from './Table'
import StatusChip from './StatusChip'
import { TableCellWrapper } from './Table/styles'

import Download from 'assets/icones/download.svg?react'
import EditIcon from '@mui/icons-material/Edit'
import RequestTree from 'assets/icones/schema.svg?react'
import UpdateIcon from '@mui/icons-material/Update'

import { Cohort, CohortJobStatus, Column } from 'types'
import { Order, OrderBy } from 'types/searchCriterias'
import displayDigit from 'utils/displayDigit'
import { formatDate } from 'utils/formatDate'
import { getExportTooltip, getGlobalEstimation } from 'utils/explorationUtils'
import { isChecked } from 'utils/filters'

export const getCohortStatusChip = (status?: CohortJobStatus, jobFailMessage?: string) => {
  if (jobFailMessage) {
    return (
      <Tooltip title={jobFailMessage}>
        <StatusChip label="Erreur" status={'error'} />
      </Tooltip>
    )
  }

  switch (status) {
    case CohortJobStatus.FINISHED:
      return <StatusChip label="Terminé" status={'finished'} />
    case CohortJobStatus.PENDING:
    case CohortJobStatus.NEW:
      return <StatusChip label="En cours" status={'in-progress'} />
    case CohortJobStatus.LONG_PENDING:
      return (
        <Tooltip title="Cohorte volumineuse : sa création est plus complexe et nécessite d'être placée dans une file d'attente. Un mail vous sera envoyé quand celle-ci sera disponible.">
          <StatusChip label="En cours" status={'in-progress'} icon={<UpdateIcon />} />
        </Tooltip>
      )
    default:
      return <StatusChip label="Erreur" status={'error'} />
  }
}

type CohortCallbacks = {
  onClickRow: (cohort: Cohort) => void
  onClickFav: (cohort: Cohort) => void
  onClickExport: (cohort: Cohort) => void
  onClickEdit: (cohort: Cohort) => void
  onSelectCohort: (cohort: Cohort) => void
}

type CohortsTableContentProps = {
  cohortsList: Cohort[]
  selectedCohorts: Cohort[]
  page: number
  setPage: (page: number) => void
  total: number
  loading: boolean
  order: OrderBy
  disabled: boolean
  onChangeOrderBy: (newOrder: OrderBy) => void
  onSelectAll: () => void
  cohortsCallbacks: CohortCallbacks
  noPagination?: boolean
}

const CohortsTableContent: React.FC<CohortsTableContentProps> = ({
  cohortsList,
  page,
  setPage,
  total,
  loading,
  order,
  onChangeOrderBy,
  disabled,
  selectedCohorts,
  onSelectAll,
  cohortsCallbacks,
  noPagination
}) => {
  const appConfig = useContext(AppConfig)
  const navigate = useNavigate()
  const { requestId } = useParams()
  const { onClickRow, onClickFav, onClickExport, onClickEdit, onSelectCohort } = cohortsCallbacks

  const columns: Column[] = [
    {
      label: (
        <Checkbox
          size="small"
          checked={selectedCohorts.length === cohortsList.length}
          indeterminate={selectedCohorts.length > 0 && selectedCohorts.length < cohortsList.length}
          onClick={onSelectAll}
        />
      )
    },
    { label: '', code: Order.FAVORITE },
    { label: 'nom de la cohorte', code: Order.NAME, align: 'left' },
    { label: '' },
    ...(!requestId ? [{ label: 'requête parent' }] : []),
    { label: 'statut' },
    { label: 'nb de patients', code: Order.RESULT_SIZE },
    { label: 'estimation du nombre de patients ap-hp' },
    { label: 'date de création', code: Order.CREATED_AT }
    // { label: 'échantillons' }
  ]

  return loading ? (
    <Box display="flex" width={'100%'} justifyContent={'center'}>
      <CircularProgress size={50} />
    </Box>
  ) : (
    <ResearchesTable
      columns={columns}
      page={page}
      setPage={setPage}
      total={total}
      order={order}
      setOrder={(newOrder) => onChangeOrderBy(newOrder)}
      noPagination={noPagination}
    >
      {cohortsList.map((cohort) => {
        const isExportable = appConfig.features.export.enabled ? cohort?.rights?.export_csv_nomi : false
        const disableExport =
          !isExportable ||
          !cohort.exportable ||
          disabled ||
          cohort.request_job_status === CohortJobStatus.LONG_PENDING ||
          cohort.request_job_status === CohortJobStatus.FAILED ||
          cohort.request_job_status === CohortJobStatus.PENDING

        return (
          <TableRow key={cohort.uuid} onClick={() => onClickRow(cohort)} style={{ cursor: 'pointer' }}>
            <TableCellWrapper>
              <Checkbox
                size="small"
                checked={isChecked(cohort, selectedCohorts)}
                onClick={(event) => {
                  event.stopPropagation()
                  onSelectCohort(cohort)
                }}
              />
            </TableCellWrapper>
            <TableCellWrapper align="left">
              <IconButton
                onClick={(event) => {
                  event.stopPropagation()
                  onClickFav(cohort)
                }}
                disabled={disabled}
              >
                <FavStar favorite={cohort.favorite} height={18} color={disabled ? '#CBCFCF' : undefined} />
              </IconButton>
            </TableCellWrapper>
            <TableCellWrapper align="left" accentCell>
              {cohort.name}
            </TableCellWrapper>
            <TableCellWrapper>
              <Box display={'flex'} alignItems={'center'}>
                <Tooltip title={getExportTooltip(cohort, !!isExportable)}>
                  <IconButton
                    size="small"
                    onClick={(event) => {
                      event.stopPropagation()
                      onClickExport(cohort)
                    }}
                    disabled={disableExport}
                  >
                    <Download fill={disableExport ? '#CBCFCF' : '#2b2b2b'} />
                  </IconButton>
                </Tooltip>
                {/* <Tooltip title={'Créer un échantillon à partir de la cohorte'}>
                      <IconButton
                        size="small"
                        onClick={(event) => {
                          event.stopPropagation()
                        }}
                        disabled={disabled}
                      >
                        <Picker stroke={disabled ? '#CBCFCF' : '#2b2b2b'} />
                      </IconButton>
                    </Tooltip> */}
                <Tooltip title={'Accéder à la version de la requête ayant créé la cohorte'}>
                  <IconButton
                    size="small"
                    onClick={(event) => {
                      event.stopPropagation()
                      navigate(`/cohort/new/${cohort.request?.uuid}/${cohort.request_query_snapshot}`)
                    }}
                    disabled={disabled}
                  >
                    <RequestTree fill={disabled ? '#CBCFCF' : '#2b2b2b'} />
                  </IconButton>
                </Tooltip>
                <Tooltip title={'Éditer la cohorte'}>
                  <IconButton
                    size="small"
                    onClick={(event) => {
                      event.stopPropagation()
                      onClickEdit(cohort)
                    }}
                    disabled={disabled}
                  >
                    <EditIcon htmlColor={disabled ? '#CBCFCF' : '#2b2b2b'} />
                  </IconButton>
                </Tooltip>
              </Box>
            </TableCellWrapper>
            {!requestId && <TableCellWrapper>{cohort.request?.name}</TableCellWrapper>}
            <TableCellWrapper>
              {getCohortStatusChip(cohort.request_job_status, cohort.request_job_fail_msg)}
            </TableCellWrapper>
            <TableCellWrapper>{displayDigit(cohort.result_size)}</TableCellWrapper>
            <TableCellWrapper>{getGlobalEstimation(cohort)}</TableCellWrapper>
            <TableCellWrapper>{formatDate(cohort.created_at, true)}</TableCellWrapper>
            {/* <TableCellWrapper>
                  <Button
                    endIcon={<ArrowRightAltIcon />}
                    customVariant="clear"
                    onClick={(event) => {
                      event?.stopPropagation()
                      if (projectId && requestId)
                        navigate(`/researches/projects/${projectId}/${requestId}/${cohort.uuid}${location.search}`)
                      if (!projectId && requestId)
                        navigate(`/researches/requests/${requestId}/${cohort.uuid}${location.search}`)
                      if (!projectId && !requestId) navigate(`/researches/cohorts/${cohort.uuid}${location.search}`)
                    }}
                  >
                    0 échantillon
                  </Button>
                </TableCellWrapper> */}
          </TableRow>
        )
      })}
    </ResearchesTable>
  )
}

export default CohortsTableContent
