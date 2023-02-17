import React, { useState } from 'react'

import { Grid, Typography, Select, MenuItem, Checkbox, InputBase, Button } from '@material-ui/core'

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
  const { selectedCriteria, temporalConstraints } = useAppSelector((state) => state.cohortCreation.request)

  const [firstCriteriaValue, setFirstCriteriaValue] = useState<number>(0)
  const [secondCriteriaValue, setSecondCriteriaValue] = useState<number>(0)
  const [isFirstTimeValueChecked, setIsFirstTimeValueChecked] = useState<boolean>(false)
  const [isSecondTimeValueChecked, setIsSecondTimeValueChecked] = useState<boolean>(false)
  const [minTimeMesurement, setMinTimeMesurement] = useState<string | null>(null)
  const [maxTimeMesurement, setMaxTimeMesurement] = useState<string | null>(null)
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

  console.log('test temporalConstraints', temporalConstraints)

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
    setMinTime(event.target.value as number)
    switch (minTimeMesurement) {
      case 'years':
        setMinYearsTimeValue(event.target.value as number)
        break
      case 'months':
        setMinMonthsTimeValue(event.target.value as number)
        break
      case 'days':
        setMinDaysTimeValue(event.target.value as number)
        break
      case 'hours':
        setMinHoursTimeValue(event.target.value as number)
        break
    }
  }

  const onChangeMaxTime = (event: React.ChangeEvent<{ value: any }>) => {
    setMaxTime(event.target.value as number)
    switch (maxTimeMesurement) {
      case 'years':
        setMaxYearsTimeValue(event.target.value as number)
        break
      case 'months':
        setMaxMonthsTimeValue(event.target.value as number)
        break
      case 'days':
        setMaxDaysTimeValue(event.target.value as number)
        break
      case 'hours':
        setMaxHoursTimeValue(event.target.value as number)
        break
    }
  }

  const onConfirm = () => {
    //TODO : Il manque a gerer si l'une des deux checkbox n'est pas coché il faut pas dispatch l'action correspondante sinon sa fausse le json
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
    dispatch<any>(buildCohortCreation({}))
  }

  return (
    <Grid container>
      <Grid>
        <Select
          value={firstCriteriaValue}
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
      </Grid>
      <Grid>
        <Typography>s'est produit avant</Typography>
      </Grid>
      <Grid>
        <Select
          value={secondCriteriaValue}
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
      </Grid>
      <Grid>
        <Typography>separer</Typography>
      </Grid>
      <Grid>
        <Checkbox
          value={isFirstTimeValueChecked}
          onChange={() => setIsFirstTimeValueChecked(!isFirstTimeValueChecked)}
        />
        {console.log('test isFirstTimeValueChecked', isFirstTimeValueChecked)}
      </Grid>
      <Grid>
        <Typography>de moins de</Typography>
      </Grid>
      <Grid>
        {/** TODO: Faire la gestion d'erreur si le select est a null mettre le champ en rouge demandant a selectionner une unite */}
        {/** TODO: le champ input ne peux pas etre superieur au deuxieme champ d'input */}
        <InputBase
          className={classes.input}
          disabled={!isFirstTimeValueChecked}
          type="number"
          value={minTime}
          onChange={onChangeMinTime}
        />
      </Grid>
      <Grid>
        <Select disabled={!isFirstTimeValueChecked} value={minTimeMesurement} onChange={onChangeMinTimeMesurement}>
          {timeMesurements.map((timeMesurement, index) => (
            <MenuItem key={index} value={timeMesurement.id}>
              {timeMesurement.display}
            </MenuItem>
          ))}
        </Select>
      </Grid>
      <Grid>
        <Typography>et</Typography>
      </Grid>
      <Grid>
        <Checkbox
          value={isSecondTimeValueChecked}
          onChange={() => setIsSecondTimeValueChecked(!isSecondTimeValueChecked)}
        />
        {console.log('test isSecondTimeValueChecked', isSecondTimeValueChecked)}
      </Grid>
      <Grid>
        <Typography>de plus de</Typography>
      </Grid>
      <Grid>
        {/** TODO: Faire la gestion d'erreur si le select est a null mettre le champ en rouge demandant a selectionner une unite */}
        {/** TODO: le champ input ne peux pas etre inferieur au premier champ d'input */}
        <InputBase
          className={classes.input}
          disabled={!isSecondTimeValueChecked}
          type="number"
          value={maxTime}
          onChange={onChangeMaxTime}
        />
      </Grid>
      <Grid>
        <Select disabled={!isSecondTimeValueChecked} value={maxTimeMesurement} onChange={onChangeMaxTimeMesurement}>
          {timeMesurements.map((timeMesurement, index) => (
            <MenuItem key={index} value={timeMesurement.id}>
              {timeMesurement.display}
            </MenuItem>
          ))}
        </Select>
      </Grid>
      <Grid>
        <Button onClick={onConfirm}>Valider</Button>
      </Grid>
    </Grid>
  )
}

export default TemporalConstraintConfig
