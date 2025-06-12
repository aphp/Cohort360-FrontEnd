import React, { useEffect, useRef, useState } from 'react'

import { IconButton, Typography, Grid, useMediaQuery } from '@mui/material'

import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import WarningIcon from '@mui/icons-material/Warning'
import LibraryAddIcon from '@mui/icons-material/LibraryAdd'

import { AvatarWrapper } from 'components/ui/Avatar/styles'
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'

import { useAppSelector } from 'state'

import useStyles from './styles'
import { ChipWrapper } from 'components/ui/Chip/styles'
import { SelectedCriteriaType } from 'types/requestCriterias'
import theme from 'theme'
import criteriaList, { getAllCriteriaItems } from 'components/CreationCohort/DataList_Criteria'
import { criteriasAsArray } from '../LogicalOperator/components/CriteriaRightPanel/CriteriaForm/mappers'
import CriteriaCount, { CriteriaCountType } from '../CriteriaCount'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import clsx from 'clsx'

type CriteriaCardProps = {
  criterion: SelectedCriteriaType
  criteriaCount?: CriteriaCountType
  duplicateCriteria?: (criteriaId: number) => void
  deleteCriteria?: (criteriaId: number) => void
  editCriteria?: (criteria: SelectedCriteriaType) => void
}

const CriteriaCard = ({
  criterion,
  criteriaCount,
  duplicateCriteria,
  editCriteria,
  deleteCriteria
}: CriteriaCardProps) => {
  const { classes } = useStyles()

  const maintenanceIsActive = useAppSelector((state) => state.me?.maintenance?.active || false)
  const { entities, cache } = useAppSelector((state) => state.valueSets)
  const criteriaDefinitions = getAllCriteriaItems(criteriaList())

  const [needCollapse, setNeedCollapse] = useState(false)
  const [openCollapse, setOpenCollapse] = useState(false)

  const containerRef = useRef<HTMLDivElement>(null)
  const childrenRef = useRef<HTMLDivElement>(null)
  const isXl = useMediaQuery(theme.breakpoints.up('xl'))

  const { setNodeRef, isDragging, attributes, listeners, transform, transition } = useSortable({
    id: criterion.id,
    data: { criterion }
  })

  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
    backgroundColor: criterion.isInclusive ? '#D1E2F4' : '#F2B0B0'
  }

  useEffect(() => {
    const containerHeight = containerRef.current?.clientHeight || 0
    const childrenHeight = childrenRef.current?.clientHeight || 0
    if (childrenHeight > containerHeight) setNeedCollapse(true)
    else setNeedCollapse(false)
  }, [containerRef.current?.clientWidth])

  // if (isDragging) return <div style={{ height: 2, background: 'red' }}></div>
  if (isDragging)
    return (
      <Grid
        // marginBottom={5}
        ref={setNodeRef}
        style={style}
        container
        alignItems={'center'}
        className={classes.draggedCriteriaItem}
        //className={classes.criteriaItem}
      ></Grid>
    )

  return (
    <Grid ref={setNodeRef} style={style} container alignItems={'center'} className={classes.criteriaItem}>
      <CriteriaCount criteriaCount={criteriaCount} extraLeftMargin={3} />
      <Grid
        container
        alignItems="center"
        item
        xs={7}
        xl={3}
        padding={'5px'}
        justifyContent={isXl ? 'space-around' : 'flex-start'}
        style={{ cursor: 'grab', height: '100%' }}
        {...attributes}
        {...listeners}
      >
        <Grid container item xs={1} justifyContent={'center'}>
          <AvatarWrapper size={20}>{criterion.id}</AvatarWrapper>
        </Grid>
        <Grid container item xs={10}>
          <Typography className={classes.title} fontWeight={700}>
            {criterion.title} :
          </Typography>
        </Grid>
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
          {criteriasAsArray(criterion, criteriaDefinitions, { entities, cache }).map((label, index) => (
            <ChipWrapper
              key={index}
              label={label}
              colorString="#0063AF"
              backgroundColor="#FFF"
              style={{ margin: 5, maxWidth: 'calc(100% - 5px)' }}
            />
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
            onClick={() => editCriteria?.(criterion)}
            color="secondary"
            disabled={maintenanceIsActive}
          >
            <WarningIcon />
          </IconButton>
        )}
        <IconButton
          size="small"
          onClick={() => duplicateCriteria?.(criterion.id)}
          style={maintenanceIsActive ? { color: '#CBCFCF' } : { color: 'currentcolor' }}
          disabled={maintenanceIsActive}
        >
          <LibraryAddIcon />
        </IconButton>
        <IconButton
          size="small"
          onClick={() => editCriteria?.(criterion)}
          style={maintenanceIsActive ? { color: '#CBCFCF' } : { color: 'currentcolor' }}
          disabled={maintenanceIsActive}
        >
          <EditIcon />
        </IconButton>
        <IconButton
          size="small"
          onClick={() => deleteCriteria?.(criterion.id)}
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
