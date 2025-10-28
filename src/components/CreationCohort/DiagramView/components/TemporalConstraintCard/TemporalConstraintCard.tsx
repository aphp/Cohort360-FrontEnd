import React, { useState, useEffect, useMemo } from 'react'
import { Button, Badge, Tooltip } from '@mui/material'

import { buildCohortCreation, deleteTemporalConstraint } from 'state/cohortCreation'
import { useAppSelector, useAppDispatch } from 'state'

import TemporalConstraintModal from './components/TemporalConstraintModal/TemporalConstraintModal'

import useStyles from './styles'
import { TemporalConstraintsKind } from 'types'
import { getSelectableGroups } from 'utils/temporalConstraints'
import { CriteriaType } from 'types/requestCriterias'

const TemporalConstraint: React.FC = () => {
  const [modalIsOpen, setModalIsOpen] = useState(false)
  const [temporalConstraintExist, setTemporalConstraintExist] = useState(false)
  const [disableTemporalConstraint, setDisableTemporalConstraint] = useState(false)

  const maintenanceIsActive = useAppSelector((state) => state.me?.maintenance?.active ?? false)
  const {
    criteriaGroup = [],
    temporalConstraints,
    selectedCriteria
  } = useAppSelector((state) => state.cohortCreation.request)

  const temporalConstraintsNumber = temporalConstraints.filter(
    (constraint) => constraint.constraintType !== TemporalConstraintsKind.NONE
  ).length

  const dispatch = useAppDispatch()
  const { classes } = useStyles()

  useEffect(() => {
    if (temporalConstraints?.length > 0) {
      setTemporalConstraintExist(true)
    } else {
      setTemporalConstraintExist(false)
    }
  }, [])

  useEffect(() => {
    const selectableGroups = getSelectableGroups(selectedCriteria, criteriaGroup)

    if (selectableGroups.length === 0) {
      if (temporalConstraints && temporalConstraints.length > 1) {
        temporalConstraints?.map((temporalConstraint) => {
          dispatch(deleteTemporalConstraint(temporalConstraint))
          dispatch(buildCohortCreation({ selectedPopulation: null }))
        })
      }
      setDisableTemporalConstraint(true)
    }
  }, [])

  const handleOnClose = () => void setModalIsOpen(false)

  const handleOnClick = () => {
    setModalIsOpen(true)
  }

  const hasClaim = useMemo(
    () => selectedCriteria.some((criteria) => criteria.type === CriteriaType.CLAIM),
    [selectedCriteria]
  )

  return (
    <>
      {!disableTemporalConstraint && !hasClaim ? (
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
        <Tooltip title="Les contraintes temporelles ne peuvent être ajoutées que s'il y a au moins un groupe de critères de type ET et au moins deux critères hors critères démographiques et d'IPP.">
          <span>
            <Button
              onClick={handleOnClick}
              className={classes.root}
              style={{
                backgroundColor:
                  temporalConstraintExist && !disableTemporalConstraint && !hasClaim ? '#FFE2A9' : '#DEDEDE'
              }}
              disabled={maintenanceIsActive || disableTemporalConstraint || hasClaim}
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
