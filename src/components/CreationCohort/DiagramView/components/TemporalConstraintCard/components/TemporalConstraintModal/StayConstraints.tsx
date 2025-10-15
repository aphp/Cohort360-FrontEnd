import React, { useState } from 'react'

import { Grid, Typography } from '@mui/material'

import { useAppSelector } from 'state'

import { CriteriaGroupType, TemporalConstraintsKind, TemporalConstraintsType } from 'types'
import WarningIcon from '@mui/icons-material/Warning'

import _ from 'lodash'
import { getSelectableGroups } from 'utils/temporalConstraints'
import RadioGroup from 'components/ui/RadioGroup'
import PartialConstraintLayout from 'components/ui/PartialConstraintLayout'
import Modal from 'components/ui/Modal'

interface StayConstraintsProps {
  constraints: TemporalConstraintsType[]
  onChangeConstraints: (temporalConstraints: TemporalConstraintsType[]) => void
}

const StayConstraints: React.FC<StayConstraintsProps> = ({ constraints, onChangeConstraints }) => {
  const { criteriaGroup, selectedCriteria } = useAppSelector((state) => state.cohortCreation.request)

  const findInitialStateRadio = (temporalConstraints: TemporalConstraintsType[]) => {
    const globalConstraintId = temporalConstraints.findIndex((constraint) => constraint.idList.includes('All' as never))

    let initialStateRadio = TemporalConstraintsKind.NONE
    if (globalConstraintId >= 0) {
      initialStateRadio = temporalConstraints[globalConstraintId].constraintType
    } else {
      initialStateRadio =
        temporalConstraints.length > 0 ? TemporalConstraintsKind.PARTIAL_CONSTRAINT : TemporalConstraintsKind.NONE
    }

    return initialStateRadio
  }

  const [radioValues, setRadioValues] = useState<TemporalConstraintsKind>(
    findInitialStateRadio(constraints) ?? TemporalConstraintsKind.NONE
  )
  const [openConfirmationDialog, setOpenConfirmationDialog] = useState<boolean>(false)

  const temporalConstraintsTypes = [
    {
      id: TemporalConstraintsKind.NONE,
      label: 'Aucune contrainte sur les séjours'
    },
    {
      id: TemporalConstraintsKind.SAME_ENCOUNTER,
      label: 'Tous les critères ont lieu au cours du même séjour',
      disabled: criteriaGroup[0].type === CriteriaGroupType.OR_GROUP
    },
    {
      id: TemporalConstraintsKind.PARTIAL_CONSTRAINT,
      label: 'Certains critères ont lieu au cours du même séjour'
    }
  ]

  const onChangeValue = (value: TemporalConstraintsKind) => {
    setRadioValues(value)

    if (value !== TemporalConstraintsKind.PARTIAL_CONSTRAINT) {
      onChangeConstraints([{ idList: ['All'], constraintType: value }])
    } else {
      onChangeConstraints([])
    }
  }

  const onConfirm = (newConstraint: TemporalConstraintsType) => {
    onChangeConstraints([...constraints, newConstraint])
  }

  const onDelete = (_constraint: TemporalConstraintsType) => {
    onChangeConstraints(constraints.filter((constraint) => !_.isEqual(constraint, _constraint)))
  }

  return (
    <>
      <Grid>
        <Typography variant="h3">Contraintes sur les séjours</Typography>
        <RadioGroup
          row
          value={radioValues}
          onChange={(e) => {
            if (
              radioValues === TemporalConstraintsKind.PARTIAL_CONSTRAINT &&
              constraints.find((constraint) => constraint.constraintType === TemporalConstraintsKind.SAME_ENCOUNTER)
            ) {
              setOpenConfirmationDialog(true)
              setRadioValues(e as TemporalConstraintsKind)
            } else {
              onChangeValue(e as TemporalConstraintsKind)
            }
          }}
          options={temporalConstraintsTypes}
          style={{ margin: '1em', justifyContent: 'space-around' }}
        />
      </Grid>
      {radioValues === TemporalConstraintsKind.PARTIAL_CONSTRAINT && (
        <PartialConstraintLayout
          data={{
            title: 'Contrainte de même séjour',
            constraints: constraints,
            selectableGroups: getSelectableGroups(selectedCriteria, criteriaGroup)
          }}
          actions={{
            onConfirm: onConfirm,
            onDelete: onDelete
          }}
        />
      )}

      <Modal
        open={openConfirmationDialog}
        onClose={() => {
          setOpenConfirmationDialog(false)
          setRadioValues(TemporalConstraintsKind.PARTIAL_CONSTRAINT)
        }}
        onSubmit={() => {
          onChangeValue(radioValues)
          setOpenConfirmationDialog(false)
        }}
        submitText="Confirmer"
        cancelText="Annuler"
        maxWidth="md"
      >
        <WarningIcon color="warning" style={{ verticalAlign: 'middle', marginRight: 8 }} />
        Attention, en passant sur un type de contrainte temporelle globale, vous perdrez toutes les contraintes
        partielles déjà ajoutées.
      </Modal>
    </>
  )
}

export default StayConstraints
