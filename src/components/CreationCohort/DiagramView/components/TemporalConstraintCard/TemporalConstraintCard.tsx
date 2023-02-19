import React, { useState, useEffect } from 'react'

import { Button, Badge, Dialog, DialogContent, DialogActions, Grid, Typography } from '@material-ui/core'

import { buildCohortCreation, deleteTemporalConstraint } from 'state/cohortCreation'
import { useAppSelector, useAppDispatch } from 'state'
import { MeState } from 'state/me'

import TemporalConstraintModal from './components/TemporalConstraintModal/TemporalConstraintModal'

import useStyles from './styles'

const TemporalConstraint: React.FC = () => {
  const [modalIsOpen, setModalIsOpen] = useState(false)
  const [temporalConstraintExist, setTemporalConstraintExist] = useState(false)
  const [disableTemporalConstraint, setDisableTemporalConstraint] = useState(false)
  const [alert, setAlert] = useState(false)

  const { meState } = useAppSelector<{ meState: MeState }>((state) => ({ meState: state.me }))
  const { criteriaGroup = [], temporalConstraints, json } = useAppSelector((state) => state.cohortCreation.request)

  const maintenanceIsActive = meState?.maintenance?.active || false
  const checkTemporalConstraint = temporalConstraints
    ? temporalConstraints.map((temporalConstraint) => {
        if (temporalConstraint.constraintType !== 'none') {
          return temporalConstraint
        }
      })
    : []

  console.log('checkTemporalConstraint', checkTemporalConstraint)
  console.log('temporalConstraints', temporalConstraints)

  const dispatch = useAppDispatch()
  const classes = useStyles()

  console.log('json', json)

  useEffect(() => {
    if (temporalConstraints?.length > 0) {
      setTemporalConstraintExist(true)
    } else {
      setTemporalConstraintExist(false)
    }
  }, [temporalConstraints])

  useEffect(() => {
    if (criteriaGroup && criteriaGroup.length > 0) {
      const mainCriteriaGroup = criteriaGroup.find(({ id }) => id === 0)
      if (!disableTemporalConstraint && mainCriteriaGroup && mainCriteriaGroup.type !== 'andGroup') {
        if (checkTemporalConstraint.map((temporalConstraint) => temporalConstraint !== undefined)) {
          temporalConstraints?.map((temporalConstraint) => {
            dispatch<any>(deleteTemporalConstraint(temporalConstraint))
            dispatch<any>(buildCohortCreation({}))
          })
        }
        setDisableTemporalConstraint(true)
        setAlert(true)
      }
    }
  }, [criteriaGroup])

  const handleOnClose = () => void setModalIsOpen(false)
  const handleClose = () => void setAlert(false)

  const handleOnClick = () => {
    setModalIsOpen(true)
  }

  const AlertDisplay = () => {
    return (
      <Dialog fullWidth maxWidth="lg" open onClose={handleClose} aria-labelledby="form-dialog-title">
        <DialogContent>
          <Grid>
            <Typography variant="h3">
              Vous venez de perdre vos contraintes temporelles car elle ne sont pas compatible avec un critere generale
              de type OU. Pour revenir a l'etat precedent, veuillez cliquer sur annuler.
            </Typography>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="secondary">
            Ok
          </Button>
        </DialogActions>
      </Dialog>
    )
  }

  return (
    <>
      <Badge badgeContent={temporalConstraints?.length} color="secondary" style={{ height: 'fit-content' }}>
        <Button
          onClick={handleOnClick}
          className={classes.root}
          style={{
            backgroundColor: temporalConstraintExist ? '#FFE2A9' : '#DEDEDE'
          }}
          disabled={maintenanceIsActive || disableTemporalConstraint}
        >
          Contraintes temporelles
        </Button>
      </Badge>
      {modalIsOpen && <TemporalConstraintModal open={modalIsOpen} onClose={handleOnClose} />}
      {alert && <AlertDisplay />}
    </>
  )
}

export default TemporalConstraint
