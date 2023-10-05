import React, { Fragment, useEffect, useRef, useState } from 'react'

import { IconButton, Typography } from '@mui/material'

import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import WarningIcon from '@mui/icons-material/Warning'
import LibraryAddIcon from '@mui/icons-material/LibraryAdd'

import CriteriaCardContent from './components/CriteriaCardContent/CriteriaCardContent'
import Avatar from 'components/ui/Avatar/Avatar'

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
    <div
      className={classes.criteriaItem}
      style={{ backgroundColor: currentCriterion.isInclusive ? '#D1E2F4' : '#F2B0B0' }}
    >
      <div className={classes.criteriaTitleAndChips}>
        <Avatar content={currentCriterion.id} />
        <Typography className={classes.title}>- {currentCriterion.title} :</Typography>
        <div /*ref={containerRef}*/ /*style={{ height: openCollapse ? '' : 40 }} className={classes.cardContent}*/>
          <div /*ref={elementsRef.current[index]}*/>
            <Criterias value={currentCriterion} />
          </div>
          {/*needCollapse && (
                <IconButton onClick={() => setOpenCollapse(!openCollapse)} className={classes.chevronIcon} size="small">
                  {openCollapse ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                </IconButton>
              )*/}
        </div>
        {/*<CriteriaCardContent currentCriteria={currentCriterion} />*/}
      </div>
      <div className={classes.actionContainer}>
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
      </div>
    </div>
  )
}

export default CriteriaCard
