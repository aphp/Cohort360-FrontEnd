import React, { useState, useEffect } from 'react'
import { Button, Badge, Tooltip } from '@mui/material'

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
  const {
    criteriaGroup = [],
    temporalConstraints,
    selectedCriteria
  } = useAppSelector((state) => state.cohortCreation.request)

  const maintenanceIsActive = meState?.maintenance?.active || false

  const findInitialStateRadio = temporalConstraints.find(({ idList }) => idList[0] === 'All')
  const temporalConstraintsNumber =
    findInitialStateRadio?.constraintType === 'none' ? temporalConstraints.length - 1 : temporalConstraints.length

  const dispatch = useAppDispatch()
  const classes = useStyles()

  const mainGroupCriteriaIds = criteriaGroup[0].criteriaIds
  const selectableCriteria = selectedCriteria.filter(
    (criteria) =>
      mainGroupCriteriaIds.includes(criteria.id) && criteria.type !== 'Patient' && criteria.type !== 'IPPList'
  )

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
      if (
        (!disableTemporalConstraint && mainCriteriaGroup && mainCriteriaGroup.type !== 'andGroup') ||
        selectableCriteria.length < 2
      ) {
        if (temporalConstraints && temporalConstraints.length > 1) {
          temporalConstraints?.map((temporalConstraint) => {
            dispatch(deleteTemporalConstraint(temporalConstraint))
            dispatch(buildCohortCreation({}))
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
        <Tooltip title="Les contraintes temporelles ne peuvent être ajoutées que sur les critères simples du groupe ET principal, hors critères démographiques et d'IPP.">
          <span>
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
          </span>
        </Tooltip>
      )}

      {modalIsOpen && <TemporalConstraintModal open={modalIsOpen} onClose={handleOnClose} />}
    </>
  )
}

export default TemporalConstraint
