import React from 'react'

import {
  FormControl,
  FormLabel,
  Grid,
  IconButton,
  Input,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Tooltip
} from '@mui/material'

import ClearIcon from '@mui/icons-material/Clear'
import InfoIcon from '@mui/icons-material/Info'

import useStyles from './styles'
import { CriteriaName, CriteriaNameType } from 'types'

const defaultOccurrencesInputs = {
  code: [],
  isLeaf: false,
  valueMin: 0,
  valueMax: 0,
  valueComparator: '>=',
  occurrence: 1,
  occurrenceComparator: '>=',
  startOccurrence: '',
  endOccurrence: '',
  isInclusive: true
}

type OccurrenceInputsProps = {
  form: CriteriaNameType
  selectedCriteria: any
  onChangeValue: (key: string, value: any) => void
}

const OccurrenceInputs: React.FC<OccurrenceInputsProps> = (props) => {
  const { form, onChangeValue } = props
  const selectedCriteria = { ...defaultOccurrencesInputs, ...props.selectedCriteria }

  const classes = useStyles()

  return (
    <>
      <FormLabel style={{ padding: '0 1em 8px', display: 'flex', alignItems: 'center' }} component="legend">
        Nombre d'occurrence
        {(form == CriteriaName.Ccam ||
          form === CriteriaName.Cim10 ||
          form === CriteriaName.Ghm ||
          form == CriteriaName.Biology ||
          CriteriaName.VisitSupport) && (
          <Tooltip
            title={
              <>
                {
                  "Si vous choisissez un chapitre, le nombre d'occurrence ne s'applique pas sur un unique élément de ce chapitre, mais sur l'ensemble des éléments de ce chapitre."
                }
                <br />
                <br />
                {
                  "Exemple: Nombre d'occurrences >= 3 sur un chapitre signifie que l'on inclus les patients qui ont eu au moins 3 éléments de ce chapitre, distincts ou non"
                }
              </>
            }
          >
            <InfoIcon fontSize="small" color="primary" style={{ marginLeft: 4 }} />
          </Tooltip>
        )}
      </FormLabel>

      <Grid style={{ display: 'grid', gridTemplateColumns: '100px 1fr', alignItems: 'center', margin: '0 1em' }}>
        <Select
          style={{ marginRight: '1em' }}
          id="criteria-occurrenceComparator-select"
          value={selectedCriteria.occurrenceComparator}
          onChange={(event) => onChangeValue('occurrenceComparator', event.target.value as string)}
        >
          <MenuItem value={'<='}>{'<='}</MenuItem>
          <MenuItem value={'<'}>{'<'}</MenuItem>
          <MenuItem value={'='}>{'='}</MenuItem>
          <MenuItem value={'>'}>{'>'}</MenuItem>
          <MenuItem value={'>='}>{'>='}</MenuItem>
        </Select>

        <TextField
          required
          inputProps={{
            min: 1
          }}
          type="number"
          id="criteria-occurrence-required"
          value={selectedCriteria.occurrence}
          onChange={(e) => onChangeValue('occurrence', e.target.value)}
        />
      </Grid>

      <FormLabel style={{ padding: '1em 1em 0 1em' }} component="legend">
        Date d'occurrence
      </FormLabel>

      <Grid style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
        <FormControl className={classes.inputItem}>
          <InputLabel shrink htmlFor="date-start-occurrence">
            Après le
          </InputLabel>
          <Input
            id="date-start-occurrence"
            type="date"
            value={selectedCriteria.startOccurrence}
            endAdornment={
              <IconButton size="small" onClick={() => onChangeValue('startOccurrence', '')}>
                <ClearIcon />
              </IconButton>
            }
            onChange={(e) => onChangeValue('startOccurrence', e.target.value)}
          />
        </FormControl>

        <FormControl className={classes.inputItem}>
          <InputLabel shrink htmlFor="date-end-occurrence">
            Avant le
          </InputLabel>
          <Input
            id="date-end-occurrence"
            type="date"
            value={selectedCriteria.endOccurrence}
            endAdornment={
              <IconButton size="small" onClick={() => onChangeValue('endOccurrence', '')}>
                <ClearIcon />
              </IconButton>
            }
            onChange={(e) => onChangeValue('endOccurrence', e.target.value)}
          />
        </FormControl>
      </Grid>
    </>
  )
}

export default OccurrenceInputs
