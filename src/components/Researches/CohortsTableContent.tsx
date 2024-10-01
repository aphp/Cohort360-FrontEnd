import React, { useContext } from 'react'
import { AppConfig } from 'config'
import { useNavigate, useParams } from 'react-router-dom'

import { Box, Checkbox, IconButton, TableRow, Tooltip } from '@mui/material'
import CenteredCircularProgress from 'components/ui/CenteredCircularProgress'
import FavStar from 'components/ui/FavStar'
import IconButtonWithTooltip from '../ui/IconButtonWithTooltip'
import ResearchesTable from './ResearchesTable'
import SublevelButton from './SublevelButton'
import StatusChip, { ChipStatus } from 'components/ui/StatusChip'
import { TableCellWrapper } from './ResearchesTable/styles'

import Download from 'assets/icones/download.svg?react'
import EditIcon from '@mui/icons-material/Edit'
import FluentNavigation from 'assets/icones/fluent_navigation.svg?react'
import InfoIcon from '@mui/icons-material/Info'
import Picker from 'assets/icones/color-picker.svg?react'
import UpdateIcon from '@mui/icons-material/Update'

import { Cohort, JobStatus, Column } from 'types'
import { Order, OrderBy } from 'types/searchCriterias'
import { formatDate } from 'utils/formatDate'
import {
  getExportTooltip,
  getGlobalEstimation,
  isCohortExportable,
  isExportDisabled,
  redirectToSamples
} from 'utils/explorationUtils'
import { isChecked } from 'utils/filters'
import { format } from 'utils/numbers'

export const getCohortStatusChip = (status?: JobStatus, jobFailMessage?: string) => {
  if (jobFailMessage) {
    return (
      <Tooltip title={jobFailMessage}>
        <StatusChip label="Erreur" status={ChipStatus.ERROR} />
      </Tooltip>
    )
  }

  switch (status) {
    case JobStatus.FINISHED:
      return <StatusChip label="Terminé" status={ChipStatus.FINISHED} />
    case JobStatus.PENDING:
    case JobStatus.NEW:
      return <StatusChip label="En cours" status={ChipStatus.IN_PROGRESS} />
    case JobStatus.LONG_PENDING:
      return (
        <Tooltip title="Cohorte volumineuse : sa création est plus complexe et nécessite d'être placée dans une file d'attente. Un mail vous sera envoyé quand celle-ci sera disponible.">
          <StatusChip label="En cours" status={ChipStatus.IN_PROGRESS} icon={<UpdateIcon />} />
        </Tooltip>
      )
    default:
      return <StatusChip label="Erreur" status={ChipStatus.ERROR} />
  }
}

type CohortCallbacks = {
  onClickRow: (cohort: Cohort) => void
  onClickFav: (cohort: Cohort) => void
  onClickExport: (cohort: Cohort) => void
  onClickEdit: (cohort: Cohort) => void
  onClickCreateSample: (cohort: Cohort) => void
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
  simplified?: boolean
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
  simplified = false
}) => {
  const appConfig = useContext(AppConfig)
  const navigate = useNavigate()
  const { projectId, requestId } = useParams()
  const { onClickCreateSample, onClickRow, onClickFav, onClickExport, onClickEdit, onSelectCohort } = cohortsCallbacks

  const columns: Column[] = [
    ...(!simplified
      ? [
          {
            label: (
              <Checkbox
                size="small"
                checked={selectedCohorts.length === cohortsList.length}
                indeterminate={selectedCohorts.length > 0 && selectedCohorts.length < cohortsList.length}
                onClick={onSelectAll}
              />
            )
          }
        ]
      : []),
    { label: '', code: !simplified ? Order.FAVORITE : undefined },
    { label: 'nom de la cohorte', code: !simplified ? Order.NAME : undefined, align: 'left' },
    { label: '' },
    ...(!requestId ? [{ label: 'requête parent', code: !simplified ? Order.REQUEST : undefined }] : []),
    { label: 'statut' },
    { label: 'nb de patients', code: !simplified ? Order.RESULT_SIZE : undefined },
    {
      label: (
        <Box display="flex" alignItems="center" gap={0.2}>
          estimation du nb de patients ap-hp
          <Tooltip title="Cet intervalle correspond à une estimation du nombre de patients correspondant aux critères de votre requête avec comme population source tous les hôpitaux de l'APHP.">
            <InfoIcon fontSize="small" htmlColor="#5bc5f4" />
          </Tooltip>
        </Box>
      )
    },
    { label: 'date de création', code: !simplified ? Order.CREATED_AT : undefined },
    { label: 'échantillons' }
  ]

  return loading ? (
    <CenteredCircularProgress />
  ) : (
    <ResearchesTable
      columns={columns}
      page={page}
      setPage={setPage}
      total={total}
      order={order}
      setOrder={(newOrder) => onChangeOrderBy(newOrder)}
      noPagination={simplified}
    >
      {cohortsList.map((cohort) => (
        <TableRow
          key={cohort.uuid}
          onClick={() => cohort.request_job_status === JobStatus.FINISHED && onClickRow(cohort)}
          sx={{
            cursor: cohort.request_job_status === JobStatus.FINISHED ? 'pointer' : 'not-allowed',
            '&:hover': { backgroundColor: '#f8f9fa' }
          }}
        >
          {!simplified && (
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
          )}
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
          <TableCellWrapper align="left" accentcell>
            {cohort.name}
          </TableCellWrapper>
          <TableCellWrapper>
            <Box display={'flex'} alignItems={'center'}>
              <IconButtonWithTooltip
                title={getExportTooltip(isCohortExportable(cohort, appConfig), cohort) ?? ''}
                icon={<Download />}
                onClick={() => onClickExport(cohort)}
                disabled={isExportDisabled(cohort, disabled, isCohortExportable(cohort, appConfig))}
              />
              <IconButtonWithTooltip
                title="Créer un échantillon à partir de la cohorte"
                icon={<Picker />}
                onClick={() => onClickCreateSample(cohort)}
                disabled={disabled || cohort.request_job_status !== JobStatus.FINISHED}
              />
              <IconButtonWithTooltip
                title="Accéder à la version de la requête ayant créé la cohorte"
                icon={<FluentNavigation />}
                onClick={() => navigate(`/cohort/new/${cohort.request?.uuid}/${cohort.request_query_snapshot}`)}
                disabled={disabled}
              />
              <IconButtonWithTooltip
                title="Éditer la cohorte"
                icon={<EditIcon />}
                onClick={() => onClickEdit(cohort)}
                disabled={disabled}
              />
            </Box>
          </TableCellWrapper>
          {!requestId && <TableCellWrapper>{cohort.request?.name}</TableCellWrapper>}
          <TableCellWrapper>
            {getCohortStatusChip(cohort.request_job_status, cohort.request_job_fail_msg)}
          </TableCellWrapper>
          <TableCellWrapper>{format(cohort.result_size)}</TableCellWrapper>
          <TableCellWrapper>{getGlobalEstimation(cohort)}</TableCellWrapper>
          <TableCellWrapper>{formatDate(cohort.created_at)}</TableCellWrapper>
          <TableCellWrapper>
            <SublevelButton
              label="échantillon"
              onClick={() => navigate(redirectToSamples(cohort.uuid as string, requestId, projectId))}
              total={cohort.sample_cohorts?.length ?? 0}
            />
          </TableCellWrapper>
        </TableRow>
      ))}
    </ResearchesTable>
  )
}

export default CohortsTableContent
