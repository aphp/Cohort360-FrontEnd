import React, { useState } from 'react'

import { Grid, Tooltip, Typography } from '@mui/material'
import InfoIcon from '@mui/icons-material/Info'

import { useAppSelector } from 'state'

import { TemporalConstraintsKind, TemporalConstraintsType } from 'types'
import ConfirmationDialog from 'components/ui/ConfirmationDialog/ConfirmationDialog'

import _ from 'lodash'
import { getSelectableGroups } from 'utils/temporalConstraints'
import RadioGroup from 'components/ui/RadioGroup'
import PartialConstraintLayout from 'components/ui/PartialConstraintLayout'

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
      disabled: criteriaGroup[0].type === 'orGroup'
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
        <Grid item container direction="row" alignItems="center">
          <Typography variant="h3">Contraintes sur les épisodes</Typography>
          <Tooltip title="Les contraintes sur les épisodes ne s'appliquent qu'aux critères de formulaires de dossiers de maternité">
            <InfoIcon fontSize="small" color="primary" style={{ marginLeft: 4 }} />
          </Tooltip>
        </Grid>
        <RadioGroup
          row
          selectedValue={radioValues}
          onchange={(e) => {
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
          items={episodesTemporalConstraintsTypes}
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

      <ConfirmationDialog
        open={openConfirmationDialog}
        message={
          'Attention, en passant sur un type de contrainte temporelle globale, vous perdrez toutes les contraintes partielles déjà ajoutées.'
        }
        onClose={() => setOpenConfirmationDialog(false)}
        onCancel={() => {
          setOpenConfirmationDialog(false)
          setRadioValues(TemporalConstraintsKind.PARTIAL_EPISODE_CONSTRAINT)
        }}
        onConfirm={() => {
          onChangeValue(radioValues)
          setOpenConfirmationDialog(false)
        }}
      />
    </>
  )
}

export default EpisodeConstraints
