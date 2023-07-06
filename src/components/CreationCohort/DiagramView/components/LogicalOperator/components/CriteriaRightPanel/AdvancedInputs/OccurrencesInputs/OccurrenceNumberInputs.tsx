import React, { useEffect, useMemo, useState } from 'react'

import { FormLabel, Grid, MenuItem, Select, TextField, Tooltip } from '@mui/material'
import InfoIcon from '@mui/icons-material/Info'

import { CriteriaName, CriteriaNameType } from 'types'

const defaultOccurrencesNumberInputs = {
  code: [],
  isLeaf: false,
  valueMin: 1,
  valueMax: 99999,
  valueComparator: '>=',
  occurrence: 1,
  occurrenceComparator: '>=',
  startOccurrence: '',
  endOccurrence: '',
  isInclusive: true
}

const getMinForComparatorType = (comparator: string) => {
  console.log(comparator)
  if (comparator === '<') return 2
  return 1
}

type OccurrencesNumberInputsProps = {
  form: CriteriaNameType
  selectedCriteria: any
  onChangeValue: (key: string, value: any) => void
}

const OccurrencesNumberInputs: React.FC<OccurrencesNumberInputsProps> = (props) => {
  const { form, onChangeValue } = props
  const [invalidOccurrenceNumber, setInvalidOccurenceNumber] = useState(false)
  const selectedCriteria = { ...defaultOccurrencesNumberInputs, ...props.selectedCriteria }
  const minValue = useMemo(
    () => getMinForComparatorType(selectedCriteria.occurrenceComparator),
    [selectedCriteria.occurrenceComparator]
  )

  const _onChangeOccurenceNumber = (value: string) => {
    // this method prevent entering a number like "12" if the comparator is "<" since the first digit "1" is not valid
    // but this use case won't happen often i guess
    // also this can be got around by multiples ways (copy/paste, using the arrows, selecting comparator <= first, etc.)
    try {
      const occNumber = parseInt(value)
      if (occNumber < minValue) {
        setInvalidOccurenceNumber(true)
        return
      }
      setInvalidOccurenceNumber(false)
      onChangeValue('occurrence', occNumber)
    } catch (error) {
      // should never happen because of the input type and the keypress filter
    }
  }

  useEffect(() => {
    if (selectedCriteria.occurrence < minValue) {
      onChangeValue('occurrence', minValue)
      return
    }
  }, [selectedCriteria.occurrenceComparator])

  return (
    <>
      <FormLabel style={{ padding: '0 1em 8px', display: 'flex', alignItems: 'center' }} component="legend">
        Nombre d'occurrences
        {(form == CriteriaName.Ccam ||
          form === CriteriaName.Cim10 ||
          form === CriteriaName.Ghm ||
          form == CriteriaName.Biology ||
          CriteriaName.VisitSupport) && (
          <Tooltip
            title={
              <>
                {
                  "Si vous choisissez un chapitre, le nombre d'occurrences ne s'applique pas sur un unique élément de ce chapitre, mais sur l'ensemble des éléments de ce chapitre."
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

      <Grid style={{ display: 'grid', gridTemplateColumns: '100px 1fr', alignItems: 'start', margin: '0 1em' }}>
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
          error={invalidOccurrenceNumber}
          InputProps={{
            inputProps: {
              min: minValue
            }
          }}
          helperText={invalidOccurrenceNumber && `Le nombre d’occurrences doit être supérieur ou égal à ${minValue}`}
          type="number"
          id="criteria-occurrence-required"
          value={selectedCriteria.occurrence}
          onChange={(e) => _onChangeOccurenceNumber(e.target.value)}
        />
      </Grid>
    </>
  )
}

export default OccurrencesNumberInputs
