import React, { useContext, useState } from 'react'
import { useAppSelector } from 'state'

import { Box, Grid, IconButton, TableRow, Tooltip, Typography } from '@mui/material'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import ResearchesTable from './Table'
import { Cohort, CohortJobStatus, Column } from 'types'
import { TableCellWrapper } from 'components/ui/TableCell/styles'
import Button from 'components/ui/Button'
import ArrowRightAltIcon from '@mui/icons-material/ArrowRightAlt'
import { formatDate } from 'utils/formatDate'
import FavStar from 'components/ui/FavStar'
import useCohorts from '../hooks/useCohorts'
import displayDigit from 'utils/displayDigit'
import { AppConfig } from 'config'
import ExportIcon from '@mui/icons-material/GetApp'
import RequestTree from 'assets/icones/schema.svg?react'
import ColorizeIcon from '@mui/icons-material/Colorize'
import EditIcon from '@mui/icons-material/Edit'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import ActionMenu from './ActionMenu'
import useRequest from '../hooks/useRequest'

// TODO: il y a un hook useCohortsList, à checker à la rentrée

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

  // TODO: add les params pour les filtres exclusifs aux cohortes + bien penser à les suppr en changeant d'onglet
  // TODO: ne pas oublier les websockets

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

  const getExportTooltip = (cohort: Cohort, isExportable: boolean) => {
    if (!cohort.exportable) {
      return 'Cette cohorte ne peut pas être exportée car elle dépasse le seuil de nombre de patients maximum autorisé'
    } else if (!isExportable && cohort.request_job_status === CohortJobStatus.FINISHED) {
      return "Vous n'avez pas les droits suffisants pour exporter cette cohorte"
    } else if (cohort.request_job_status === CohortJobStatus.FAILED) {
      return 'Cette cohorte ne peut pas être exportée car elle a échoué lors de sa création'
    } else if (cohort.request_job_status === CohortJobStatus.PENDING) {
      return 'Cette cohorte ne peut pas être exportée car elle est en cours de création'
    } else {
      return 'Exporter la cohorte'
    }
  }

  const getGlobalEstimation = (cohort: Cohort) => {
    if (cohort.dated_measure_global) {
      if (cohort.dated_measure_global?.measure_min === null || cohort.dated_measure_global?.measure_max === null) {
        return 'N/A'
      } else {
        return `${displayDigit(cohort.dated_measure_global?.measure_min)} - ${displayDigit(
          cohort.dated_measure_global?.measure_max
        )}`
      }
    } else {
      return 'N/A'
    }
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
      {/* TODO: add circular progress */}

      <ResearchesTable columns={columns} page={page} setPage={handlePageChange} total={total}>
        {cohortsList.map((cohort) => {
          const isExportable = appConfig.features.export.enabled ? cohort?.rights?.export_csv_nomi : false
          const actions = [
            {
              icon: <EditIcon />,
              label: 'Éditer',
              onclick: () => console.log('edit'),
              tooltip: '',
              disabled: false
            },
            {
              icon: <DeleteOutlineIcon />,
              label: 'Supprimer',
              onclick: () => console.log('delete'),
              tooltip: '',
              disabled: false
            }
          ]

          return (
            <TableRow
              key={cohort.name}
              sx={{ borderBottom: '1px solid #000', borderRadius: 20 }}
              // onClick={() => onClickRow(cohort)}
            >
              <TableCellWrapper align="left" headCell>
                <IconButton
                  onClick={(event) => {
                    event.stopPropagation()
                    console.log('favorite')
                    // setSelectedExportableCohort(row ?? undefined)
                  }}
                >
                  <FavStar favorite={cohort.favorite} />
                </IconButton>
              </TableCellWrapper>
              <TableCellWrapper align="left" headCell>
                {cohort.name}
                <Box display="flex">
                  <Tooltip title={getExportTooltip(cohort, !!isExportable)}>
                    <div>
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
                        <ExportIcon />
                      </IconButton>
                    </div>
                  </Tooltip>
                  <Tooltip title={'Accéder à la version de la requête ayant créé la cohorte'}>
                    <div>
                      <IconButton
                        size="small"
                        onClick={(event) => {
                          event.stopPropagation()
                          navigate(`/cohort/new/${cohort.request}/${cohort.request_query_snapshot}`)
                        }}
                        disabled={maintenanceIsActive}
                      >
                        <RequestTree />
                      </IconButton>
                    </div>
                  </Tooltip>
                  <Tooltip title={'Créer un échantillon à partir de la cohorte'}>
                    <div>
                      <IconButton
                        size="small"
                        onClick={(event) => {
                          event.stopPropagation()
                        }}
                        disabled={maintenanceIsActive}
                      >
                        <ColorizeIcon />
                      </IconButton>
                    </div>
                  </Tooltip>
                  <ActionMenu actions={actions} />
                </Box>
              </TableCellWrapper>
              {!requestId && <TableCellWrapper>{cohort.request}</TableCellWrapper>}
              <TableCellWrapper>{cohort.request_job_status}</TableCellWrapper>
              <TableCellWrapper>{displayDigit(cohort.result_size)}</TableCellWrapper>
              <TableCellWrapper>{getGlobalEstimation(cohort)}</TableCellWrapper>
              <TableCellWrapper>{formatDate(cohort.created_at, true)}</TableCellWrapper>
              <TableCellWrapper>
                {/* TODO: rendre non cliquable si pas d'enfant dispo */}
                <Button
                  // endIcon={cohortTotal >= 1 && <ArrowRightAltIcon />}
                  onClick={() =>
                    // TODO: pourquoi le preventDefault ne fonctionne pas ?
                    {
                      if (projectId && requestId)
                        navigate(`/researches/projects/${projectId}/${requestId}/${cohort.uuid}${location.search}`)
                      if (!projectId && requestId)
                        navigate(`/researches/requests/${requestId}/${cohort.uuid}${location.search}`)
                      if (!projectId && !requestId) navigate(`/researches/cohorts/${cohort.uuid}${location.search}`)
                    }
                  }
                >
                  0 échantillon
                </Button>
              </TableCellWrapper>
            </TableRow>
          )
        })}
      </ResearchesTable>
    </Grid>
  )
}

export default CohortsList
