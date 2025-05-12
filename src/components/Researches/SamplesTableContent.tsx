import React, { useContext } from 'react'
import { AppConfig } from 'config'
import { useNavigate, useParams } from 'react-router-dom'

import { Box, Checkbox, IconButton, TableRow } from '@mui/material'
import CenteredCircularProgress from 'components/ui/CenteredCircularProgress'
import FavStar from 'components/ui/FavStar'
import IconButtonWithTooltip from '../ui/IconButtonWithTooltip'
import ResearchesTable from './ResearchesTable'
import { TableCellWrapper } from './ResearchesTable/styles'

import Download from 'assets/icones/download.svg?react'
import EditIcon from '@mui/icons-material/Edit'
import FluentNavigation from 'assets/icones/fluent_navigation.svg?react'

import { Cohort, JobStatus, Column } from 'types'
import { Order, OrderBy } from 'types/searchCriterias'
import displayDigit from 'utils/displayDigit'
import { formatDate } from 'utils/formatDate'
import { getExportTooltip } from 'utils/explorationUtils'
import { isChecked } from 'utils/filters'
import { getCohortStatusChip } from './CohortsTableContent'

type CohortCallbacks = {
  onClickRow: (cohort: Cohort) => void
  onClickFav: (cohort: Cohort) => void
  onClickExport: (cohort: Cohort) => void
  onClickEdit: (cohort: Cohort) => void
  onClickCreateSample: (cohort: Cohort) => void
  onSelectCohort: (cohort: Cohort) => void
}

type SamplesTableContentProps = {
  list: Cohort[]
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
}

const SamplesTableContent: React.FC<SamplesTableContentProps> = ({
  list,
  page,
  setPage,
  total,
  loading,
  order,
  onChangeOrderBy,
  disabled,
  selectedCohorts,
  onSelectAll,
  cohortsCallbacks
}) => {
  const appConfig = useContext(AppConfig)
  const navigate = useNavigate()
  const { cohortId } = useParams()
  const { onClickRow, onClickFav, onClickExport, onClickEdit, onSelectCohort } = cohortsCallbacks

  const columns: Column[] = [
    {
      label: (
        <Checkbox
          size="small"
          checked={selectedCohorts.length === list.length}
          indeterminate={selectedCohorts.length > 0 && selectedCohorts.length < list.length}
          onClick={onSelectAll}
        />
      )
    },
    { label: '', code: Order.FAVORITE },
    { label: "nom de l'échantillon", code: Order.NAME, align: 'left' },
    { label: '' },
    ...(!cohortId ? [{ label: 'cohorte parent', code: Order.REQUEST }] : []),
    { label: 'statut' },
    { label: 'nb de patients', code: Order.RESULT_SIZE },
    { label: 'pourcentage du total' },
    { label: 'date de création', code: Order.CREATED_AT }
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
    >
      {list.map((cohort) => {
        const isExportable = appConfig.features.export.enabled ? cohort?.rights?.export_csv_nomi : false
        const disableExport =
          !isExportable ||
          !cohort.exportable ||
          disabled ||
          cohort.request_job_status === JobStatus.LONG_PENDING ||
          cohort.request_job_status === JobStatus.FAILED ||
          cohort.request_job_status === JobStatus.PENDING

        return (
          <TableRow
            key={cohort.uuid}
            onClick={() => cohort.request_job_status === JobStatus.FINISHED && onClickRow(cohort)}
            sx={{
              cursor: cohort.request_job_status === JobStatus.FINISHED ? 'pointer' : 'not-allowed',
              '&:hover': { backgroundColor: '#f8f9fa' }
            }}
          >
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
            <TableCellWrapper align="left" accentcell>
              {cohort.name}
            </TableCellWrapper>
            <TableCellWrapper>
              <Box display={'flex'} alignItems={'center'}>
                <IconButtonWithTooltip
                  title={getExportTooltip(!!isExportable, cohort) ?? ''}
                  icon={<Download />}
                  onClick={() => onClickExport(cohort)}
                  disabled={disableExport}
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
            {!cohortId && <TableCellWrapper>{cohort.parent_cohort?.name}</TableCellWrapper>}
            <TableCellWrapper>
              {getCohortStatusChip(cohort.request_job_status, cohort.request_job_fail_msg)}
            </TableCellWrapper>
            <TableCellWrapper>{displayDigit(cohort.result_size)}</TableCellWrapper>
            <TableCellWrapper>{cohort.sampling_ratio ? cohort.sampling_ratio * 100 : 'N/A'} %</TableCellWrapper>
            <TableCellWrapper>{formatDate(cohort.created_at)}</TableCellWrapper>
          </TableRow>
        )
      })}
    </ResearchesTable>
  )
}

export default SamplesTableContent
