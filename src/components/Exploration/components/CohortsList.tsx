import React, { useState } from 'react'
import {} from 'state'

import { Grid, TableRow, Typography } from '@mui/material'
import { useSearchParams } from 'react-router-dom'
import ResearchesTable from './Table'
import { Column } from 'types'
import { cohorts } from 'views/MyResearches/data'
import { TableCellWrapper } from 'components/ui/TableCell/styles'
import Button from 'components/ui/Button'
import ArrowRightAltIcon from '@mui/icons-material/ArrowRightAlt'

// TODO: il y a un hook useCohortsList, à checker à la rentrée

const CohortsList = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const searchInput = searchParams.get('searchInput') ?? ''
  const startDate = searchParams.get('startDate') ?? undefined
  const endDate = searchParams.get('endDate') ?? undefined
  const page = parseInt(searchParams.get('page') ?? '1', 10)

  // TODO: add les params pour les filtres exclusifs aux cohortes + bien penser à les suppr en changeant d'onglet
  // TODO: ne pas oublier les websockets

  const columns: Column[] = [
    { label: '', align: 'left' },
    { label: 'nom de la cohorte', align: 'left' },
    { label: 'requête parent', align: 'left' }, // TODO: conditionner à si onglet cohortes, cliquable ou pas?
    { label: 'statut' },
    { label: 'nb de patients' },
    { label: 'estimation du nombre de patients ap-hp' },
    { label: 'date de création' },
    { label: 'échantillons' } // TODO: conditionner à si niveau cohortes
  ]

  return (
    <Grid container xs={11} gap="50px">
      <Typography>CohortsList</Typography>

      {/* TODO: add circular progress */}

      <ResearchesTable columns={columns}>
        {cohorts.map((cohort) => (
          <TableRow key={cohort.name} sx={{ borderBottom: '1px solid #000', borderRadius: 20 }}>
            <TableCellWrapper align="left" headCell>
              *favicon*
            </TableCellWrapper>
            <TableCellWrapper align="left" headCell>
              {cohort.name} *icônes action*
            </TableCellWrapper>
            <TableCellWrapper>{cohort.parentRequest}</TableCellWrapper>
            <TableCellWrapper>{cohort.status}</TableCellWrapper>
            <TableCellWrapper>{cohort.totalPatients}</TableCellWrapper>
            <TableCellWrapper>{cohort.aphpEstimation}</TableCellWrapper>
            <TableCellWrapper>{cohort.creationDate}</TableCellWrapper>
            <TableCellWrapper>
              <Button endIcon={<ArrowRightAltIcon />} onClick={() => console.log('hey coucou')}>
                {cohort.samples} échantillons
              </Button>
            </TableCellWrapper>
          </TableRow>
        ))}
      </ResearchesTable>
    </Grid>
  )
}

export default CohortsList
