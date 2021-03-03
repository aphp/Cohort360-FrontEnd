import React, { useState, useEffect } from 'react'
import { useDispatch } from 'react-redux'

import { Box, MenuItem, Select, Typography, TextField } from '@material-ui/core'

import { useAppSelector } from 'state'
import { editCriteriaGroup } from 'state/cohortCreation'

import useStyles from './styles'

type LogicalOperatorItemProps = {
  itemId: number
}

const LogicalOperatorItem: React.FC<LogicalOperatorItemProps> = ({ itemId }) => {
  const classes = useStyles()
  const dispatch = useDispatch()

  const isMainOperator = itemId === 0
  const [isOpen, setOpen] = useState<boolean>(false)
  const [groupType, setGroupType] = useState('andGroup')

  const {
    request: { criteriaGroup }
  } = useAppSelector((state) => state.cohortCreation || {})

  const currentLogicalOperator = criteriaGroup.find(({ id }) => id === itemId)

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

  if (!currentLogicalOperator) return <></>

  const logicalOperatorDic = {
    andGroup: 'ET',
    orGroup: 'OU',
    NamongM: `${currentLogicalOperator.type === 'NamongM' ? currentLogicalOperator.options.number : 'X'} parmi ${
      currentLogicalOperator?.criteriaIds.length
    }`
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
                number: 1
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
                number: 1
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
                number: 1
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
            number: value
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
  }

  return (
    <>
      {isMainOperator ? (
        <Box className={classes.mainLogicalOperator}>
          <Typography variant="h5" style={{ lineHeight: '42px', margin: 'auto' }}>
            ET
          </Typography>
        </Box>
      ) : (
        <Box
          className={classes.logicalOperator}
          onMouseEnter={() => setOpen(true)}
          onMouseLeave={() => setTimeout(() => setOpen(false), 500)}
        >
          {isOpen ? (
            <>
              <Select
                labelId="inclusive-simple-select-label"
                id="inclusive-select"
                value={`${currentLogicalOperator.isInclusive}`}
                onChange={(event) => _handleChangeLogicalOperatorProps('isInclusive', event.target.value === 'true')}
                style={{ width: 100, margin: '0 4px', color: 'currentColor' }}
              >
                <MenuItem value={'true'}>Inclure</MenuItem>
                <MenuItem value={'false'}>Exclure</MenuItem>
              </Select>

              <Typography variant="h5" style={{ lineHeight: '42px' }}>
                les patients validant
              </Typography>

              <Select
                labelId="inclusive-simple-select-label"
                id="inclusive-select"
                value={groupType}
                onChange={(event) => _handleChangeLogicalOperatorProps('groupType', event.target.value)}
                style={{ width: 100, margin: '0 4px', color: 'currentColor' }}
              >
                <MenuItem value={'andGroup'}>tous les</MenuItem>
                <MenuItem value={'orGroup'}>un des</MenuItem>
                <MenuItem value={'exactly'}>exactement</MenuItem>
                <MenuItem value={'atLeast'}>au moins</MenuItem>
                <MenuItem value={'atMost'}>au plus</MenuItem>
              </Select>

              {currentLogicalOperator.type === 'NamongM' && (
                <TextField
                  style={{ color: 'white' }}
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

              <Typography variant="h5" style={{ lineHeight: '42px' }}>
                critère(s)
              </Typography>
            </>
          ) : (
            <Typography variant="h5" style={{ lineHeight: '42px', margin: 'auto', padding: '0 4px' }}>
              {groupType === 'andGroup' || groupType === 'orGroup'
                ? logicalOperatorDic[groupType]
                : logicalOperatorDic['NamongM']}
            </Typography>
          )}
        </Box>
      )}
    </>
  )
}

export default LogicalOperatorItem
