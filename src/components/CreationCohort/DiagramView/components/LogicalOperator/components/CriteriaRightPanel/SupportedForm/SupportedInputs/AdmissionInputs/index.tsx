import React, { useState } from 'react'

import { Autocomplete, Collapse, Grid, IconButton, Typography, TextField } from '@mui/material'

import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'

import useStyles from '../../styles'

type AdmissionInputsProps = {
  criteria: any
  selectedCriteria: any
  onChangeValue: (key: string, value: any) => void
}

const AdmissionInputs: React.FC<AdmissionInputsProps> = ({ criteria, selectedCriteria, onChangeValue }) => {
  const classes = useStyles()
  const [checked, setCheck] = useState(true)

  const defaultValuesAdmissionModes = selectedCriteria.admissionMode
    ? selectedCriteria.admissionMode.map((admissionMode: any) => {
        const criteriaAdmissionModes = criteria.data.admissionModes
          ? criteria.data.admissionModes.find((c: any) => c.id === admissionMode.id)
          : null
        return {
          id: admissionMode.id,
          label: admissionMode.label ? admissionMode.label : criteriaAdmissionModes?.label ?? '?'
        }
      })
    : []

  const defaultValuesAdmission = selectedCriteria.admission
    ? selectedCriteria.admission.map((admission: any) => {
        const criteriaAdmission = criteria.data.admission
          ? criteria.data.admission.find((c: any) => c.id === admission.id)
          : null
        return {
          id: admission.id,
          label: admission.label ? admission.label : criteriaAdmission?.label ?? '?'
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
            Admission
          </Typography>

          <IconButton size="small">
            {checked ? <KeyboardArrowUpIcon fontSize="small" /> : <KeyboardArrowDownIcon fontSize="small" />}
          </IconButton>
        </Grid>

        <Collapse in={checked} unmountOnExit>
          <Autocomplete
            multiple
            id="criteria-admissionMode-autocomplete"
            className={classes.inputItem}
            options={criteria?.data?.admissionModes || []}
            getOptionLabel={(option) => option.label}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            value={defaultValuesAdmissionModes}
            onChange={(e, value) => onChangeValue('admissionMode', value)}
            renderInput={(params) => <TextField {...params} label="Motif Admission" />}
          />

          <Autocomplete
            multiple
            id="criteria-admission-autocomplete"
            className={classes.inputItem}
            options={criteria?.data?.admission || []}
            getOptionLabel={(option) => option.label}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            value={defaultValuesAdmission}
            onChange={(e, value) => onChangeValue('admission', value)}
            renderInput={(params) => <TextField {...params} label="Type Admission" />}
          />
        </Collapse>
      </Grid>
    </>
  )
}

export default AdmissionInputs
