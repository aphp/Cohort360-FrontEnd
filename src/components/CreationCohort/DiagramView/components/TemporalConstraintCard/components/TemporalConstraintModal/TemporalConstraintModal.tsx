import React, { useState } from 'react'
import { useNavigate } from 'react-router'

import {
  Avatar,
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  Grid,
  IconButton,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  Tooltip,
  Typography
} from '@mui/material'
import AddCircleIcon from '@mui/icons-material/AddCircle'
import DeleteIcon from '@mui/icons-material/Delete'
import InfoIcon from '@mui/icons-material/Info'

import { useAppDispatch, useAppSelector } from 'state'
import { buildCohortCreation, updateTemporalConstraints } from 'state/cohortCreation'

import EventSequenceTable from '../EventSequenceTable/EventSequenceTable'
import TemporalConstraintConfig from '../TemporalConstraintConfig/TemporalConstraintConfig'
import { SelectedCriteriaType, TemporalConstraintsKind, TemporalConstraintsType } from 'types'

import useStyles from './styles'
import _ from 'lodash'

type EncounterConstraint = {
  selectedGroup: number | null
  criteriaIds: number[]
}

const defaultEncounterConstraint: EncounterConstraint = {
  selectedGroup: null,
  criteriaIds: []
}

const TemporalConstraint: React.FC<{
  open: boolean
  onClose?: () => void
}> = ({ onClose }) => {
  const { classes } = useStyles()

  const {
    temporalConstraints = [],
    criteriaGroup,
    selectedCriteria
  } = useAppSelector((state) => state.cohortCreation.request)

  const findInitialStateRadio = (temporalConstraints: TemporalConstraintsType[]) => {
    const encounterConstraints = temporalConstraints.filter(
      ({ constraintType }) => constraintType !== TemporalConstraintsKind.DIRECT_CHRONOLOGICAL_ORDERING
    )

    const globalConstraintId = encounterConstraints.findIndex((constraint) =>
      constraint.idList.includes('All' as never)
    )

    let initialStateRadio = TemporalConstraintsKind.NONE
    if (globalConstraintId >= 0) {
      initialStateRadio = encounterConstraints[globalConstraintId].constraintType
    } else {
      initialStateRadio = TemporalConstraintsKind.PARTIAL_CONSTRAINT
    }

    return initialStateRadio
  }

  const [radioValues, setRadioValues] = useState<TemporalConstraintsKind>(
    findInitialStateRadio(temporalConstraints) ?? TemporalConstraintsKind.NONE
  )
  const [encounterConstraint, setEncounterConstraint] = useState<EncounterConstraint>(defaultEncounterConstraint)
  const [newConstraintsList, setNewConstraintsList] = useState<TemporalConstraintsType[]>([...temporalConstraints])
  const [showAddConstraintIcon, setShowAddConstraintIcon] = useState<boolean>(true)
  const [showAddConstraintCard, setShowAddConstraintCard] = useState<boolean>(false)

  const navigate = useNavigate()
  const dispatch = useAppDispatch()

  const handleConfirm = () => {
    dispatch(updateTemporalConstraints(newConstraintsList))
    dispatch(buildCohortCreation({}))
  }

  const handleClose = () => {
    if (onClose && typeof onClose === 'function') {
      onClose()
    } else {
      navigate(`/home`)
    }
  }

  const onChangeValue = (value: TemporalConstraintsKind) => {
    setRadioValues(value)

    const _newConstraintsList = newConstraintsList.filter(
      (constraint) => constraint.constraintType === TemporalConstraintsKind.DIRECT_CHRONOLOGICAL_ORDERING
    )
    if (value !== TemporalConstraintsKind.PARTIAL_CONSTRAINT) {
      _newConstraintsList.push({ idList: ['All'], constraintType: value })
    }

    setNewConstraintsList(_newConstraintsList)
  }

  const getGroupCriteria = () => {
    let groupCriteria: SelectedCriteriaType[] = []
    if (encounterConstraint.selectedGroup !== null) {
      const groupCriteriaIds = criteriaGroup.find(
        (criteria) => criteria.id === encounterConstraint.selectedGroup
      )?.criteriaIds
      if (groupCriteriaIds) {
        groupCriteria = selectedCriteria.filter((criteria) => groupCriteriaIds.includes(criteria.id))
      }
    }

    return groupCriteria
  }

  const onConfirm = () => {
    const newConstraint: TemporalConstraintsType = {
      idList: encounterConstraint.criteriaIds,
      constraintType: TemporalConstraintsKind.SAME_ENCOUNTER
    }
    setNewConstraintsList([...newConstraintsList, newConstraint])
    setEncounterConstraint(defaultEncounterConstraint)

    setShowAddConstraintCard(false)
    setShowAddConstraintIcon(true)
  }

  const onDelete = (_constraint: TemporalConstraintsType) => {
    setNewConstraintsList(newConstraintsList.filter((constraint) => !_.isEqual(constraint, _constraint)))
  }

  const displayCriteria = (criteriaId: number) => {
    const criteriaName = selectedCriteria.find((criteria) => criteria.id === criteriaId)?.title
    return criteriaName
  }

  return (
    <Dialog fullWidth maxWidth="lg" open onClose={handleClose} aria-labelledby="form-dialog-title">
      <DialogTitle>Contraintes temporelles</DialogTitle>
      <DialogContent>
        <Grid>
          <Typography variant="h3">Contraintes sur les séjours</Typography>
          <RadioGroup
            row
            value={radioValues}
            onChange={(e) => onChangeValue(e.target.value as unknown as TemporalConstraintsKind)}
            style={{ margin: '1em', justifyContent: 'space-around' }}
          >
            <FormControlLabel
              value={TemporalConstraintsKind.NONE}
              control={<Radio />}
              label="Aucune contrainte sur les séjours"
            />
            <FormControlLabel
              value={TemporalConstraintsKind.SAME_ENCOUNTER}
              control={<Radio />}
              label="Tous les critères ont lieu au cours du même séjour"
            />
            <FormControlLabel
              value={TemporalConstraintsKind.PARTIAL_CONSTRAINT}
              control={<Radio />}
              label="Certains critères ont lieu au cours du même séjour"
            />
          </RadioGroup>
        </Grid>
        {radioValues === TemporalConstraintsKind.PARTIAL_CONSTRAINT && (
          <div style={{ width: '100%', overflowX: 'auto', margin: '1em', backgroundColor: '#F6F9FD', padding: '1em' }}>
            <Grid container wrap="nowrap" style={{ width: 'fit-content' }}>
              {showAddConstraintIcon && (
                <IconButton
                  onClick={() => {
                    setShowAddConstraintCard(true)
                    setShowAddConstraintIcon(false)
                  }}
                >
                  <AddCircleIcon style={{ height: '2em', width: '2em' }} />
                </IconButton>
              )}

              {showAddConstraintCard && (
                <Card
                  sx={{ margin: '1em', width: 800 }}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    height: 200
                  }}
                >
                  <CardHeader
                    title="Contrainte de même séjour"
                    titleTypographyProps={{
                      variant: 'h3',
                      align: 'center',
                      color: '#0063AF',
                      padding: '0 20px',
                      textTransform: 'uppercase',
                      fontSize: 11,
                      fontWeight: 'bold'
                    }}
                    style={{ backgroundColor: '#D1E2F4', width: 'inherit' }}
                  />
                  <CardContent
                    sx={{
                      padding: '0 16px',
                      width: 'inherit',
                      height: '80%',
                      overflow: 'auto',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center'
                    }}
                  >
                    <FormControl
                      style={{
                        margin: '0 8px',
                        minWidth: 200,
                        height: '25%',
                        flexDirection: 'row',
                        alignItems: 'baseline'
                      }}
                    >
                      <Typography>Sélectionner un groupe de critères: </Typography>
                      <Select
                        value={encounterConstraint.selectedGroup}
                        onChange={(e) => {
                          setEncounterConstraint({
                            ...encounterConstraint,
                            selectedGroup: e.target.value as number | null
                          })
                        }}
                        classes={{ select: classes.flexBaseline }}
                        variant="standard"
                        style={{ margin: '0 12px', minWidth: 160 }}
                      >
                        {criteriaGroup
                          .filter((group) => group.type === 'andGroup')
                          .map((selectValue, index) => (
                            <MenuItem key={index} value={selectValue.id}>
                              {`${selectValue.title}`}
                              <Avatar className={classes.avatar} style={{ backgroundColor: '#f7b294' }}>
                                {Math.abs(selectValue.id) + 1}
                              </Avatar>
                            </MenuItem>
                          ))}
                      </Select>
                    </FormControl>
                    {encounterConstraint.selectedGroup !== null && (
                      <FormControl
                        sx={{ height: '75%', flexWrap: 'wrap', overflow: 'scroll', width: '100%' }}
                        component="fieldset"
                        variant="standard"
                      >
                        {getGroupCriteria().map((criteria) => (
                          <FormControlLabel
                            key={criteria.id}
                            checked={encounterConstraint.criteriaIds.includes(criteria.id)}
                            defaultChecked={false}
                            value={criteria.id}
                            control={
                              <Checkbox
                                size="small"
                                checked={encounterConstraint.criteriaIds.includes(criteria.id)}
                                onChange={(e, checked) => {
                                  // TODO: fonction à réparer
                                  if (checked) {
                                    setEncounterConstraint({
                                      ...encounterConstraint,
                                      criteriaIds: [...encounterConstraint.criteriaIds, criteria.id]
                                    })
                                  } else {
                                    const index = encounterConstraint.criteriaIds.indexOf(criteria.id)
                                    if (index > -1) {
                                      setEncounterConstraint({
                                        ...encounterConstraint,
                                        criteriaIds: encounterConstraint.criteriaIds.splice(index, 1)
                                      })
                                    }
                                  }
                                }}
                              />
                            }
                            label={
                              <Grid container alignItems="center" wrap="nowrap">
                                <Avatar className={classes.avatar}>{criteria.id}</Avatar>
                                {` - ${criteria.title}`}
                              </Grid>
                            }
                            style={{ width: '33%', marginRight: 0 }}
                          />
                        ))}
                      </FormControl>
                    )}
                  </CardContent>
                  <CardActions sx={{ padding: 0 }}>
                    <Button
                      onClick={() => {
                        setEncounterConstraint(defaultEncounterConstraint)
                        setShowAddConstraintCard(false)
                        setShowAddConstraintIcon(true)
                      }}
                    >
                      Annuler
                    </Button>
                    <Button onClick={onConfirm}>Valider</Button>
                  </CardActions>
                </Card>
              )}

              {newConstraintsList
                .filter((constraint) => !constraint.idList.includes('All' as never))
                .reverse()
                .map((constraint, index) => (
                  <Card
                    key={index}
                    sx={{ width: '100%', margin: '1em' }}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      width: 450,
                      height: 200
                    }}
                  >
                    <CardHeader
                      title="Contrainte de même séjour"
                      titleTypographyProps={{
                        variant: 'h3',
                        align: 'center',
                        color: '#0063AF',
                        padding: '0 20px',
                        textTransform: 'uppercase',
                        fontSize: 11,
                        fontWeight: 'bold'
                      }}
                      style={{ backgroundColor: '#D1E2F4', width: 'inherit' }}
                    />
                    <CardContent sx={{ display: 'flex', flexWrap: 'wrap', overflow: 'scroll', width: '100%' }}>
                      {constraint.idList.map((criteriaId) => (
                        <Grid key={criteriaId} container alignItems="center" xs={6} sx={{ margin: '4px 0' }}>
                          <Avatar className={classes.avatar}>{criteriaId}</Avatar>
                          {` - ${displayCriteria(criteriaId as number)}`}
                        </Grid>
                      ))}
                    </CardContent>
                    <CardActions sx={{ justifyContent: 'center', padding: 0 }}>
                      <IconButton onClick={() => onDelete(constraint)}>
                        <DeleteIcon />
                      </IconButton>
                    </CardActions>
                  </Card>
                ))}
            </Grid>
          </div>
        )}
        <Grid>
          <Grid item container direction="row" alignItems="center">
            <Typography variant="h3">Séquence d'évènements entre deux critères</Typography>
            <Tooltip title="Les contraintes temporelles ne peuvent être ajoutées que sur le groupe ET principal.">
              <InfoIcon fontSize="small" color="primary" style={{ marginLeft: 4 }} />
            </Tooltip>
          </Grid>
          <TemporalConstraintConfig
            newConstraintsList={newConstraintsList}
            onChangeNewConstraintsList={setNewConstraintsList}
          />
          <EventSequenceTable temporalConstraints={newConstraintsList} onChangeConstraints={setNewConstraintsList} />
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="secondary">
          Annuler
        </Button>
        <Button onClick={handleConfirm} color="primary">
          Valider
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default TemporalConstraint
