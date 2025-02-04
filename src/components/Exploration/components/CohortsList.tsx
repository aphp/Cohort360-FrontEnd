import React, { useContext, useState } from 'react'
import { AppConfig } from 'config'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { useAppSelector } from 'state'

import { Box, CircularProgress, Grid, IconButton, TableRow, Tooltip } from '@mui/material'
import Button from 'components/ui/Button'
import FavStar from 'components/ui/FavStar'
import ResearchesTable from './Table'
import { TableCellWrapper } from 'components/ui/TableCell/styles'
import StatusChip from './StatusChip'

import ActionMenu from './ActionMenu'
import ArrowRightAltIcon from '@mui/icons-material/ArrowRightAlt'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import Download from 'assets/icones/download.svg?react'
import EditIcon from '@mui/icons-material/Edit'
import LevelHeader from './LevelHeader'
import Picker from 'assets/icones/color-picker.svg?react'
import RequestTree from 'assets/icones/schema.svg?react'
import ShareIcon from '@mui/icons-material/Share'
import UpdateIcon from '@mui/icons-material/Update'

import useCohorts from '../hooks/useCohorts'
import useCohortsWebSocket from '../hooks/useCohortsWebSocket'
import useEditCohort from '../hooks/useEditCohort'
import useRequest from '../hooks/useRequest'

import { Cohort, CohortJobStatus, Column, ValueSet } from 'types'
import { CohortsType } from 'types/cohorts'
import { CohortsFilters, Direction, Order, OrderBy } from 'types/searchCriterias'
import displayDigit from 'utils/displayDigit'
import { formatDate } from 'utils/formatDate'
import { getExportTooltip, getGlobalEstimation } from 'utils/explorationUtils'

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

export const getStatusFilter = (status?: string | null) => {
  if (status) {
    return status.split(',').map((status) => {
      return { code: status }
    }) as ValueSet[]
  } else {
    return []
  }
}

export const getFavoriteFilters = (favoriteParam?: string | null) => {
  if (favoriteParam === 'true') {
    return CohortsType.FAVORITE
  } else if (favoriteParam === 'false') {
    return CohortsType.NOT_FAVORITE
  } else {
    return CohortsType.ALL
  }
}

const CohortsList = () => {
  const appConfig = useContext(AppConfig)
  const navigate = useNavigate()
  const { projectId, requestId } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  const searchInput = searchParams.get('searchInput') ?? ''
  const startDate = searchParams.get('startDate')
  const endDate = searchParams.get('endDate')
  const page = parseInt(searchParams.get('page') ?? '1', 10)
  const orderBy = (searchParams.get('orderBy') as Order) ?? Order.CREATED_AT
  const orderDirection = (searchParams.get('direction') as Direction) ?? Direction.DESC
  // TODO: add les params pour les filtres exclusifs aux cohortes + bien penser à les suppr en changeant d'onglet
  const status = searchParams.get('status')
  const favorite = searchParams.get('favorite')
  const minPatients = searchParams.get('minPatients')
  const maxPatients = searchParams.get('maxPatients')

  const maintenanceIsActive = useAppSelector((state) => state?.me?.maintenance?.active ?? false)

  const [deleteMode, setDeleteMode] = useState(false)
  const [toggleModal, setToggleModal] = useState(false)
  const [order, setOrder] = useState<OrderBy>({ orderBy, orderDirection })
  const [filters, setFilters] = useState<CohortsFilters>({
    status: getStatusFilter(status),
    favorite: getFavoriteFilters(favorite),
    minPatients,
    maxPatients,
    startDate,
    endDate,
    parentId: requestId
  })

  const { request: parentRequest, requestLoading, requestIsError } = useRequest(requestId)
  const { cohortsList, total, loading } = useCohorts(order, searchInput, filters)
  useCohortsWebSocket()
  const editCohortMutation = useEditCohort()

  const columns: Column[] = [
    { label: '', code: Order.FAVORITE, align: 'left' },
    { label: 'nom de la cohorte', code: Order.NAME, align: 'left' },
    ...(!requestId ? [{ label: 'requête parent' }] : []), //TODO: cliquable ou pas?
    // TODO: ajouter tri par requête parent?
    { label: 'statut' },
    { label: 'nb de patients', code: Order.RESULT_SIZE },
    { label: 'estimation du nombre de patients ap-hp' },
    { label: 'date de création', code: Order.CREATED_AT },
    { label: 'échantillons' }
  ]

  const handlePageChange = (newPage: number) => {
    searchParams.set('page', String(newPage))
    setSearchParams(searchParams)
  }

  const onClickRow = (cohort: Cohort) => {
    const searchParams = new URLSearchParams()
    if (cohort.group_id) {
      searchParams.set('groupId', cohort.group_id)
    }
    navigate(`/cohort?${searchParams.toString()}`)
  }

  const changeOrderBy = (newOrder: OrderBy) => {
    setOrder(newOrder)
    searchParams.set('orderBy', newOrder.orderBy)
    searchParams.set('direction', newOrder.orderDirection)
    setSearchParams(searchParams)
  }

  return (
    <Grid container gap="20px">
      {requestId && (
        <LevelHeader
          loading={requestLoading}
          name={parentRequest?.name ?? ''}
          hideActions={!deleteMode}
          description={parentRequest?.description ?? ''}
          actions={
            <>
              <IconButton>
                <EditIcon />
              </IconButton>
              <IconButton>
                <DeleteOutlineIcon />
              </IconButton>
              <Tooltip title="Partager la requête">
                <IconButton>
                  <ShareIcon />
                </IconButton>
              </Tooltip>
            </>
          }
        />
      )}

      {loading ? (
        <CircularProgress />
      ) : (
        <ResearchesTable
          columns={columns}
          page={page}
          setPage={handlePageChange}
          total={total}
          order={order}
          setOrder={(newOrder) => changeOrderBy(newOrder)}
        >
          {cohortsList.map((cohort: Cohort) => {
            const isExportable = appConfig.features.export.enabled ? cohort?.rights?.export_csv_nomi : false
            const actions = [
              {
                icon: <EditIcon />,
                label: 'Éditer',
                onclick: () => console.log('edit'),
                tooltip: '',
                disabled: maintenanceIsActive
              },
              {
                icon: <DeleteOutlineIcon />,
                label: 'Supprimer',
                onclick: () => console.log('delete'),
                tooltip: '',
                disabled: maintenanceIsActive
              }
            ]

            return (
              <TableRow key={cohort.name} onClick={() => onClickRow(cohort)} style={{ cursor: 'pointer' }}>
                <TableCellWrapper align="left" headCell>
                  <IconButton
                    onClick={(event) => {
                      event.stopPropagation()
                      editCohortMutation.mutate(
                        { ...cohort, favorite: !cohort.favorite },
                        { onError: () => console.log('erreur lors de ledition') }
                      )
                      // TODO: gérer en cas d'erreur (state message réinstauré?)
                    }}
                    disabled={maintenanceIsActive}
                  >
                    <FavStar
                      favorite={cohort.favorite}
                      height={20}
                      color={maintenanceIsActive ? '#CBCFCF' : undefined}
                    />
                  </IconButton>
                </TableCellWrapper>
                <TableCellWrapper align="left" headCell>
                  <Grid container alignItems={'center'}>
                    <Box display="flex" alignItems="center" maxWidth={'75%'}>
                      {cohort.name}
                    </Box>
                    <Box display={'flex'} alignItems={'center'}>
                      <Tooltip title={getExportTooltip(cohort, !!isExportable)}>
                        <IconButton
                          size="small"
                          onClick={(event) => {
                            event.stopPropagation()
                            // setSelectedExportableCohort(row ?? undefined)
                          }}
                          disabled={
                            !isExportable ||
                            !cohort.exportable ||
                            maintenanceIsActive ||
                            cohort.request_job_status === CohortJobStatus.LONG_PENDING ||
                            cohort.request_job_status === CohortJobStatus.FAILED ||
                            cohort.request_job_status === CohortJobStatus.PENDING
                          }
                        >
                          <Download fill={maintenanceIsActive ? '#CBCFCF' : 'black'} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={'Créer un échantillon à partir de la cohorte'}>
                        <IconButton
                          size="small"
                          onClick={(event) => {
                            event.stopPropagation()
                          }}
                          disabled={maintenanceIsActive}
                        >
                          <Picker stroke={maintenanceIsActive ? '#CBCFCF' : 'black'} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={'Accéder à la version de la requête ayant créé la cohorte'}>
                        <IconButton
                          size="small"
                          onClick={(event) => {
                            event.stopPropagation()
                            navigate(`/cohort/new/${cohort.request}/${cohort.request_query_snapshot}`)
                          }}
                          disabled={maintenanceIsActive}
                        >
                          <RequestTree fill={maintenanceIsActive ? '#CBCFCF' : 'black'} />
                        </IconButton>
                      </Tooltip>
                      <ActionMenu actions={actions} />
                    </Box>
                  </Grid>
                </TableCellWrapper>
                {!requestId && <TableCellWrapper>{cohort.request?.name}</TableCellWrapper>}
                <TableCellWrapper>
                  {getCohortStatusChip(cohort.request_job_status, cohort.request_job_fail_msg)}
                </TableCellWrapper>
                <TableCellWrapper>{displayDigit(cohort.result_size)}</TableCellWrapper>
                <TableCellWrapper>{getGlobalEstimation(cohort)}</TableCellWrapper>
                <TableCellWrapper>{formatDate(cohort.created_at, true)}</TableCellWrapper>
                {/* TODO: rendre non cliquable si pas d'enfant dispo */}
                <TableCellWrapper>
                  <Button
                    endIcon={<ArrowRightAltIcon />}
                    clearVariant
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
                </TableCellWrapper>
              </TableRow>
            )
          })}
        </ResearchesTable>
      )}
    </Grid>
  )
}

export default CohortsList
