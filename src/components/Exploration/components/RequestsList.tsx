import React, { useState } from 'react'

import { Grid, TableRow, Typography } from '@mui/material'
import { useSearchParams } from 'react-router-dom'
import { Column } from 'types'
import ResearchesTable from './Table'
import { requests } from 'views/MyResearches/data'
import { TableCellWrapper } from 'components/ui/TableCell/styles'
import Button from 'components/ui/Button'
import ArrowRightAltIcon from '@mui/icons-material/ArrowRightAlt'

const RequestsList = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const searchInput = searchParams.get('searchInput') ?? ''
  const startDate = searchParams.get('startDate') ?? undefined
  const endDate = searchParams.get('endDate') ?? undefined
  const page = parseInt(searchParams.get('page') ?? '1', 10)

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

  return (
    <Grid container xs={11} gap="50px">
      <Typography>RequestsList</Typography>

      {/* TODO: add circular progress */}

      <ResearchesTable columns={columns}>
        {requests.map((request) => (
          <TableRow key={request.name} sx={{ borderBottom: '1px solid #000', borderRadius: 20 }}>
            <TableCellWrapper align="left" headCell>
              {request.name} *icônes action*
            </TableCellWrapper>
            <TableCellWrapper>{request.parentProject}</TableCellWrapper>
            <TableCellWrapper>{request.modificationDate}</TableCellWrapper>
            <TableCellWrapper>
              <Button endIcon={<ArrowRightAltIcon />} onClick={() => console.log('hey coucou')}>
                {request.cohortTotal} cohortes
              </Button>
            </TableCellWrapper>
          </TableRow>
        ))}
      </ResearchesTable>
    </Grid>
  )
}

export default RequestsList
