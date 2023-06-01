import React from 'react'

import { FormLabel, Grid, MenuItem, Select, TextField, Tooltip } from '@mui/material'
import InfoIcon from '@mui/icons-material/Info'

import useStyles from './styles'
import { CriteriaName, CriteriaNameType } from 'types'

const defaultOccurrencesNumberInputs = {
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

type OccurrencesNumberInputsProps = {
  form: CriteriaNameType
  selectedCriteria: any
  onChangeValue: (key: string, value: any) => void
}

const OccurrencesNumberInputs: React.FC<OccurrencesNumberInputsProps> = (props) => {
  const { form, onChangeValue } = props
  const selectedCriteria = { ...defaultOccurrencesNumberInputs, ...props.selectedCriteria }

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
    </>
  )
}

export default OccurrencesNumberInputs
