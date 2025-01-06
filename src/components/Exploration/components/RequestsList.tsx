import React, { useState } from 'react'

import { CircularProgress, Grid, TableRow, Typography } from '@mui/material'
import { useParams, useSearchParams } from 'react-router-dom'
import { Column } from 'types'
import ResearchesTable from './Table'
import { TableCellWrapper } from 'components/ui/TableCell/styles'
import Button from 'components/ui/Button'
import ArrowRightAltIcon from '@mui/icons-material/ArrowRightAlt'
import useRequests from '../hooks/useRequests'

const RequestsList = () => {
  const { projectId } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  const searchInput = searchParams.get('searchInput') ?? ''
  const startDate = searchParams.get('startDate') ?? undefined
  const endDate = searchParams.get('endDate') ?? undefined
  const page = parseInt(searchParams.get('page') ?? '1', 10)

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

  const getCohortTotal = (requestSnapshots: any[]) => {
    const snapshotsWithLinkedCohorts = requestSnapshots.filter((snapshot) => snapshot.has_linked_cohorts === true)
    return snapshotsWithLinkedCohorts.length
  }

  return (
    <Grid container xs={11} gap="50px">
      <Typography>RequestsList</Typography>

      {/* TODO: add circular progress */}
      {loading ? (
        <CircularProgress />
      ) : (
        <ResearchesTable columns={columns} page={page} setPage={handlePageChange} total={total}>
          {requestsList.map((request) => {
            const cohortTotal = getCohortTotal(request.query_snapshots)

            return (
              <TableRow key={request.uuid} sx={{ borderBottom: '1px solid #000', borderRadius: 20 }}>
                <TableCellWrapper align="left" headCell>
                  {request.name} *icônes action*
                </TableCellWrapper>
                <TableCellWrapper>{request.parent_folder}</TableCellWrapper>
                <TableCellWrapper>{request.created_at}</TableCellWrapper>
                <TableCellWrapper>
                  {/* TODO: rendre non cliquable si pas d'enfant dispo */}
                  <Button endIcon={cohortTotal >= 1 && <ArrowRightAltIcon />} onClick={() => console.log('hey coucou')}>
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
