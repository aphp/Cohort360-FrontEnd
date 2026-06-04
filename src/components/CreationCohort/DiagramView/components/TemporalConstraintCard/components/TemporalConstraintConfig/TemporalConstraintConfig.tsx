import React, { useEffect, useState } from 'react'
import moment from 'moment'

import {
  Button,
  Checkbox,
  FormControl,
  FormHelperText,
  Grid,
  InputBase,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Typography
} from '@mui/material'
import { AvatarWrapper } from 'components/ui/Avatar/styles'

import { useAppSelector } from 'state'
import { TemporalConstraintsKind, TemporalConstraintsType } from 'types'

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
  onChangeNewConstraintsList: (c: TemporalConstraintsType[]) => void
}> = ({ newConstraintsList, onChangeNewConstraintsList }) => {
  const { classes } = useStyles()

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
  const [incorrectTimingError, setIncorrectTimingError] = useState<boolean>(false)

  const getSelectableCriteria = (firstCriteriaSelected: number | null) => {
    const mainGroupCriteriaIds = criteriaGroup[0].criteriaIds

    // remove criteria types that cannot be part of a temporal constraint
    const selectableCriteriaTypes = selectedCriteria.filter(
      (criteria) =>
        mainGroupCriteriaIds.includes(criteria.id) && criteria.type !== 'Patient' && criteria.type !== 'IPPList'
    )

    // get constraints that contain the firstCriteriaSelected
    const constraintsWithCriteriaSelected = newConstraintsList.filter((constraint) =>
      constraint.idList.includes(firstCriteriaSelected as never)
    )

    // get an array with all the ids that are already in a constraint with the firstCriteriaSelected
    const forbiddenCriteriaIds = constraintsWithCriteriaSelected.reduce((acc, obj) => {
      const idList = obj.idList as number[]
      return acc.concat(idList)
    }, [] as number[])

    // retrieves criteria that are not forbidden
    const selectableCriteria = selectableCriteriaTypes
      .filter((criteria) => !forbiddenCriteriaIds.includes(criteria.id))
      .filter((criteria) => criteria.id !== firstCriteriaSelected)

    return selectableCriteria
  }

  const selectableCriteria1 = getSelectableCriteria(secondCriteriaValue)
  const selectableCriteria2 = getSelectableCriteria(firstCriteriaValue)

  const onChangeMinTimeMeasurement = (event: SelectChangeEvent) => {
    setMinTimeMeasurement(event.target.value)
    setMinTime(1)
  }

  const onChangeMaxTimeMeasurement = (event: SelectChangeEvent) => {
    setMaxTimeMeasurement(event.target.value)
    setMaxTime(1)
  }

  const onConfirm = () => {
    if (firstCriteriaValue === null || secondCriteriaValue === null) {
      setNoSelectedConstraintError(true)
    } else {
      setNoSelectedConstraintError(false)

      setFirstCriteriaValue(null)
      setSecondCriteriaValue(null)

      setIsFirstTimeValueChecked(false)
      setMinTime(1)
      setMinTimeMeasurement('days')

      setIsSecondTimeValueChecked(false)
      setMaxTime(1)
      setMaxTimeMeasurement('days')

      const newConstraint: TemporalConstraintsType = {
        idList: [firstCriteriaValue, secondCriteriaValue],
        constraintType: TemporalConstraintsKind.DIRECT_CHRONOLOGICAL_ORDERING,
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

  useEffect(() => {
    if (isFirstTimeValueChecked && isSecondTimeValueChecked) {
      //@ts-ignore
      const minDuration = moment.duration(minTime, minTimeMeasurement).asHours()
      //@ts-ignore
      const maxDuration = moment.duration(maxTime, maxTimeMeasurement).asHours()

      if (minDuration > maxDuration) {
        setIncorrectTimingError(true)
      } else {
        setIncorrectTimingError(false)
      }
    }
  }, [isFirstTimeValueChecked, minTime, minTimeMeasurement, isSecondTimeValueChecked, maxTime, maxTimeMeasurement])

  return (
    <Grid
      container
      justifyContent="center"
      alignItems="center"
      style={{ margin: '1em', backgroundColor: '#F6F9FD', padding: '1em', width: 'auto' }}
    >
      <Grid container size={12} alignItems="baseline" justifyContent="center">
        <FormControl
          style={{ margin: '0 8px', minWidth: 200 }}
          error={noSelectedConstraintError && firstCriteriaValue === null}
        >
          <InputLabel style={{ marginLeft: -12 }}>Le critère X</InputLabel>
          <Select
            value={firstCriteriaValue === 0 ? null : firstCriteriaValue}
            onChange={(e) => {
              setFirstCriteriaValue(e.target.value as number)
            }}
            classes={{ select: classes.flexBaseline }}
            variant="standard"
            style={{ marginTop: 4 }}
          >
            {selectableCriteria1.map((selectValue, index) => (
              <MenuItem key={index} value={selectValue.id}>
                <AvatarWrapper size={20} fontSize={12} marginRight={0.5}>
                  {selectValue.id}
                </AvatarWrapper>
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
          <InputLabel style={{ marginLeft: -12 }}>le critère Y</InputLabel>
          <Select
            value={secondCriteriaValue === 0 ? null : secondCriteriaValue}
            onChange={(e) => {
              setSecondCriteriaValue(e.target.value as number)
            }}
            classes={{ select: classes.flexBaseline }}
            variant="standard"
            style={{ marginTop: 4 }}
          >
            {selectableCriteria2.map((selectValue, index) => (
              <MenuItem key={index} value={selectValue.id}>
                <AvatarWrapper size={20} fontSize={12} marginRight={0.5}>
                  {selectValue.id}
                </AvatarWrapper>
                {` - ${selectValue.title}`}
              </MenuItem>
            ))}
          </Select>
          {noSelectedConstraintError && secondCriteriaValue === null && (
            <FormHelperText>Veuillez sélectionner un critère.</FormHelperText>
          )}
        </FormControl>
      </Grid>
      <Grid container size={12} alignItems="center" justifyContent="center">
        <Grid container size={6} sx={{ justifyContent: 'flex-end' }}>
          <Typography style={{ fontWeight: 700 }}>dans un intervalle </Typography>
        </Grid>
        <Grid container size={6} sx={{ alignItems: 'center' }}>
          <Checkbox
            checked={isFirstTimeValueChecked}
            onChange={() => setIsFirstTimeValueChecked(!isFirstTimeValueChecked)}
          />
          <Typography style={{ fontWeight: 700, color: isFirstTimeValueChecked ? '#153D8A' : '#9E9E9E' }}>
            d'au moins
          </Typography>
          <InputBase
            classes={{ root: classes.input, error: classes.inputError }}
            disabled={!isFirstTimeValueChecked}
            type="number"
            value={minTime}
            onChange={(event) => setMinTime(+event.target.value)}
            inputProps={{
              min: 1
            }}
            error={incorrectTimingError}
          />
          <Select
            disabled={!isFirstTimeValueChecked}
            value={minTimeMeasurement}
            onChange={onChangeMinTimeMeasurement}
            error={incorrectTimingError}
            variant="standard"
          >
            {timeMeasurements.map((timeMeasurement, index) => (
              <MenuItem key={index} value={timeMeasurement.id}>
                {timeMeasurement.display}
              </MenuItem>
            ))}
          </Select>
        </Grid>
      </Grid>
      <Grid container size={12} alignItems="center" justifyContent="flex-end">
        <Grid container size={6} sx={{ alignItems: 'center' }}>
          <Checkbox
            checked={isSecondTimeValueChecked}
            onChange={() => setIsSecondTimeValueChecked(!isSecondTimeValueChecked)}
          />
          <Typography style={{ fontWeight: 700, color: isSecondTimeValueChecked ? '#153D8A' : '#9E9E9E' }}>
            d'au plus
          </Typography>
          <InputBase
            classes={{ root: classes.input, error: classes.inputError }}
            disabled={!isSecondTimeValueChecked}
            type="number"
            value={maxTime}
            onChange={(event) => setMaxTime(+event.target.value)}
            inputProps={{
              min: 1
            }}
            error={incorrectTimingError}
          />
          <Select
            disabled={!isSecondTimeValueChecked}
            value={maxTimeMeasurement}
            onChange={onChangeMaxTimeMeasurement}
            error={incorrectTimingError}
            variant="standard"
          >
            {timeMeasurements.map((timeMeasurement, index) => (
              <MenuItem key={index} value={timeMeasurement.id}>
                {timeMeasurement.display}
              </MenuItem>
            ))}
          </Select>
        </Grid>
      </Grid>
      {incorrectTimingError && (
        <Typography align="center" style={{ color: '#F44336', fontSize: 12, width: '100%', margin: 4 }}>
          La valeur minimale ne peut pas être supérieure à la valeur maximale.
        </Typography>
      )}
      <Button className={classes.button} onClick={onConfirm} disabled={incorrectTimingError}>
        Ajouter une séquence
      </Button>
    </Grid>
  )
}

export default TemporalConstraintConfig
