import React, { ReactNode, useState } from 'react'

import useStyles from './styles'
import { Button, Grid } from '@mui/material'
import PatientFilters from 'components/Filters/PatientFilters/PatientFilters'
import { PatientFilters as PatientFiltersType } from 'types'

type FiltersProps = {
  label: string
  icon: ReactNode
  onChangeFilters: (newFilters: PatientFiltersType) => void
}

const Filters = ({ label, icon }: FiltersProps) => {
  const { classes } = useStyles()
  const [open, setOpen] = useState(false)

  return (
    <>
      <Grid id="DTTB_btn">
        <Button
          variant="contained"
          disableElevation
          onClick={() => setOpen(true)}
          startIcon={icon}
          className={classes.searchButton}
        >
          {label}
        </Button>
      </Grid>
      {/*<PatientFilters open={open} onClose={() => setOpen(false)} />*/}
    </>
  )
}

export default Filters
