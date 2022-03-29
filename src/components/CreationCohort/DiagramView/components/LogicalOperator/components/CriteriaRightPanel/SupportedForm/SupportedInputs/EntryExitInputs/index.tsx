import React, { useState } from 'react'

import { Autocomplete } from '@material-ui/lab'
import { Collapse, Grid, IconButton, Typography, TextField } from '@material-ui/core'

import KeyboardArrowUpIcon from '@material-ui/icons/KeyboardArrowUp'
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown'

import useStyles from '../../styles'

type EntryExitInputsProps = {
  criteria: any
  selectedCriteria: any
  onChangeValue: (key: string, value: any) => void
}

const EntryExitInputs: React.FC<EntryExitInputsProps> = ({ criteria, selectedCriteria, onChangeValue }) => {
  const classes = useStyles()
  const [checked, setCheck] = useState(true)

  const defaultValuesEntryModes = selectedCriteria.entryMode
    ? selectedCriteria.entryMode.map((entryModes: any) => {
        const criteriaEntryModes = criteria.data.entryModes
          ? criteria.data.entryModes.find((c: any) => c.id === entryModes.id)
          : null
        return {
          id: entryModes.id,
          label: entryModes.label ? entryModes.label : criteriaEntryModes?.label ?? '?'
        }
      })
    : []

  const defaultValuesExitModes = selectedCriteria.exitMode
    ? selectedCriteria.exitMode.map((exitModes: any) => {
        const criteriaExitModes = criteria.data.exitModes
          ? criteria.data.exitModes.find((c: any) => c.id === exitModes.id)
          : null
        return {
          id: exitModes.id,
          label: exitModes.label ? exitModes.label : criteriaExitModes?.label ?? '?'
        }
      })
    : []

  const defaultValuesReason = selectedCriteria.reason
    ? selectedCriteria.reason.map((reason: any) => {
        const criteriareason = criteria.data.reason ? criteria.data.reason.find((dt: any) => dt.id === reason.id) : null
        return {
          id: reason.id,
          label: reason.label ? reason.label : criteriareason?.label ?? '?'
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
            Entrée / Sortie
          </Typography>

          <IconButton size="small">
            {checked ? <KeyboardArrowUpIcon fontSize="small" /> : <KeyboardArrowDownIcon fontSize="small" />}
          </IconButton>
        </Grid>

        <Collapse in={checked} unmountOnExit>
          <Autocomplete
            multiple
            id="criteria-entryMode-autocomplete"
            className={classes.inputItem}
            options={criteria?.data?.entryModes || []}
            getOptionLabel={(option) => option.label}
            getOptionSelected={(option, value) => option.id === value.id}
            value={defaultValuesEntryModes}
            onChange={(e, value) => onChangeValue('entryMode', value)}
            renderInput={(params) => <TextField {...params} variant="outlined" label="Mode entrée" />}
          />

          <Autocomplete
            multiple
            id="criteria-exitMode-autocomplete"
            className={classes.inputItem}
            options={criteria?.data?.exitModes || []}
            getOptionLabel={(option) => option.label}
            getOptionSelected={(option, value) => option.id === value.id}
            value={defaultValuesExitModes}
            onChange={(e, value) => onChangeValue('exitMode', value)}
            renderInput={(params) => <TextField {...params} variant="outlined" label="Mode sortie" />}
          />

          <Autocomplete
            multiple
            id="criteria-reason-autocomplete"
            className={classes.inputItem}
            options={criteria?.data?.reason || []}
            getOptionLabel={(option) => option.label}
            getOptionSelected={(option, value) => option.id === value.id}
            value={defaultValuesReason}
            onChange={(e, value) => onChangeValue('reason', value)}
            renderInput={(params) => <TextField {...params} variant="outlined" label="Type sortie" />}
          />
        </Collapse>
      </Grid>
    </>
  )
}

export default EntryExitInputs
