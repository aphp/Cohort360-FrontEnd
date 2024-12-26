import React, { useState } from 'react'
import {} from 'state'

import { Box, Grid, TableRow, Typography } from '@mui/material'

const SamplesList = () => {
  return (
    <Typography>SamplesList</Typography>

    /* <Grid container xs={11} gap="50px">
          <DataTable columns={cohortColumns}>
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
                <TableCellWrapper>{cohort.creationDate}</TableCellWrapper>
                <TableCellWrapper>{cohort.totalPatients}</TableCellWrapper>
                <TableCellWrapper>{cohort.aphpEstimation}</TableCellWrapper>
                <TableCellWrapper>{cohort.creationDate}</TableCellWrapper>
                <TableCellWrapper>
                  <Button endIcon={<ArrowRightAltIcon />}>{cohort.samples} cohortes</Button>
                </TableCellWrapper>
              </TableRow>
            ))}
        </Grid> */
  )
}

export default SamplesList
