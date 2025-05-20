import React, { useState, useEffect } from 'react'

import { Box, IconButton, MenuItem, Select, Typography, TextField } from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'

import { useAppSelector, useAppDispatch } from 'state'
import {
  editCriteriaGroup,
  deleteCriteriaGroup,
  buildCohortCreation,
  updateTemporalConstraints
} from 'state/cohortCreation'

import useStyles from './styles'
import ConfirmationDialog from 'components/ui/ConfirmationDialog/ConfirmationDialog'
import { Comparators } from 'types/requestCriterias'
import { CriteriaGroupType } from 'types'
import CriteriaCount, { CriteriaCountType } from '../../../CriteriaCount'

type LogicalOperatorItemProps = {
  itemId: number
  criteriaCount?: CriteriaCountType
}

const LogicalOperatorItem: React.FC<LogicalOperatorItemProps> = ({ itemId, criteriaCount }) => {
  const { classes } = useStyles()
  const dispatch = useAppDispatch()

  let timeout: NodeJS.Timeout | null = null

  const isMainOperator = itemId === 0

  const [isOpen, setIsOpen] = useState<boolean>(false)
  const [groupType, setGroupType] = useState<CriteriaGroupType>(CriteriaGroupType.AND_GROUP)
  const [openConfirmationDialog, setOpenConfirmationDialog] = useState<boolean>(false)

  const { request } = useAppSelector((state) => state.cohortCreation || {})
  const { criteriaGroup, temporalConstraints } = request

  useEffect(() => {
    const currentLogicalOperator = criteriaGroup.find(({ id }) => id === itemId)
    if (currentLogicalOperator) {
      if (currentLogicalOperator.type !== CriteriaGroupType.N_AMONG_M) {
        setGroupType(currentLogicalOperator.type)
      } else {
        switch (currentLogicalOperator.options.operator) {
          case Comparators.EQUAL:
            setGroupType(CriteriaGroupType.EXACTLY)
            break
          case Comparators.LESS:
            setGroupType(CriteriaGroupType.AT_LEAST)
            break
          case Comparators.GREATER:
            setGroupType(CriteriaGroupType.AT_MOST)
            break
          default:
            break
        }
      }
    }
  }, [itemId]) // eslint-disable-line

  const currentLogicalOperator = criteriaGroup.find(({ id }) => id === itemId)
  if (!currentLogicalOperator) return <></>

  const logicalOperatorDic = {
    andGroup: 'ET',
    orGroup: 'OU',
    nAmongM: `${
      currentLogicalOperator.type === CriteriaGroupType.N_AMONG_M ? currentLogicalOperator.options.number : 'X'
    } parmi ${currentLogicalOperator?.criteriaIds.length}`
  }

  let boxWidth: number
  if (currentLogicalOperator.type === CriteriaGroupType.N_AMONG_M) {
    boxWidth = isOpen ? 500 : 75
  } else {
    boxWidth = isOpen ? 400 : 50
  }
  if (!isOpen && !currentLogicalOperator.isInclusive) {
    boxWidth = 80
  }

  const _buildCohortCreation = () => {
    dispatch(buildCohortCreation({ selectedPopulation: null }))
  }

  const _deleteLogicalOperator = () => {
    dispatch(deleteCriteriaGroup(itemId))
    _buildCohortCreation()
  }

  const _handleChangeLogicalOperatorProps = (
    key: 'isInclusive' | 'groupType' | 'options.number',
    value: boolean | CriteriaGroupType | number | string
  ) => {
    const _currentLogicalOperator = criteriaGroup.find(({ id }) => id === itemId)
    if (!_currentLogicalOperator) return
    if (key === 'groupType') {
      setGroupType(value as CriteriaGroupType)

      switch (value) {
        case CriteriaGroupType.AT_LEAST:
          dispatch(
            editCriteriaGroup({
              ..._currentLogicalOperator,
              type: CriteriaGroupType.N_AMONG_M,
              options: {
                operator: Comparators.LESS,
                number: 1,
                timeDelayMin: 0,
                timeDelayMax: 0
              }
            })
          )
          break
        case CriteriaGroupType.AT_MOST:
          dispatch(
            editCriteriaGroup({
              ..._currentLogicalOperator,
              type: CriteriaGroupType.N_AMONG_M,
              options: {
                operator: Comparators.GREATER,
                number: 1,
                timeDelayMin: 0,
                timeDelayMax: 0
              }
            })
          )
          break
        case CriteriaGroupType.EXACTLY:
          dispatch(
            editCriteriaGroup({
              ..._currentLogicalOperator,
              type: CriteriaGroupType.N_AMONG_M,
              options: {
                operator: Comparators.EQUAL,
                number: 1,
                timeDelayMin: 0,
                timeDelayMax: 0
              }
            })
          )
          break
        case CriteriaGroupType.AND_GROUP:
        case CriteriaGroupType.OR_GROUP:
        default:
          dispatch(
            editCriteriaGroup({
              ..._currentLogicalOperator,
              type: value as CriteriaGroupType.AND_GROUP | CriteriaGroupType.OR_GROUP
            })
          )
          break
      }
    } else if (key === 'options.number') {
      dispatch(
        editCriteriaGroup({
          ..._currentLogicalOperator,
          type: CriteriaGroupType.N_AMONG_M,
          options: {
            operator:
              _currentLogicalOperator.type === CriteriaGroupType.N_AMONG_M
                ? _currentLogicalOperator.options.operator
                : Comparators.LESS,
            number: value as number,
            timeDelayMin:
              _currentLogicalOperator.type === CriteriaGroupType.N_AMONG_M
                ? _currentLogicalOperator.options.timeDelayMin
                : 0,
            timeDelayMax:
              _currentLogicalOperator.type === CriteriaGroupType.N_AMONG_M
                ? _currentLogicalOperator.options.timeDelayMax
                : 0
          }
        })
      )
    } else {
      dispatch(
        editCriteriaGroup({
          ..._currentLogicalOperator,
          [key]: value as boolean
        })
      )
    }
    _buildCohortCreation()
  }

  const deleteInvalidConstraints = () => {
    const currentLogicalOperatorCriteriaIds: number[] = criteriaGroup.find(({ id }) => id === itemId)?.criteriaIds ?? []

    const correctConstraints = temporalConstraints.filter((constraint) => {
      const constraintsInAndGroup = !(constraint.idList as number[]).some((criteriaId: number) =>
        currentLogicalOperatorCriteriaIds.includes(criteriaId)
      )

      const noGlobalConstraints = itemId !== 0 || !constraint.idList.includes('All' as never)

      return constraintsInAndGroup && noGlobalConstraints
    })

    dispatch(updateTemporalConstraints(correctConstraints))
  }

  return (
    <>
      <Box
        className={isMainOperator ? classes.mainLogicalOperator : classes.logicalOperator}
        style={{
          background: !currentLogicalOperator.isInclusive ? '#F2B0B0' : '#19235A',
          color: !currentLogicalOperator.isInclusive ? '#19235a' : 'white',
          width: boxWidth
        }}
        onMouseEnter={() => {
          setIsOpen(true)
          if (timeout) clearInterval(timeout)
        }}
        onMouseLeave={() => (timeout = setTimeout(() => setIsOpen(false), 800))}
      >
        {itemId !== 0 ? <CriteriaCount criteriaCount={criteriaCount} /> : null}
        {isOpen ? (
          <>
            <Select
              labelId="inclusive-simple-select-label"
              id="inclusive-select"
              value={`${currentLogicalOperator.isInclusive}`}
              classes={{ icon: classes.selectIcon }}
              className={classes.inputSelect}
              onChange={(event) => _handleChangeLogicalOperatorProps('isInclusive', event.target.value === 'true')}
              style={{ color: 'currentColor', marginLeft: 8 }}
              variant="standard"
            >
              <MenuItem value={'true'}>Inclure</MenuItem>
              <MenuItem value={'false'}>Exclure</MenuItem>
            </Select>

            <Typography variant="h5" className={classes.descriptionText}>
              les patients validant
            </Typography>
            <Select
              labelId="inclusive-simple-select-label"
              id="inclusive-select"
              value={groupType}
              classes={{ icon: classes.selectIcon }}
              className={classes.inputSelect}
              onChange={(event) => {
                if (event.target.value !== CriteriaGroupType.AND_GROUP) {
                  setOpenConfirmationDialog(true)
                } else {
                  _handleChangeLogicalOperatorProps('groupType', event.target.value)
                }
              }}
              style={{ color: 'currentColor' }}
              variant="standard"
            >
              <MenuItem value={CriteriaGroupType.AND_GROUP}>tous les</MenuItem>
              <MenuItem value={CriteriaGroupType.OR_GROUP}>un des</MenuItem>
              {/* <MenuItem value={CriteriaGroupType.EXACTLY}>exactement</MenuItem>
              <MenuItem value={CriteriaGroupType.AT_LEAST}>au moins</MenuItem>
              <MenuItem value={CriteriaGroupType.AT_MOST}>au plus</MenuItem> */}
            </Select>

            {currentLogicalOperator.type === CriteriaGroupType.N_AMONG_M && (
              <TextField
                classes={{ root: classes.input }}
                value={currentLogicalOperator?.options?.number}
                type="number"
                onChange={(event) => _handleChangeLogicalOperatorProps('options.number', event.target.value)}
                inputProps={{
                  max: currentLogicalOperator.criteriaIds.length,
                  min: 1
                }}
                InputLabelProps={{
                  shrink: true
                }}
              />
            )}

            <Typography variant="h5" className={classes.descriptionText}>
              critère(s)
            </Typography>

            {!isMainOperator && (
              <IconButton className={classes.deleteButton} size="small" onClick={() => _deleteLogicalOperator()}>
                <DeleteIcon />
              </IconButton>
            )}
          </>
        ) : (
          <Typography variant="h5" className={classes.textOperator}>
            {!currentLogicalOperator.isInclusive && 'NON '}
            {groupType === CriteriaGroupType.AND_GROUP || groupType === CriteriaGroupType.OR_GROUP
              ? logicalOperatorDic[groupType]
              : logicalOperatorDic[CriteriaGroupType.N_AMONG_M]}
          </Typography>
        )}
      </Box>

      <ConfirmationDialog
        open={openConfirmationDialog}
        onCancel={() => setOpenConfirmationDialog(false)}
        onClose={() => setOpenConfirmationDialog(false)}
        onConfirm={() => {
          deleteInvalidConstraints()
          _handleChangeLogicalOperatorProps('groupType', CriteriaGroupType.OR_GROUP)
        }}
        message={
          "L'ajout de contraintes temporelles n'étant possible que sur un groupe de critères ET, passer sur un groupe de critères OU vous fera perdre toutes les contraintes temporelles de ce groupe."
        }
      />
    </>
  )
}

export default LogicalOperatorItem
