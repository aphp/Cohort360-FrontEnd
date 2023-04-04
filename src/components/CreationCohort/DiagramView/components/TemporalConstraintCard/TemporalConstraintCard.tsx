import React, { useState, useEffect } from 'react'
import { Button, Badge } from '@mui/material'

import { buildCohortCreation, deleteTemporalConstraint } from 'state/cohortCreation'
import { useAppSelector, useAppDispatch } from 'state'
import { MeState } from 'state/me'

import TemporalConstraintModal from './components/TemporalConstraintModal/TemporalConstraintModal'

import useStyles from './styles'

const TemporalConstraint: React.FC = () => {
  const [modalIsOpen, setModalIsOpen] = useState(false)
  const [temporalConstraintExist, setTemporalConstraintExist] = useState(false)
  const [disableTemporalConstraint, setDisableTemporalConstraint] = useState(false)

  const { meState } = useAppSelector<{ meState: MeState }>((state) => ({ meState: state.me }))
  const { criteriaGroup = [], temporalConstraints } = useAppSelector((state) => state.cohortCreation.request)

  const maintenanceIsActive = meState?.maintenance?.active || false

  const findInitialStateRadio = temporalConstraints.find(({ idList }) => idList[0] === 'All')
  const temporalConstraintsNumber =
    findInitialStateRadio?.constraintType === 'none' ? temporalConstraints.length - 1 : temporalConstraints.length

  const dispatch = useAppDispatch()
  const classes = useStyles()

  useEffect(() => {
    if (temporalConstraints?.length > 0) {
      setTemporalConstraintExist(true)
    } else {
      setTemporalConstraintExist(false)
    }
  }, [])

  useEffect(() => {
    if (criteriaGroup && criteriaGroup.length > 0) {
      const mainCriteriaGroup = criteriaGroup.find(({ id }) => id === 0)
      if (!disableTemporalConstraint && mainCriteriaGroup && mainCriteriaGroup.type !== 'andGroup') {
        if (temporalConstraints && temporalConstraints.length > 1) {
          temporalConstraints?.map((temporalConstraint) => {
            dispatch<any>(deleteTemporalConstraint(temporalConstraint))
            dispatch<any>(buildCohortCreation({}))
          })
        }
        setDisableTemporalConstraint(true)
      }
    }
  }, [])

  const handleOnClose = () => void setModalIsOpen(false)

  const handleOnClick = () => {
    setModalIsOpen(true)
  }

  return (
    <>
      {!disableTemporalConstraint ? (
        <Badge
          badgeContent={temporalConstraintsNumber}
          color="secondary"
          overlap="rectangular"
          style={{ height: 'fit-content' }}
        >
          <Button
            onClick={handleOnClick}
            className={classes.root}
            style={{
              backgroundColor: !maintenanceIsActive ? '#FFE2A9' : '#DEDEDE'
            }}
            disabled={maintenanceIsActive}
          >
            Contraintes temporelles
          </Button>
        </Badge>
      ) : (
        <Button
          onClick={handleOnClick}
          className={classes.root}
          style={{
            backgroundColor: temporalConstraintExist && !disableTemporalConstraint ? '#FFE2A9' : '#DEDEDE'
          }}
          disabled={maintenanceIsActive || disableTemporalConstraint}
        >
          Contraintes temporelles
        </Button>
      )}

      {modalIsOpen && <TemporalConstraintModal open={modalIsOpen} onClose={handleOnClose} />}
    </>
  )
}

export default TemporalConstraint
