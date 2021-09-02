import React, { useState } from 'react'

import { Autocomplete } from '@material-ui/lab'
import { Collapse, Grid, IconButton, Typography, TextField } from '@material-ui/core'

import KeyboardArrowUpIcon from '@material-ui/icons/KeyboardArrowUp'
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown'

import useStyles from '../../styles'

type AdmissionInputsProps = {
  criteria: any
  selectedCriteria: any
  onChangeValue: (key: string, value: any) => void
}

const ProvenanceDestinationInputs: React.FC<AdmissionInputsProps> = ({ criteria, selectedCriteria, onChangeValue }) => {
  const classes = useStyles()
  const [checked, setCheck] = useState(true)

  const defaultValuesDestination = selectedCriteria.destination
    ? selectedCriteria.destination.map((destination: any) => {
        const criteriaDestination = criteria.data.destination
          ? criteria.data.destination.find((c: any) => c.id === destination.id)
          : null
        return {
          id: destination.id,
          label: destination.label ? destination.label : criteriaDestination?.label ?? '?'
        }
      })
    : []

  const defaultValuesProvenance = selectedCriteria.provenance
    ? selectedCriteria.provenance.map((provenance: any) => {
        const criteriaProvenance = criteria.data.provenance
          ? criteria.data.provenance.find((c: any) => c.id === provenance.id)
          : null
        return {
          id: provenance.id,
          label: provenance.label ? provenance.label : criteriaProvenance?.label ?? '?'
        }
      })
    : []

  return (
    <>
      <Grid container direction="column">
        <Grid
          item
          container
          direction="row"
          alignItems="center"
          style={{ padding: '1em' }}
          onClick={() => setCheck(!checked)}
        >
          <Typography style={{ cursor: 'pointer' }} variant="h6">
            Destination / Provenance
          </Typography>

          <IconButton size="small">
            {checked ? <KeyboardArrowUpIcon fontSize="small" /> : <KeyboardArrowDownIcon fontSize="small" />}
          </IconButton>
        </Grid>

        <Collapse in={checked} unmountOnExit>
          <Autocomplete
            multiple
            id="criteria-destination-autocomplete"
            className={classes.inputItem}
            options={criteria?.data?.destination || []}
            getOptionLabel={(option) => option.label}
            getOptionSelected={(option, value) => option.id === value.id}
            value={defaultValuesDestination}
            onChange={(e, value) => onChangeValue('destination', value)}
            renderInput={(params) => <TextField {...params} variant="outlined" label="Destination" />}
          />

          <Autocomplete
            multiple
            id="criteria-provenance-autocomplete"
            className={classes.inputItem}
            options={criteria?.data?.provenance || []}
            getOptionLabel={(option) => option.label}
            getOptionSelected={(option, value) => option.id === value.id}
            value={defaultValuesProvenance}
            onChange={(e, value) => onChangeValue('provenance', value)}
            renderInput={(params) => <TextField {...params} variant="outlined" label="Provenance" />}
          />
        </Collapse>
      </Grid>
    </>
  )
}

export default ProvenanceDestinationInputs
