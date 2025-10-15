import React, { useState } from 'react'

import { Grid, Tooltip, Typography } from '@mui/material'
import InfoIcon from '@mui/icons-material/Info'

import { useAppSelector } from 'state'
import WarningIcon from '@mui/icons-material/Warning'
import { CriteriaGroupType, TemporalConstraintsKind, TemporalConstraintsType } from 'types'
import _ from 'lodash'
import { getSelectableGroups } from 'utils/temporalConstraints'
import RadioGroup from 'components/ui/RadioGroup'
import PartialConstraintLayout from 'components/ui/PartialConstraintLayout'
import Modal from 'components/ui/Modal'

interface EpisodeConstraintsProps {
  constraints: TemporalConstraintsType[]
  onChangeConstraints: (temporalConstraints: TemporalConstraintsType[]) => void
}

const EpisodeConstraints: React.FC<EpisodeConstraintsProps> = ({ constraints, onChangeConstraints }) => {
  const { criteriaGroup, selectedCriteria } = useAppSelector((state) => state.cohortCreation.request)

  const findInitialStateRadio = (temporalConstraints: TemporalConstraintsType[]) => {
    const globalConstraintId = temporalConstraints.findIndex((constraint) => constraint.idList.includes('All' as never))

    let initialStateRadio = TemporalConstraintsKind.NONE
    if (globalConstraintId >= 0) {
      initialStateRadio = temporalConstraints[globalConstraintId].constraintType
    } else {
      initialStateRadio =
        temporalConstraints.length > 0
          ? TemporalConstraintsKind.PARTIAL_EPISODE_CONSTRAINT
          : TemporalConstraintsKind.NONE
    }

    return initialStateRadio
  }

  const [radioValues, setRadioValues] = useState<TemporalConstraintsKind>(
    findInitialStateRadio(constraints) ?? TemporalConstraintsKind.NONE
  )
  const [openConfirmationDialog, setOpenConfirmationDialog] = useState<boolean>(false)

  const episodesTemporalConstraintsTypes = [
    {
      id: TemporalConstraintsKind.NONE,
      label: 'Aucune contrainte sur les épisodes'
    },
    {
      id: TemporalConstraintsKind.SAME_EPISODE_OF_CARE,
      label: 'Tous les critères ont lieu au cours du même épisode',
      disabled: criteriaGroup[0].type === CriteriaGroupType.OR_GROUP
    },
    {
      id: TemporalConstraintsKind.PARTIAL_EPISODE_CONSTRAINT,
      label: 'Certains critères ont lieu au cours du même épisode'
    }
  ]

  const onChangeValue = (value: TemporalConstraintsKind) => {
    setRadioValues(value)

    if (value !== TemporalConstraintsKind.PARTIAL_EPISODE_CONSTRAINT) {
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
        <Grid container sx={{ flexDirection: 'row', alignItems: 'center' }}>
          <Typography variant="h3">Contraintes sur les épisodes</Typography>
          <Tooltip title="Les contraintes sur les épisodes ne s'appliquent qu'aux critères de dossiers de spécialité de type: Maternité">
            <InfoIcon fontSize="small" color="primary" style={{ marginLeft: 4 }} />
          </Tooltip>
        </Grid>
        <RadioGroup
          row
          value={radioValues}
          onChange={(e) => {
            if (
              radioValues === TemporalConstraintsKind.PARTIAL_EPISODE_CONSTRAINT &&
              constraints.find(
                (constraint) => constraint.constraintType === TemporalConstraintsKind.SAME_EPISODE_OF_CARE
              )
            ) {
              setOpenConfirmationDialog(true)
              setRadioValues(e as TemporalConstraintsKind)
            } else {
              onChangeValue(e as TemporalConstraintsKind)
            }
          }}
          options={episodesTemporalConstraintsTypes}
          style={{ margin: '1em', justifyContent: 'space-around' }}
        />
      </Grid>
      {radioValues === TemporalConstraintsKind.PARTIAL_EPISODE_CONSTRAINT && (
        <PartialConstraintLayout
          isEpisode
          data={{
            title: 'Contrainte de même épisode',
            constraints: constraints,
            selectableGroups: getSelectableGroups(selectedCriteria, criteriaGroup, true)
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
          setRadioValues(TemporalConstraintsKind.PARTIAL_EPISODE_CONSTRAINT)
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

export default EpisodeConstraints
