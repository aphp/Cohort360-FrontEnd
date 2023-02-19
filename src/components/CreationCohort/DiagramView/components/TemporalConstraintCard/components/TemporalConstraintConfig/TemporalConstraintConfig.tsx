import React, { useState } from 'react'

import {
  Button,
  Checkbox,
  Grid,
  MenuItem,
  InputBase,
  InputLabel,
  Select,
  Typography,
  FormControl
} from '@material-ui/core'
import AddIcon from '@material-ui/icons/Add'

import { useAppSelector, useAppDispatch } from 'state'
import { buildCohortCreation, addTemporalConstraint } from 'state/cohortCreation'

import useStyles from './styles'

const timeMesurements = [
  {
    id: 'years',
    display: 'années'
  },
  {
    id: 'months',
    display: 'mois'
  },
  {
    id: 'days',
    display: 'jours'
  },
  {
    id: 'hours',
    display: 'heures'
  }
]

const TemporalConstraintConfig: React.FC = () => {
  const { selectedCriteria } = useAppSelector((state) => state.cohortCreation.request)

  const [firstCriteriaValue, setFirstCriteriaValue] = useState<number>(0)
  const [secondCriteriaValue, setSecondCriteriaValue] = useState<number>(0)
  const [isFirstTimeValueChecked, setIsFirstTimeValueChecked] = useState<boolean>(false)
  const [isSecondTimeValueChecked, setIsSecondTimeValueChecked] = useState<boolean>(false)
  const [minTimeMesurement, setMinTimeMesurement] = useState<string>('days')
  const [maxTimeMesurement, setMaxTimeMesurement] = useState<string>('days')
  const [minTime, setMinTime] = useState<number>(0)
  const [maxTime, setMaxTime] = useState<number>(0)
  const [minYearsTimeValue, setMinYearsTimeValue] = useState<number>(0)
  const [maxYearsTimeValue, setMaxYearsTimeValue] = useState<number>(0)
  const [minMonthsTimeValue, setMinMonthsTimeValue] = useState<number>(0)
  const [maxMonthsTimeValue, setMaxMonthsTimeValue] = useState<number>(0)
  const [minDaysTimeValue, setMinDaysTimeValue] = useState<number>(0)
  const [maxDaysTimeValue, setMaxDaysTimeValue] = useState<number>(0)
  const [minHoursTimeValue, setMinHoursTimeValue] = useState<number>(0)
  const [maxHoursTimeValue, setMaxHoursTimeValue] = useState<number>(0)

  const classes = useStyles()
  const dispatch = useAppDispatch()

  const onChangeMinTimeMesurement = (event: React.ChangeEvent<{ value: any }>) => {
    setMinTimeMesurement(event.target.value as string)
    setMinYearsTimeValue(0)
    setMinMonthsTimeValue(0)
    setMinDaysTimeValue(0)
    setMinHoursTimeValue(0)
    setMinTime(0)
  }

  const onChangeMaxTimeMesurement = (event: React.ChangeEvent<{ value: any }>) => {
    setMaxTimeMesurement(event.target.value as string)
    setMaxYearsTimeValue(0)
    setMaxMonthsTimeValue(0)
    setMaxDaysTimeValue(0)
    setMaxHoursTimeValue(0)
    setMaxTime(0)
  }

  const onChangeMinTime = (event: React.ChangeEvent<{ value: any }>) => {
    setMinTime(+event.target.value)
    switch (minTimeMesurement) {
      case 'years':
        setMinYearsTimeValue(+event.target.value)
        break
      case 'months':
        setMinMonthsTimeValue(+event.target.value)
        break
      case 'days':
        setMinDaysTimeValue(+event.target.value)
        break
      case 'hours':
        setMinHoursTimeValue(+event.target.value)
        break
    }
  }

  const onChangeMaxTime = (event: React.ChangeEvent<{ value: any }>) => {
    setMaxTime(+event.target.value)
    switch (maxTimeMesurement) {
      case 'years':
        setMaxYearsTimeValue(+event.target.value)
        break
      case 'months':
        setMaxMonthsTimeValue(+event.target.value)
        break
      case 'days':
        setMaxDaysTimeValue(+event.target.value)
        break
      case 'hours':
        setMaxHoursTimeValue(+event.target.value)
        break
    }
  }

  const onConfirm = () => {
    if (!isFirstTimeValueChecked && !isSecondTimeValueChecked) {
      dispatch<any>(
        addTemporalConstraint({
          idList: [firstCriteriaValue, secondCriteriaValue],
          constraintType: 'directChronologicalOrdering'
        })
      )
    } else if (!isFirstTimeValueChecked && isSecondTimeValueChecked) {
      dispatch<any>(
        addTemporalConstraint({
          idList: [firstCriteriaValue, secondCriteriaValue],
          constraintType: 'directChronologicalOrdering',
          timeRelationMaxDuration: {
            years: maxYearsTimeValue,
            months: maxMonthsTimeValue,
            days: maxDaysTimeValue,
            hours: maxHoursTimeValue
          }
        })
      )
    } else if (!isSecondTimeValueChecked && isFirstTimeValueChecked) {
      dispatch<any>(
        addTemporalConstraint({
          idList: [firstCriteriaValue, secondCriteriaValue],
          constraintType: 'directChronologicalOrdering',
          timeRelationMinDuration: {
            years: minYearsTimeValue,
            months: minMonthsTimeValue,
            days: minDaysTimeValue,
            hours: minHoursTimeValue
          }
        })
      )
    } else {
      dispatch<any>(
        addTemporalConstraint({
          idList: [firstCriteriaValue, secondCriteriaValue],
          constraintType: 'directChronologicalOrdering',
          timeRelationMinDuration: {
            years: minYearsTimeValue,
            months: minMonthsTimeValue,
            days: minDaysTimeValue,
            hours: minHoursTimeValue
          },
          timeRelationMaxDuration: {
            years: maxYearsTimeValue,
            months: maxMonthsTimeValue,
            days: maxDaysTimeValue,
            hours: maxHoursTimeValue
          }
        })
      )
    }
    dispatch<any>(buildCohortCreation({}))
  }

  return (
    <Grid
      container
      justifyContent="center"
      alignItems="center"
      style={{ margin: '1em', backgroundColor: 'rgba(209,226,244,0.2)', padding: '1em' }}
    >
      <Grid container alignItems="baseline" justifyContent="center">
        <FormControl style={{ margin: '0 8px', minWidth: 200 }}>
          <InputLabel>Le critère X</InputLabel>
          <Select
            value={firstCriteriaValue === 0 ? null : firstCriteriaValue}
            onChange={(e) => {
              setFirstCriteriaValue(e.target.value as number)
            }}
          >
            {/**TODO: gestion d'erreur a faire si le critere est deja selection dans le deuxieme select mettre le champ en rouge demandant de changer de critere */}
            {selectedCriteria.map((selectValue, index) => (
              <MenuItem key={index} value={selectValue.id}>
                {`(${selectValue.id}) - ${selectValue.title}`}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Typography style={{ fontWeight: 700 }}>s'est produit avant</Typography>
        <FormControl style={{ margin: '0 12px', minWidth: 200 }}>
          <InputLabel>le critère Y</InputLabel>
          <Select
            value={secondCriteriaValue === 0 ? null : secondCriteriaValue}
            onChange={(e) => {
              setSecondCriteriaValue(e.target.value as number)
            }}
          >
            {/**TODO: gestion d'erreur a faire si le critere est deja selection dans le premier select mettre le champ en rouge demandant de changer de critere */}
            {selectedCriteria.map((selectValue, index) => (
              <MenuItem key={index} value={selectValue.id}>
                {`(${selectValue.id}) - ${selectValue.title}`}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>
      <Grid container alignItems="center" justifyContent="center">
        <Checkbox
          value={isFirstTimeValueChecked}
          onChange={() => setIsFirstTimeValueChecked(!isFirstTimeValueChecked)}
        />
        <Typography style={{ fontWeight: 700 }}>séparé de moins de </Typography>
        {/** TODO: Faire la gestion d'erreur si le select est a null mettre le champ en rouge demandant a selectionner une unite */}
        {/** TODO: le champ input ne peux pas etre superieur au deuxieme champ d'input */}
        <InputBase
          className={classes.input}
          disabled={!isFirstTimeValueChecked}
          type="number"
          value={minTime}
          onChange={onChangeMinTime}
        />
        <Select disabled={!isFirstTimeValueChecked} value={minTimeMesurement} onChange={onChangeMinTimeMesurement}>
          {timeMesurements.map((timeMesurement, index) => (
            <MenuItem key={index} value={timeMesurement.id}>
              {timeMesurement.display}
            </MenuItem>
          ))}
        </Select>
      </Grid>
      <Grid container alignItems="center" justifyContent="center">
        <Checkbox
          value={isSecondTimeValueChecked}
          onChange={() => setIsSecondTimeValueChecked(!isSecondTimeValueChecked)}
        />
        <Typography style={{ fontWeight: 700 }}>et de plus de</Typography>
        {/** TODO: Faire la gestion d'erreur si le select est a null mettre le champ en rouge demandant a selectionner une unite */}
        {/** TODO: le champ input ne peux pas etre inferieur au premier champ d'input */}
        <InputBase
          className={classes.input}
          disabled={!isSecondTimeValueChecked}
          type="number"
          value={maxTime}
          onChange={onChangeMaxTime}
        />
        <Select disabled={!isSecondTimeValueChecked} value={maxTimeMesurement} onChange={onChangeMaxTimeMesurement}>
          {timeMesurements.map((timeMesurement, index) => (
            <MenuItem key={index} value={timeMesurement.id}>
              {timeMesurement.display}
            </MenuItem>
          ))}
        </Select>
      </Grid>
      <Button onClick={onConfirm} startIcon={<AddIcon />}>
        Ajouter
      </Button>
    </Grid>
  )
}

export default TemporalConstraintConfig
