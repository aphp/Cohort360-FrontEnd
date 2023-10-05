import React, { Fragment, useEffect, useRef, useState } from 'react'

import { IconButton, Typography, Avatar, Grid } from '@mui/material'

import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import WarningIcon from '@mui/icons-material/Warning'
import LibraryAddIcon from '@mui/icons-material/LibraryAdd'

import CriteriaCardContent from './components/CriteriaCardContent/CriteriaCardContent'

import { useAppSelector } from 'state'
import { MeState } from 'state/me'

import useStyles from './styles'
import { SelectedCriteriaType } from 'types'
import { checkIfCardNeedsCollapse } from 'utils/screen'
import Criterias from './components/Criterias'

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

  /*const [needCollapse, setNeedCollapse] = useState(false)
  const [openCollapse, setOpenCollapse] = useState(false)*/

  /*const containerRef = useRef(null)
  const elementsRef = useRef(currentCriterion?.map(() => React.createRef()))*/

  if (!currentCriterion) return <></> // Bug, not possible ... The current item is not a criteria

  /*useEffect(() => {
    const handleResize = () => {
      setNeedCollapse(checkIfCardNeedsCollapse(containerRef, elementsRef))
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [elementsRef])*/

  return (
    <Grid
      container
      justifyContent={'space-between'}
      alignItems={'center'}
      className={classes.criteriaItem}
      style={{ backgroundColor: currentCriterion.isInclusive ? '#D1E2F4' : '#F2B0B0' }}
    >
      <Grid container alignItems="center" item xs={12} lg={3}>
        <Avatar style={{ backgroundColor: '#5bc5f2', width: 24, height: 24, fontSize: 14 }}>
          {currentCriterion.id}
        </Avatar>
        <Typography className={classes.title}>- {currentCriterion.title} :</Typography>
      </Grid>
      <Grid
        container
        spacing={1}
        xs={12}
        lg={7} /*ref={containerRef}*/ /*style={{ height: openCollapse ? '' : 40 }} className={classes.cardContent}*/
      >
        <Criterias value={currentCriterion} />
        {/*needCollapse && (
                <IconButton onClick={() => setOpenCollapse(!openCollapse)} className={classes.chevronIcon} size="small">
                  {openCollapse ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                </IconButton>
              )*/}
        {/*<CriteriaCardContent currentCriteria={currentCriterion} />*/}
      </Grid>
      <Grid item xs={12} lg={2} container justifyContent="flex-end">
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
