import React, { useState } from 'react'

import { Box, CircularProgress, Grid, IconButton, TableRow, Tooltip, Typography } from '@mui/material'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { Column, QuerySnapshotInfo, RequestType } from 'types'
import ResearchesTable from './Table'
import { TableCellWrapper } from 'components/ui/TableCell/styles'
import Button from 'components/ui/Button'
import ArrowRightAltIcon from '@mui/icons-material/ArrowRightAlt'
import useRequests from '../hooks/useRequests'
import { formatDate } from 'utils/formatDate'
import { Delete, Edit } from '@mui/icons-material'
import ActionMenu from './ActionMenu'
import EditIcon from '@mui/icons-material/Edit'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import ShareIcon from '@mui/icons-material/Share'
import { useAppDispatch, useAppSelector } from 'state'
import { setSelectedRequestShare } from 'state/request'

// TODO: J'AVAIS OUBLIÉ MAIS PRÉVOIR LE SUPER FLOW DE DÉLÉTION MULTIPLE

const RequestsList = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { projectId } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  const searchInput = searchParams.get('searchInput') ?? ''
  const startDate = searchParams.get('startDate') ?? undefined
  const endDate = searchParams.get('endDate') ?? undefined
  const page = parseInt(searchParams.get('page') ?? '1', 10)
  const maintenanceIsActive = useAppSelector((state) => state?.me?.maintenance?.active ?? false)

  const { requestsList, total, loading } = useRequests(projectId, searchInput, startDate, endDate, page)

  const handlePageChange = (newPage: number) => {
    searchParams.set('page', String(newPage))
    setSearchParams(searchParams)
  }

  const columns: Column[] = [
    { label: 'nom de la requête', align: 'left' },
    { label: 'projet' }, // TODO: conditionner à si onglet requêtes + réfléchir si cliquable ou pas?
    { label: 'date de modification' },
    { label: 'nb de cohortes' }
  ]

  const getCohortTotal = (requestSnapshots?: QuerySnapshotInfo[]) => {
    if (!requestSnapshots) {
      return 0
    }
    const snapshotsWithLinkedCohorts = requestSnapshots.filter((snapshot) => snapshot.has_linked_cohorts === true)
    return snapshotsWithLinkedCohorts.length
  }

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

  const onShareRequest = (requestId: string) => {
    // TODO: pas sûre de garder l'ancien comportement (pq utiliser le store?)
    dispatch(setSelectedRequestShare({ uuid: requestId, name: '' }))
  }

  const getRequestName = (request: RequestType) => {
    const sharedByDetails = request.shared_by?.display_name ? ` - Envoyée par : ${request.shared_by?.display_name}` : ''
    return `${request.name}${sharedByDetails}`
  }

  return (
    <Grid container gap="20px">
      {/* TODO: n'afficher que si onglet projets */}
      {/* TODO: fetch le nom du projet */}
      <Box display={'flex'} justifyContent={'center'} width={'100%'} alignItems={'center'}>
        <Typography fontWeight={'bold'} fontSize={'24px'} fontFamily={"'Montserrat', sans-serif"}>
          RequestsList
        </Typography>
        {/* TODO: ajouter les actions sur projet parent */}
        <IconButton>
          <Edit />
        </IconButton>
        <IconButton>
          <Delete />
        </IconButton>
      </Box>

      {/* TODO: add circular progress */}
      {loading ? (
        <CircularProgress />
      ) : (
        <ResearchesTable columns={columns} page={page} setPage={handlePageChange} total={total}>
          {requestsList.map((request) => {
            const cohortTotal = getCohortTotal(request.query_snapshots)

            return (
              <TableRow
                key={request.uuid}
                sx={{ borderBottom: '1px solid #000', borderRadius: 20 }}
                onClick={() => navigate(`/cohort/new/${request.uuid}`)}
              >
                <TableCellWrapper align="left" headCell>
                  {getRequestName(request)}
                  <Tooltip title="Partager la requête">
                    <IconButton
                      // className={classes.editButton}
                      size="small"
                      onClick={() => onShareRequest(request.uuid)}
                      disabled={maintenanceIsActive}
                    >
                      <ShareIcon />
                    </IconButton>
                  </Tooltip>
                  <ActionMenu actions={actions} />
                </TableCellWrapper>
                <TableCellWrapper>{request.parent_folder}</TableCellWrapper>
                <TableCellWrapper>{formatDate(request.created_at, true)}</TableCellWrapper>
                <TableCellWrapper>
                  {/* TODO: rendre non cliquable si pas d'enfant dispo */}
                  <Button
                    endIcon={cohortTotal >= 1 && <ArrowRightAltIcon />}
                    onClick={() =>
                      // TODO: gérer où on navigate en fonction de l'onglet où l'on se trouve
                      // à obtenir à partir de l'url
                      navigate('')
                    }
                  >
                    {cohortTotal} cohorte{cohortTotal > 1 && 's'}
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

export default RequestsList
