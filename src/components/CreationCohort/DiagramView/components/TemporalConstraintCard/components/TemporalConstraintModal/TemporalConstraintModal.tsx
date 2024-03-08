import React, { useState } from 'react'
import { useNavigate } from 'react-router'

import {
  Button,
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
import { TemporalConstraintsKind, TemporalConstraintsType } from 'types'
import { AvatarWrapper } from 'components/ui/Avatar/styles'
import Card from 'components/ui/Card/Card'
import ConfirmationDialog from 'components/ui/ConfirmationDialog/ConfirmationDialog'

import useStyles from './styles'
import _ from 'lodash'
import { getSelectableGroups } from 'utils/temporalConstraints'
import { SelectedCriteriaType } from 'types/requestCriterias'

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

  const [openConfirmationDialog, setOpenConfirmationDialog] = useState<boolean>(false)

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
        groupCriteria = selectedCriteria.filter(
          (criteria) =>
            groupCriteriaIds.includes(criteria.id) && criteria.type !== 'IPPList' && criteria.type !== 'Patient'
        )
      }
    }

    return groupCriteria
  }

  const onConfirm = () => {
    const newConstraint: TemporalConstraintsType = {
      idList: encounterConstraint.criteriaIds.sort(),
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
    <>
      <Dialog fullWidth maxWidth="lg" open onClose={handleClose} aria-labelledby="form-dialog-title">
        <DialogTitle>Contraintes temporelles</DialogTitle>
        <DialogContent>
          <Grid>
            <Typography variant="h3">Contraintes sur les séjours</Typography>
            <RadioGroup
              row
              value={radioValues}
              onChange={(e) => {
                if (
                  radioValues === TemporalConstraintsKind.PARTIAL_CONSTRAINT &&
                  newConstraintsList.find(
                    (constraint) => constraint.constraintType === TemporalConstraintsKind.SAME_ENCOUNTER
                  )
                ) {
                  setOpenConfirmationDialog(true)
                  setRadioValues(e.target.value as TemporalConstraintsKind)
                } else {
                  onChangeValue(e.target.value as TemporalConstraintsKind)
                }
              }}
              sx={{ margin: '1em', justifyContent: 'space-around' }}
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
                disabled={criteriaGroup[0].type === 'orGroup'}
              />
              <FormControlLabel
                value={TemporalConstraintsKind.PARTIAL_CONSTRAINT}
                control={<Radio />}
                label="Certains critères ont lieu au cours du même séjour"
              />
            </RadioGroup>
          </Grid>
          {radioValues === TemporalConstraintsKind.PARTIAL_CONSTRAINT && (
            <div
              style={{
                width: 'auto',
                overflowX: 'auto',
                margin: '1em',
                backgroundColor: '#F6F9FD',
                padding: '1em',
                display: 'flex'
              }}
              ref={(div) => {
                if (div) {
                  div.scrollLeft = div.scrollWidth - div.clientWidth
                }
              }}
            >
              <Grid
                container
                wrap="nowrap"
                sx={{
                  width:
                    newConstraintsList.filter((constraint) => !constraint.idList.includes('All' as never)).length === 0
                      ? '100%'
                      : 'fit-content',
                  justifyContent:
                    newConstraintsList.filter((constraint) => !constraint.idList.includes('All' as never)).length === 0
                      ? 'center'
                      : 'flex-start'
                }}
              >
                {newConstraintsList
                  .filter(
                    (constraint) =>
                      !constraint.idList.includes('All' as never) &&
                      constraint.constraintType === TemporalConstraintsKind.SAME_ENCOUNTER
                  )
                  .map((constraint, index) => (
                    <Card
                      key={index}
                      title="Contrainte de même séjour"
                      actions={
                        <IconButton onClick={() => onDelete(constraint)}>
                          <DeleteIcon />
                        </IconButton>
                      }
                      wrap
                      width={constraint.idList.length > 3 ? 450 : 260}
                    >
                      {constraint.idList.map((criteriaId) => (
                        <Grid
                          key={criteriaId}
                          container
                          alignItems="center"
                          xs={constraint.idList.length > 3 ? 6 : false}
                          sx={{ margin: '4px 0' }}
                        >
                          <AvatarWrapper size={20} fontSize={12} marginLeft={0.5} marginRight={0.5}>
                            {criteriaId}
                          </AvatarWrapper>
                          {` - ${displayCriteria(criteriaId as number)}`}
                        </Grid>
                      ))}
                    </Card>
                  ))}

                {showAddConstraintIcon && (
                  <IconButton
                    onClick={() => {
                      setShowAddConstraintCard(true)
                      setShowAddConstraintIcon(false)
                    }}
                  >
                    <AddCircleIcon sx={{ height: '2em', width: '2em' }} />
                  </IconButton>
                )}

                {showAddConstraintCard && (
                  <Card
                    title="Contrainte de même séjour"
                    actions={
                      <>
                        <Button
                          onClick={() => {
                            setEncounterConstraint(defaultEncounterConstraint)
                            setShowAddConstraintCard(false)
                            setShowAddConstraintIcon(true)
                          }}
                          sx={{ color: '#ED6D91' }}
                        >
                          Annuler
                        </Button>
                        <Button onClick={onConfirm} disabled={encounterConstraint.criteriaIds.length <= 1}>
                          Valider
                        </Button>
                      </>
                    }
                  >
                    <FormControl className={classes.selectGroupFormControl}>
                      <Typography>Sélectionner un groupe de critères: </Typography>
                      <Select
                        value={encounterConstraint.selectedGroup}
                        onChange={(e) => {
                          setEncounterConstraint({
                            selectedGroup: e.target.value as number | null,
                            criteriaIds: []
                          })
                        }}
                        classes={{ select: classes.flexBaseline }}
                        variant="standard"
                        sx={{ margin: '0 12px', minWidth: 160 }}
                      >
                        {getSelectableGroups(selectedCriteria, criteriaGroup).map((selectValue, index) => (
                          <MenuItem key={index} value={selectValue.id}>
                            {`${selectValue.title}`}
                            <AvatarWrapper
                              backgroundColor="#FFE2A9"
                              color="#153D8A"
                              size={20}
                              fontSize={12}
                              marginLeft={0.5}
                              marginRight={0.5}
                              bold
                            >
                              {Math.abs(selectValue.id) + 1}
                            </AvatarWrapper>
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    {encounterConstraint.selectedGroup !== null && (
                      <FormControl
                        className={classes.selectCriteriaFormControl}
                        sx={{ justifyContent: getGroupCriteria().length > 2 ? 'flex-start' : 'space-around' }}
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
                                  if (checked) {
                                    setEncounterConstraint({
                                      ...encounterConstraint,
                                      criteriaIds: [...encounterConstraint.criteriaIds, criteria.id]
                                    })
                                  } else {
                                    setEncounterConstraint({
                                      ...encounterConstraint,
                                      criteriaIds: encounterConstraint.criteriaIds.filter(
                                        (criteriaId) => criteriaId !== criteria.id
                                      )
                                    })
                                  }
                                }}
                              />
                            }
                            label={
                              <Grid container alignItems="center" wrap="nowrap">
                                <AvatarWrapper size={20} fontSize={12} marginLeft={0.5} marginRight={0.5}>
                                  {criteria.id}
                                </AvatarWrapper>

                                {` - ${criteria.title}`}
                              </Grid>
                            }
                            sx={{ width: '33%', marginRight: 0 }}
                          />
                        ))}
                      </FormControl>
                    )}
                  </Card>
                )}
              </Grid>
            </div>
          )}
          {criteriaGroup[0].type !== 'orGroup' && (
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
              <EventSequenceTable
                temporalConstraints={newConstraintsList}
                onChangeConstraints={setNewConstraintsList}
              />
            </Grid>
          )}
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

      <ConfirmationDialog
        open={openConfirmationDialog}
        message={
          'Attention, en passant sur un type de contrainte temporelle globale, vous perdrez toutes les contraintes partielles déjà ajoutées.'
        }
        onClose={() => setOpenConfirmationDialog(false)}
        onCancel={() => {
          setOpenConfirmationDialog(false)
          setRadioValues(TemporalConstraintsKind.PARTIAL_CONSTRAINT)
        }}
        onConfirm={() => {
          onChangeValue(radioValues)
          setOpenConfirmationDialog(false)
        }}
      />
    </>
  )
}

export default TemporalConstraint
