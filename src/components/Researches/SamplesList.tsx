import React /*, { useState } */ from 'react'
// import {} from 'state'

// import { Grid, TableRow, Typography } from '@mui/material'
// import ResearchesTable from './ResearchesTable'
// import { useSearchParams } from 'react-router-dom'
// import { Column } from 'types'
// import { formatDate } from 'utils/formatDate'
// import FavStar from 'components/ui/FavStar'
// import displayDigit from 'utils/displayDigit'
// import { TableCellWrapper } from './ResearchesTable/styles'

// TODO: prévoir le tableau en cas de maintenance

const SamplesList = () => {
  // const [searchParams, setSearchParams] = useSearchParams()
  // const searchInput = searchParams.get('searchInput') ?? ''
  // const startDate = searchParams.get('startDate') ?? undefined
  // const endDate = searchParams.get('endDate') ?? undefined
  // const page = parseInt(searchParams.get('page') ?? '1', 10)

  // TODO: add les params pour les filtres exclusifs aux cohortes + bien penser à les suppr en changeant d'onglet
  // TODO: ne pas oublier les websockets

  // const columns: Column[] = [
  //   { label: '', align: 'left' },
  //   { label: "nom de l'échantillon", align: 'left' },
  //   { label: 'cohorte parent' }, // TODO: conditionner à si onglet échantillons
  //   { label: 'statut' },
  //   { label: 'nb de patients' },
  //   { label: 'pourcentage du total' },
  //   { label: 'date de création' }
  // ]

  return (
    <p>Decommenter le code</p>
    // <Grid container gap="50px">
    //   <Typography>SamplesList</Typography>

    //   <ResearchesTable columns={columns}>
    //     {samples.map((cohort) => (
    //       <TableRow key={cohort.name} sx={{ borderBottom: '1px solid #000', borderRadius: 20, cursor: 'pointer' }}>
    //         <TableCellWrapper align="left" accentcell>
    //           <FavStar favorite={cohort.fav} />
    //         </TableCellWrapper>
    //         <TableCellWrapper align="left">{cohort.name} *icônes action*</TableCellWrapper>
    //         <TableCellWrapper>{cohort.parentCohort}</TableCellWrapper>
    //         <TableCellWrapper>{cohort.status}</TableCellWrapper>
    //         {/* <TableCellWrapper>{displayDigit(cohort.totalPatients)}</TableCellWrapper> */}
    //         <TableCellWrapper>{cohort.percentage}</TableCellWrapper>
    //         <TableCellWrapper>{formatDate(cohort.creationDate)}</TableCellWrapper>
    //       </TableRow>
    //     ))}
    //   </ResearchesTable>
    // </Grid>
  )
}

export default SamplesList
