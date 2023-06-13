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

const ProvenanceDestinationInputs: React.FC<AdmissionInputsProps> = ({ criteria, selectedCriteria, onChangeValue }) => {
  const { classes } = useStyles()
  const [checked, setCheck] = useState(true)

  const defaultValuesPriseEnChargeType = selectedCriteria.priseEnChargeType
    ? selectedCriteria.priseEnChargeType.map((priseEnChargeTypes: any) => {
        const criteriaPriseEnChargesTypes = criteria.data.priseEnChargeType
          ? criteria.data.priseEnChargeType.find((c: any) => c.id === priseEnChargeTypes.id)
          : null
        return {
          id: priseEnChargeTypes.id,
          label: priseEnChargeTypes.label ? priseEnChargeTypes.label : criteriaPriseEnChargesTypes?.label ?? '?'
        }
      })
    : []

  const defaultValuesTypeDeSejours = selectedCriteria.typeDeSejour
    ? selectedCriteria.typeDeSejour.map((typeDeSejours: any) => {
        const criteriaTypeDeSejours = criteria.data.typeDeSejour
          ? criteria.data.typeDeSejour.find((c: any) => c.id === typeDeSejours.id)
          : null
        return {
          id: typeDeSejours.id,
          label: typeDeSejours.label ? typeDeSejours.label : criteriaTypeDeSejours?.label ?? '?'
        }
      })
    : []

  const defaultValuesFileStatus = selectedCriteria.fileStatus
    ? selectedCriteria.fileStatus.map((fileStatus: any) => {
        const criteriaFileStatus = criteria.data.fileStatus
          ? criteria.data.fileStatus.find((c: any) => c.id === fileStatus.id)
          : null
        return {
          id: fileStatus.id,
          label: fileStatus.label ? fileStatus.label : criteriaFileStatus?.label ?? '?'
        }
      })
    : []
  return (
    <>
      <Grid container direction="column" className={classes.supportedInputsRoot}>
        <Grid
          item
          container
          direction="row"
          alignItems="center"
          style={{ padding: '1em' }}
          onClick={() => setCheck(!checked)}
        >
          <Typography style={{ cursor: 'pointer' }} variant="h6">
            Général
          </Typography>

          <IconButton size="small">
            {checked ? <KeyboardArrowUpIcon fontSize="small" /> : <KeyboardArrowDownIcon fontSize="small" />}
          </IconButton>
        </Grid>

        <Collapse in={checked} unmountOnExit>
          <Autocomplete
            multiple
            id="criteria-PriseEnChargeType-autocomplete"
            className={classes.inputItem}
            options={criteria?.data?.priseEnChargeType || []}
            getOptionLabel={(option) => option.label}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            value={defaultValuesPriseEnChargeType}
            onChange={(e, value) => onChangeValue('priseEnChargeType', value)}
            renderInput={(params) => <TextField {...params} label="Type de prise en charge" />}
          />

          <Autocomplete
            multiple
            id="criteria-TypeDeSejour-autocomplete"
            className={classes.inputItem}
            options={criteria?.data?.typeDeSejour || []}
            getOptionLabel={(option) => option.label}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            value={defaultValuesTypeDeSejours}
            onChange={(e, value) => onChangeValue('typeDeSejour', value)}
            renderInput={(params) => <TextField {...params} label="Type séjour" />}
          />

          <Autocomplete
            multiple
            id="criteria-FileStatus-autocomplete"
            className={classes.inputItem}
            options={criteria?.data?.fileStatus || []}
            getOptionLabel={(option) => option.label}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            value={defaultValuesFileStatus}
            onChange={(e, value) => onChangeValue('fileStatus', value)}
            renderInput={(params) => <TextField {...params} label="Statut dossier" />}
          />
        </Collapse>
      </Grid>
    </>
  )
}

export default ProvenanceDestinationInputs
