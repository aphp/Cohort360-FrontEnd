import React, { useEffect, useRef, useState } from 'react'

import { IconButton, Typography, Grid } from '@mui/material'

import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import WarningIcon from '@mui/icons-material/Warning'
import LibraryAddIcon from '@mui/icons-material/LibraryAdd'

import Avatar from 'components/ui/Avatar/Avatar'
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'

import { useAppSelector } from 'state'
import { MeState } from 'state/me'

import useStyles from './styles'
import { criteriasAsArray } from 'utils/requestCriterias'
import { ChipWrapper } from 'components/ui/Chip/styles'
import { SelectedCriteriaType } from 'types/requestCriterias'
import { CriteriaState } from 'state/criteria'

type CriteriaCardProps = {
  criterion: SelectedCriteriaType
  duplicateCriteria: (criteriaId: number) => void
  deleteCriteria: (criteriaId: number) => void
  editCriteria: (criteria: SelectedCriteriaType) => void
}

const CriteriaCard = ({ criterion, duplicateCriteria, editCriteria, deleteCriteria }: CriteriaCardProps) => {
  const { classes } = useStyles()

  const { meState } = useAppSelector<{ meState: MeState }>((state) => ({ meState: state.me }))
  const { criteria } = useAppSelector<{ criteria: CriteriaState }>((state) => state.cohortCreation)

  const maintenanceIsActive = meState?.maintenance?.active

  const [needCollapse, setNeedCollapse] = useState(false)
  const [openCollapse, setOpenCollapse] = useState(false)

  const containerRef = useRef<HTMLDivElement>(null)
  const childrenRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const containerHeight = containerRef.current?.clientHeight || 0
    const childrenHeight = childrenRef.current?.clientHeight || 0
    if (childrenHeight > containerHeight) setNeedCollapse(true)
    else setNeedCollapse(false)
  }, [containerRef.current?.clientWidth])

  return (
    <Grid
      container
      alignItems={'center'}
      className={classes.criteriaItem}
      style={{ backgroundColor: criterion.isInclusive ? '#D1E2F4' : '#F2B0B0' }}
    >
      <Grid container alignItems="center" item xs={7} xl={3} padding={'5px'}>
        <Avatar size={20} content={criterion.id} />
        <Typography className={classes.title} fontWeight={700}>
          {criterion.title} :
        </Typography>
      </Grid>
      <Grid
        container
        item
        xs={12}
        xl={7}
        ref={containerRef}
        style={{ height: openCollapse ? '' : 42 }}
        className={classes.secondItem}
      >
        <Grid item xs={11} container ref={childrenRef} style={{ overflow: 'hidden' }}>
          {criteriasAsArray(criterion, criterion.type, criteria).map((label, index) => (
            <ChipWrapper key={index} label={label} style={{ margin: 5, maxWidth: 'calc(100% - 5px)' }} />
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
      <Grid container xs={5} xl={2} justifyContent="flex-end">
        {criterion.error && (
          <IconButton
            size="small"
            onClick={() => editCriteria(criterion)}
            color="secondary"
            disabled={maintenanceIsActive}
          >
            <WarningIcon />
          </IconButton>
        )}
        <IconButton
          size="small"
          onClick={() => duplicateCriteria(criterion.id)}
          style={maintenanceIsActive ? { color: '#CBCFCF' } : { color: 'currentcolor' }}
          disabled={maintenanceIsActive}
        >
          <LibraryAddIcon />
        </IconButton>
        <IconButton
          size="small"
          onClick={() => editCriteria(criterion)}
          style={maintenanceIsActive ? { color: '#CBCFCF' } : { color: 'currentcolor' }}
          disabled={maintenanceIsActive}
        >
          <EditIcon />
        </IconButton>
        <IconButton
          size="small"
          onClick={() => deleteCriteria(criterion.id)}
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
