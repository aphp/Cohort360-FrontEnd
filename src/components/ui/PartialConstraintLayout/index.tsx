import React, { useState } from 'react'
import {
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  Grid,
  IconButton,
  MenuItem,
  Select,
  Typography
} from '@mui/material'
import { CriteriaGroup, TemporalConstraintsKind, TemporalConstraintsType } from 'types'
import Card from '../Cards/PartialConstraints/Card'
import { AvatarWrapper } from '../Avatar/styles'
import AddCircleIcon from '@mui/icons-material/AddCircle'
import DeleteIcon from '@mui/icons-material/Delete'
import useStyles from './styles'
import { CriteriaType, SelectedCriteriaType } from 'types/requestCriterias'
import { useAppSelector } from 'state'

type EncounterConstraint = {
  selectedGroup: number | null
  criteriaIds: number[]
}

interface PartialConstraintLayoutProps {
  isEpisode?: boolean
  data: {
    title: string
    constraints: TemporalConstraintsType[]
    selectableGroups: CriteriaGroup[]
  }
  actions: {
    onConfirm: (constraint: TemporalConstraintsType) => void
    onDelete: (constraint: TemporalConstraintsType) => void
  }
}

const defaultEncounterConstraint: EncounterConstraint = {
  selectedGroup: null,
  criteriaIds: []
}

const PartialConstraintLayout: React.FC<PartialConstraintLayoutProps> = ({ isEpisode, data, actions }) => {
  const { classes } = useStyles()
  const { criteriaGroup, selectedCriteria } = useAppSelector((state) => state.cohortCreation.request)
  const [encounterConstraint, setEncounterConstraint] = useState<EncounterConstraint>(defaultEncounterConstraint)
  const [showAddConstraintIcon, setShowAddConstraintIcon] = useState<boolean>(true)
  const [showAddConstraintCard, setShowAddConstraintCard] = useState<boolean>(false)

  const { title, constraints, selectableGroups } = data
  const { onConfirm, onDelete } = actions

  const _onConfirm = () => {
    const newConstraint: TemporalConstraintsType = {
      idList: encounterConstraint.criteriaIds.sort(),
      constraintType: isEpisode ? TemporalConstraintsKind.SAME_EPISODE_OF_CARE : TemporalConstraintsKind.SAME_ENCOUNTER
    }
    setEncounterConstraint(defaultEncounterConstraint)
    setShowAddConstraintCard(false)
    setShowAddConstraintIcon(true)
    onConfirm(newConstraint)
  }

  const displayCriteria = (criteriaId: number) => {
    const criteriaName = selectedCriteria.find((criteria) => criteria.id === criteriaId)?.title
    return criteriaName
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

    return isEpisode
      ? groupCriteria.filter(
          (criteria) => criteria.type === CriteriaType.PREGNANCY || criteria.type === CriteriaType.HOSPIT
        )
      : groupCriteria.filter(
          (criteria) => criteria.type !== CriteriaType.IPP_LIST && criteria.type !== CriteriaType.PATIENT
        )
  }

  return (
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
            constraints.filter((constraint) => !constraint.idList.includes('All' as never)).length === 0
              ? '100%'
              : 'fit-content',
          justifyContent:
            constraints.filter((constraint) => !constraint.idList.includes('All' as never)).length === 0
              ? 'center'
              : 'flex-start'
        }}
      >
        {constraints
          .filter(
            (constraint) =>
              !constraint.idList.includes('All' as never) &&
              (isEpisode
                ? constraint.constraintType === TemporalConstraintsKind.SAME_EPISODE_OF_CARE
                : constraint.constraintType === TemporalConstraintsKind.SAME_ENCOUNTER)
          )
          .map((constraint, index) => (
            <Card
              key={index}
              title={title}
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
                  size={constraint.idList.length > 3 ? { xs: 6 } : undefined}
                  sx={{ alignItems: 'center', margin: '4px 0' }}
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
            title={title}
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
                <Button onClick={_onConfirm} disabled={encounterConstraint.criteriaIds.length <= 1}>
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
                {selectableGroups.map((selectValue, index) => (
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
                      <Grid container sx={{ alignItems: 'center' }} wrap="nowrap">
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
  )
}

export default PartialConstraintLayout
