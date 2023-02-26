import React, { useState } from 'react'

import {
  Avatar,
  Button,
  Checkbox,
  FormControl,
  FormHelperText,
  Grid,
  InputBase,
  InputLabel,
  MenuItem,
  Select,
  Typography
} from '@material-ui/core'

import { useAppSelector } from 'state'
import { TemporalConstraintsType } from 'types'

import useStyles from './styles'

const timeMeasurements = [
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

const TemporalConstraintConfig: React.FC<{
  newConstraintsList: TemporalConstraintsType[]
  onChangeNewConstraintsList: any
}> = ({ newConstraintsList, onChangeNewConstraintsList }) => {
  const classes = useStyles()

  const { selectedCriteria, criteriaGroup } = useAppSelector((state) => state.cohortCreation.request)

  const [firstCriteriaValue, setFirstCriteriaValue] = useState<number | null>(null)
  const [secondCriteriaValue, setSecondCriteriaValue] = useState<number | null>(null)

  const [isFirstTimeValueChecked, setIsFirstTimeValueChecked] = useState<boolean>(false)
  const [minTime, setMinTime] = useState<number>(1)
  const [minTimeMeasurement, setMinTimeMeasurement] = useState<string>('days')

  const [isSecondTimeValueChecked, setIsSecondTimeValueChecked] = useState<boolean>(false)
  const [maxTime, setMaxTime] = useState<number>(1)
  const [maxTimeMeasurement, setMaxTimeMeasurement] = useState<string>('days')

  const [noSelectedConstraintError, setNoSelectedConstraintError] = useState<boolean>(false)

  const mainGroupCriteriaIds = criteriaGroup[0].criteriaIds
  const mainGroupCriteria = selectedCriteria.filter((criteria) => mainGroupCriteriaIds.includes(criteria.id))

  const onChangeMinTimeMeasurement = (event: React.ChangeEvent<{ value: any }>) => {
    setMinTimeMeasurement(event.target.value as string)
    setMinTime(1)
  }

  const onChangeMaxTimeMeasurement = (event: React.ChangeEvent<{ value: any }>) => {
    setMaxTimeMeasurement(event.target.value as string)
    setMaxTime(1)
  }

  const onConfirm = () => {
    if (firstCriteriaValue === null || secondCriteriaValue === null) {
      setNoSelectedConstraintError(true)
    } else {
      setNoSelectedConstraintError(false)

      const newConstraint: TemporalConstraintsType = {
        idList: [firstCriteriaValue, secondCriteriaValue],
        constraintType: 'directChronologicalOrdering',
        ...(isFirstTimeValueChecked && {
          timeRelationMinDuration: {
            [minTimeMeasurement]: minTime
          }
        }),
        ...(isSecondTimeValueChecked && {
          timeRelationMaxDuration: {
            [maxTimeMeasurement]: maxTime
          }
        })
      }

      onChangeNewConstraintsList([...newConstraintsList, newConstraint])
    }
  }

  return (
    <Grid
      container
      justifyContent="center"
      alignItems="center"
      style={{ margin: '1em', backgroundColor: '#F6F9FD', padding: '1em' }}
    >
      <Grid container alignItems="baseline" justifyContent="center">
        <FormControl
          style={{ margin: '0 8px', minWidth: 200 }}
          error={noSelectedConstraintError && firstCriteriaValue === null}
        >
          <InputLabel>Le critère X</InputLabel>
          <Select
            value={firstCriteriaValue === 0 ? null : firstCriteriaValue}
            onChange={(e) => {
              setFirstCriteriaValue(e.target.value as number)
            }}
            classes={{ select: classes.flexBaseline }}
          >
            {mainGroupCriteria
              .filter((criteria) => criteria.id !== secondCriteriaValue)
              .map((selectValue, index) => (
                <MenuItem key={index} value={selectValue.id}>
                  <Avatar className={classes.avatar}>{selectValue.id}</Avatar>
                  {` - ${selectValue.title}`}
                </MenuItem>
              ))}
          </Select>
          {noSelectedConstraintError && firstCriteriaValue === null && (
            <FormHelperText>Veuillez sélectionner un critère.</FormHelperText>
          )}
        </FormControl>
        <Typography style={{ fontWeight: 700 }}>s'est produit avant</Typography>
        <FormControl
          style={{ margin: '0 12px', minWidth: 200 }}
          error={noSelectedConstraintError && secondCriteriaValue === null}
        >
          <InputLabel>le critère Y</InputLabel>
          <Select
            value={secondCriteriaValue === 0 ? null : secondCriteriaValue}
            onChange={(e) => {
              setSecondCriteriaValue(e.target.value as number)
            }}
            classes={{ select: classes.flexBaseline }}
          >
            {mainGroupCriteria
              .filter((criteria) => criteria.id !== firstCriteriaValue)
              .map((selectValue, index) => (
                <MenuItem key={index} value={selectValue.id}>
                  <Avatar className={classes.avatar}>{selectValue.id}</Avatar>
                  {` - ${selectValue.title}`}
                </MenuItem>
              ))}
          </Select>
          {noSelectedConstraintError && secondCriteriaValue === null && (
            <FormHelperText>Veuillez sélectionner un critère.</FormHelperText>
          )}
        </FormControl>
      </Grid>
      <Grid container alignItems="center" justifyContent="center">
        <Typography style={{ fontWeight: 700 }}>dans une intervalle de </Typography>
        <Checkbox
          value={isFirstTimeValueChecked}
          onChange={() => setIsFirstTimeValueChecked(!isFirstTimeValueChecked)}
        />
        <Typography style={{ fontWeight: 700 }}>plus de </Typography>
        {/** TODO: Faire la gestion d'erreur si le select est a null mettre le champ en rouge demandant a selectionner une unite */}
        {/** TODO: le champ input ne peux pas etre superieur au deuxieme champ d'input */}
        <InputBase
          className={classes.input}
          disabled={!isFirstTimeValueChecked}
          type="number"
          value={minTime}
          onChange={(event) => setMinTime(+event.target.value)}
          inputProps={{
            min: 1
          }}
        />
        <Select disabled={!isFirstTimeValueChecked} value={minTimeMeasurement} onChange={onChangeMinTimeMeasurement}>
          {timeMeasurements.map((timeMeasurement, index) => (
            <MenuItem key={index} value={timeMeasurement.id}>
              {timeMeasurement.display}
            </MenuItem>
          ))}
        </Select>
        <Checkbox
          value={isSecondTimeValueChecked}
          onChange={() => setIsSecondTimeValueChecked(!isSecondTimeValueChecked)}
        />
        <Typography style={{ fontWeight: 700 }}>moins de</Typography>
        {/** TODO: Faire la gestion d'erreur si le select est a null mettre le champ en rouge demandant a selectionner une unite */}
        {/** TODO: le champ input ne peux pas etre inferieur au premier champ d'input */}
        <InputBase
          className={classes.input}
          disabled={!isSecondTimeValueChecked}
          type="number"
          value={maxTime}
          onChange={(event) => setMaxTime(+event.target.value)}
          inputProps={{
            min: 1
          }}
        />
        <Select disabled={!isSecondTimeValueChecked} value={maxTimeMeasurement} onChange={onChangeMaxTimeMeasurement}>
          {timeMeasurements.map((timeMeasurement, index) => (
            <MenuItem key={index} value={timeMeasurement.id}>
              {timeMeasurement.display}
            </MenuItem>
          ))}
        </Select>
      </Grid>
      <Button className={classes.button} onClick={onConfirm}>
        Ajouter critère
      </Button>
    </Grid>
  )
}

export default TemporalConstraintConfig
