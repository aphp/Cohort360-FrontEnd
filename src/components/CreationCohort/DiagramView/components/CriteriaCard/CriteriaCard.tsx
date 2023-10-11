import React, { Fragment, useEffect, useRef, useState } from 'react'

import { IconButton, Typography, Grid } from '@mui/material'

import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import WarningIcon from '@mui/icons-material/Warning'
import LibraryAddIcon from '@mui/icons-material/LibraryAdd'

import CriteriaCardContent from './components/CriteriaCardContent/CriteriaCardContent'
import Avatar from 'components/ui/Avatar/Avatar'
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'

import { useAppSelector } from 'state'
import { MeState } from 'state/me'

import useStyles from './styles'
import { SelectedCriteriaType } from 'types'
import { checkIfCardNeedsCollapse } from 'utils/screen'
import { criteriasAsArray } from 'utils/requestCriterias'
import { ChipWrapper } from 'components/ui/Chips/styles'
import { RequestCriteriasKeys } from 'types/requestCriterias'

type CriteriaCardProps = {
  itemId: number
  duplicateCriteria: (criteriaId: number) => void
  deleteCriteria: (criteriaId: number) => void
  editCriteria: (criteria: SelectedCriteriaType) => void
}

const CriteriaCard: React.FC<CriteriaCardProps> = ({ itemId, duplicateCriteria, editCriteria, deleteCriteria }) => {
  const { classes } = useStyles()

  const { meState } = useAppSelector<{ meState: MeState }>((state) => ({ meState: state.me }))
  const maintenanceIsActive = meState?.maintenance?.active

  /* à améliorer => inutile et peut être passé en props */
  const { selectedCriteria = [] } = useAppSelector((state) => state.cohortCreation.request || {})

  const currentCriterion = selectedCriteria.find((criteria) => criteria.id === itemId)

  const [needCollapse, setNeedCollapse] = useState(false)
  const [openCollapse, setOpenCollapse] = useState(false)

  const containerRef = useRef(null)
  const childrenRef = useRef(null)

  if (!currentCriterion) return <></> // Bug, not possible ... The current item is not a criteria

  useEffect(() => {
    console.log('overflowTest', containerRef)
    console.log('overflowTest', childrenRef)
    if (childrenRef.current?.clientHeight > containerRef.current?.clientHeight) setNeedCollapse(true)
    else setNeedCollapse(false)
  }, [containerRef])

  return (
    <Grid
      container
      justifyContent={'space-between'}
      alignItems={'flex-start'}
      className={classes.criteriaItem}
      style={{ backgroundColor: currentCriterion.isInclusive ? '#D1E2F4' : '#F2B0B0' }}
    >
      <Grid container alignItems="center" item xs={12} md={4} lg={3} padding={'5px'}>
        <Grid item xs={1}>
          <Avatar content={currentCriterion.id} />
        </Grid>
        <Grid item xs={11}>
          <Typography className={classes.title}>- {currentCriterion.title} :</Typography>
        </Grid>
      </Grid>
      <Grid
        container
        item
        xs={12}
        md={6}
        lg={7}
        ref={containerRef}
        style={{ height: openCollapse ? '' : 42, overflow: 'hidden' }}
      >
        <Grid item xs={11} container ref={childrenRef} className={classes.secondItem}>
          {criteriasAsArray(currentCriterion, currentCriterion.type as RequestCriteriasKeys).map((label, index) => (
            <Grid key={index} margin={'5px'}>
              <ChipWrapper label={label} />
            </Grid>
          ))}
        </Grid>
        <Grid item xs={1}>
          {needCollapse && (
            <IconButton onClick={() => setOpenCollapse(!openCollapse)} size="small">
              {openCollapse ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
            </IconButton>
          )}
        </Grid>
      </Grid>
      <Grid item xs={12} lg={2} container justifyContent="flex-end" gridColumn={2}>
        {currentCriterion.error && (
          <IconButton
            size="small"
            onClick={() => editCriteria(currentCriterion)}
            color="secondary"
            disabled={maintenanceIsActive}
          >
            <WarningIcon />
          </IconButton>
        )}
        <IconButton
          size="small"
          onClick={() => duplicateCriteria(currentCriterion.id)}
          style={maintenanceIsActive ? { color: '#CBCFCF' } : { color: 'currentcolor' }}
          disabled={maintenanceIsActive}
        >
          <LibraryAddIcon />
        </IconButton>
        <IconButton
          size="small"
          onClick={() => editCriteria(currentCriterion)}
          style={maintenanceIsActive ? { color: '#CBCFCF' } : { color: 'currentcolor' }}
          disabled={maintenanceIsActive}
        >
          <EditIcon />
        </IconButton>
        <IconButton
          size="small"
          onClick={() => deleteCriteria(currentCriterion.id)}
          style={maintenanceIsActive ? { color: '#CBCFCF' } : { color: 'currentcolor' }}
          disabled={maintenanceIsActive}
        >
          <DeleteIcon />
        </IconButton>
      </Grid>
    </Grid>
  )
}

export default CriteriaCard
