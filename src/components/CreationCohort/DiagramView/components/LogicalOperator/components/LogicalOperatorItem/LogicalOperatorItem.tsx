import React, { useState, useEffect } from 'react'

import {
  Box,
  IconButton,
  MenuItem,
  Select,
  Typography,
  TextField,
  Button,
  Dialog,
  DialogActions,
  DialogContent
} from '@mui/material'

import WarningIcon from '@mui/icons-material/Warning'

import DeleteIcon from '@mui/icons-material/Delete'

import { useAppSelector, useAppDispatch } from 'state'
import {
  editCriteriaGroup,
  deleteCriteriaGroup,
  buildCohortCreation,
  updateTemporalConstraints
} from 'state/cohortCreation'

import useStyles from './styles'

type LogicalOperatorItemProps = {
  itemId: number
}

const LogicalOperatorItem: React.FC<LogicalOperatorItemProps> = ({ itemId }) => {
  const classes = useStyles()
  const dispatch = useAppDispatch()

  let timeout: NodeJS.Timeout | null = null

  const isMainOperator = itemId === 0

  const [isOpen, setOpen] = useState<boolean>(false)
  const [groupType, setGroupType] = useState('andGroup')
  const [openConfirmationDialog, setOpenConfirmationDialog] = useState<boolean>(false)

  const { request } = useAppSelector((state) => state.cohortCreation || {})
  const { criteriaGroup } = request

  useEffect(() => {
    const currentLogicalOperator = criteriaGroup.find(({ id }) => id === itemId)
    if (currentLogicalOperator) {
      if (currentLogicalOperator.type !== 'NamongM') {
        setGroupType(currentLogicalOperator.type)
      } else {
        switch (currentLogicalOperator.options.operator) {
          case '=':
            setGroupType('exactly')
            break
          case '<':
            setGroupType('atLeast')
            break
          case '>':
            setGroupType('atMost')
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
    NamongM: `${currentLogicalOperator.type === 'NamongM' ? currentLogicalOperator.options.number : 'X'} parmi ${
      currentLogicalOperator?.criteriaIds.length
    }`
  }

  let boxWidth = 50
  if (currentLogicalOperator.type === 'NamongM') {
    boxWidth = isOpen ? 500 : 75
  } else {
    boxWidth = isOpen ? 400 : 50
  }
  if (!isOpen && !currentLogicalOperator.isInclusive) {
    boxWidth += 30
  }

  const _buildCohortCreation = () => {
    dispatch(buildCohortCreation({}))
  }

  const _deleteLogicalOperator = async () => {
    await dispatch(deleteCriteriaGroup(itemId))
    _buildCohortCreation()
  }

  const _handleChangeLogicalOperatorProps = (key: string, value: any) => {
    const _currentLogicalOperator = criteriaGroup.find(({ id }) => id === itemId)
    if (!_currentLogicalOperator) return
    if (key === 'groupType') {
      setGroupType(value)

      switch (value) {
        case 'atLeast':
          dispatch(
            editCriteriaGroup({
              ..._currentLogicalOperator,
              type: 'NamongM',
              options: {
                operator: '<',
                number: 1,
                timeDelayMin: 0,
                timeDelayMax: 0
              }
            })
          )
          break
        case 'atMost':
          dispatch(
            editCriteriaGroup({
              ..._currentLogicalOperator,
              type: 'NamongM',
              options: {
                operator: '>',
                number: 1,
                timeDelayMin: 0,
                timeDelayMax: 0
              }
            })
          )
          break
        case 'exactly':
          dispatch(
            editCriteriaGroup({
              ..._currentLogicalOperator,
              type: 'NamongM',
              options: {
                operator: '=',
                number: 1,
                timeDelayMin: 0,
                timeDelayMax: 0
              }
            })
          )
          break
        case 'andGroup':
        case 'orGroup':
        default:
          dispatch(
            editCriteriaGroup({
              ..._currentLogicalOperator,
              type: value
            })
          )
          break
      }
    } else if (key === 'options.number') {
      dispatch(
        editCriteriaGroup({
          ..._currentLogicalOperator,
          type: 'NamongM',
          options: {
            operator: _currentLogicalOperator.type === 'NamongM' ? _currentLogicalOperator.options.operator : '<',
            number: value,
            timeDelayMin: _currentLogicalOperator.type === 'NamongM' ? _currentLogicalOperator.options.timeDelayMin : 0,
            timeDelayMax: _currentLogicalOperator.type === 'NamongM' ? _currentLogicalOperator.options.timeDelayMax : 0
          }
        })
      )
    } else {
      dispatch(
        editCriteriaGroup({
          ..._currentLogicalOperator,
          [key]: value
        })
      )
    }
    _buildCohortCreation()
  }

  return (
    <>
      {isOpen && <div className={classes.backDrop} onClick={() => setOpen(false)} />}

      <Box
        className={isMainOperator ? classes.mainLogicalOperator : classes.logicalOperator}
        style={{
          background: !currentLogicalOperator.isInclusive ? '#F2B0B0' : '#19235A',
          color: !currentLogicalOperator.isInclusive ? '#19235a' : 'white',
          width: boxWidth
        }}
        onClick={() => setOpen(true)}
        onMouseEnter={() => {
          setOpen(true)
          if (timeout) clearInterval(timeout)
        }}
        onMouseLeave={() => (timeout = setTimeout(() => setOpen(false), 1500))}
      >
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
                if (isMainOperator && event.target.value !== 'andGroup') {
                  setOpenConfirmationDialog(true)
                } else {
                  _handleChangeLogicalOperatorProps('groupType', event.target.value)
                }
              }}
              style={{ color: 'currentColor' }}
              variant="standard"
            >
              <MenuItem value={'andGroup'}>tous les</MenuItem>
              <MenuItem value={'orGroup'}>un des</MenuItem>
              {/* <MenuItem value={'exactly'}>exactement</MenuItem>
                <MenuItem value={'atLeast'}>au moins</MenuItem>
                <MenuItem value={'atMost'}>au plus</MenuItem> */}
            </Select>

            {currentLogicalOperator.type === 'NamongM' && (
              <TextField
                classes={{ root: classes.input }}
                value={currentLogicalOperator?.options?.number}
                onChange={(event) => _handleChangeLogicalOperatorProps('options.number', event.target.value)}
                type="number"
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
            {groupType === 'andGroup' || groupType === 'orGroup'
              ? logicalOperatorDic[groupType]
              : logicalOperatorDic['NamongM']}
          </Typography>
        )}
      </Box>

      <Dialog open={openConfirmationDialog} onClose={() => setOpenConfirmationDialog(false)}>
        <DialogContent
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}
        >
          <WarningIcon style={{ fontSize: 40, color: '#ff9800', margin: 12 }} />
          <Typography>
            L'ajout de contraintes temporelles n'étant possible que sur un groupe de critères <strong>ET</strong>,
            passer sur un groupe de critères <strong>OU</strong> vous fera perdre toutes vos précédentes contraintes
            temporelles.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button style={{ color: '#ED6D91' }} onClick={() => setOpenConfirmationDialog(false)}>
            Annuler
          </Button>
          <Button
            onClick={() => {
              dispatch(updateTemporalConstraints([]))
              _handleChangeLogicalOperatorProps('groupType', 'orGroup')
            }}
          >
            Confirmer
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default LogicalOperatorItem
