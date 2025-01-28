import React, { useContext } from 'react'
import { useAppSelector } from 'state'

import { Box, CircularProgress, Grid, IconButton, TableRow, Tooltip, Typography } from '@mui/material'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import ResearchesTable from './Table'
import { Cohort, CohortJobStatus, Column } from 'types'
import { TableCellWrapper } from 'components/ui/TableCell/styles'
import Button from 'components/ui/Button'
import ArrowRightAltIcon from '@mui/icons-material/ArrowRightAlt'
import { formatDate } from 'utils/formatDate'
import FavStar from 'components/ui/FavStar'
import displayDigit from 'utils/displayDigit'
import { AppConfig } from 'config'
import RequestTree from 'assets/icones/schema.svg?react'
import Download from 'assets/icones/download.svg?react'
import Picker from 'assets/icones/color-picker.svg?react'
import EditIcon from '@mui/icons-material/Edit'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import ActionMenu from './ActionMenu'
import useRequest from '../hooks/useRequest'
import useCohorts from '../hooks/useCohorts'
import StatusChip from './StatusChip'
import UpdateIcon from '@mui/icons-material/Update'
import useCohortsWebSocket from '../hooks/useCohortsWebSocket'
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

const CohortsList = () => {
  const appConfig = useContext(AppConfig)
  const navigate = useNavigate()
  const { projectId, requestId } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  const searchInput = searchParams.get('searchInput') ?? ''
  const startDate = searchParams.get('startDate') ?? undefined
  const endDate = searchParams.get('endDate') ?? undefined
  const page = parseInt(searchParams.get('page') ?? '1', 10)
  const maintenanceIsActive = useAppSelector((state) => state?.me?.maintenance?.active ?? false)

  const { request: parentRequest, requestLoading, requestIsError } = useRequest(requestId)
  const { cohortsList, total, loading } = useCohorts(requestId ?? '', searchInput, startDate, endDate)
  useCohortsWebSocket()

  // TODO: add les params pour les filtres exclusifs aux cohortes + bien penser à les suppr en changeant d'onglet

  const columns: Column[] = [
    { label: '', align: 'left' },
    { label: 'nom de la cohorte', align: 'left' },
    ...(!requestId ? [{ label: 'requête parent' }] : []), //TODO: cliquable ou pas?
    { label: 'statut' },
    { label: 'nb de patients' },
    { label: 'estimation du nombre de patients ap-hp' },
    { label: 'date de création' },
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

  return (
    <Grid container gap="20px">
      {requestId && (
        <Box display={'flex'} justifyContent={'center'} width={'100%'} alignItems={'center'}>
          <Typography fontWeight={'bold'} fontSize={'24px'} fontFamily={"'Montserrat', sans-serif"}>
            {parentRequest?.name}
          </Typography>
          <Typography>{parentRequest?.description}</Typography>
          {/* TODO: ajouter les actions sur projet parent */}
          <IconButton>
            <EditIcon />
          </IconButton>
          <IconButton>
            <DeleteOutlineIcon />
          </IconButton>
        </Box>
      )}

      {loading ? (
        <CircularProgress />
      ) : (
        <ResearchesTable columns={columns} page={page} setPage={handlePageChange} total={total}>
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
                      console.log('favorite')
                      // setSelectedExportableCohort(row ?? undefined)
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
                    onClick={() => {
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
