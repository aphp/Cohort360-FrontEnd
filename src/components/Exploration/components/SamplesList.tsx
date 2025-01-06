import React, { useState } from 'react'
import {} from 'state'

import { Grid, TableRow, Typography } from '@mui/material'
import ResearchesTable from './Table'
import { TableCellWrapper } from 'components/ui/TableCell/styles'
import { useSearchParams } from 'react-router-dom'
import { Column } from 'types'
import { samples } from 'views/MyResearches/data'

const SamplesList = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const searchInput = searchParams.get('searchInput') ?? ''
  const startDate = searchParams.get('startDate') ?? undefined
  const endDate = searchParams.get('endDate') ?? undefined
  const page = parseInt(searchParams.get('page') ?? '1', 10)

  // TODO: add les params pour les filtres exclusifs aux cohortes + bien penser à les suppr en changeant d'onglet
  // TODO: ne pas oublier les websockets

  const columns: Column[] = [
    { label: '', align: 'left' },
    { label: "nom de l'échantillon *icones d'action*", align: 'left' },
    { label: 'cohorte parent' }, // TODO: conditionner à si onglet échantillons, cliquable ou pas?
    { label: 'statut' },
    { label: 'nb de patients' },
    { label: 'pourcentage du total' }, // TODO: conditionner à si niveau échantillons
    { label: 'date de création' }
  ]

  return (
    <Grid container xs={11} gap="50px">
      <Typography>SamplesList</Typography>

      <ResearchesTable columns={columns}>
        {samples.map((cohort) => (
          <TableRow key={cohort.name} sx={{ borderBottom: '1px solid #000', borderRadius: 20 }}>
            <TableCellWrapper align="left" headCell>
              *favicon*
            </TableCellWrapper>
            <TableCellWrapper align="left" headCell>
              {cohort.name} *icônes action*
            </TableCellWrapper>
            <TableCellWrapper>{cohort.parentCohort}</TableCellWrapper>
            <TableCellWrapper>{cohort.status}</TableCellWrapper>
            <TableCellWrapper>{cohort.totalPatients}</TableCellWrapper>
            <TableCellWrapper>{cohort.percentage}</TableCellWrapper>
            <TableCellWrapper>{cohort.creationDate}</TableCellWrapper>
          </TableRow>
        ))}
      </ResearchesTable>
    </Grid>
  )
}

export default SamplesList
