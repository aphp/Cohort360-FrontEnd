import React, { useState, useEffect } from 'react'
import { useDispatch } from 'react-redux'

import { Button, IconButton, Chip, CircularProgress, Typography } from '@material-ui/core'

import EditIcon from '@material-ui/icons/Edit'
import CloseIcon from '@material-ui/icons/Close'
import MoreHorizIcon from '@material-ui/icons/MoreHoriz'

import ModalRightError from './components/ModalRightError'
import PopulationRightPanel from './components/PopulationRightPanel'

import { useAppSelector } from 'state'
import { buildCohortCreation } from 'state/cohortCreation'

import { ScopeTreeRow } from 'types'

import useStyles from './styles'

const PopulationCard: React.FC = () => {
  const { selectedPopulation = [], loading = false } = useAppSelector((state) => state.cohortCreation.request || {})

  const classes = useStyles()
  const dispatch = useDispatch()

  const [isExtended, onExtend] = useState(false)
  const [openDrawer, onChangeOpenDrawer] = useState(false)
  const [rightError, setRightError] = useState(false)

  const submitPopulation = (_selectedPopulations: ScopeTreeRow[] | null) => {
    if (_selectedPopulations === null) return

    // If you chenge this code, change it too inside: Scope.jsx:25
    _selectedPopulations = _selectedPopulations.filter((item, index, array) => {
      // reemove double item
      const foundItem = array.find(({ id }) => item.id === id)
      const currentIndex = foundItem ? array.indexOf(foundItem) : -1
      if (index !== currentIndex) return false

      const parentItem = array.find(({ subItems }) => !!subItems?.find((subItem) => subItem.id === item.id))
      if (parentItem !== undefined) {
        const selectedChildren =
          parentItem.subItems && parentItem.subItems.length > 0
            ? parentItem.subItems.filter((subItem) => !!array.find(({ id }) => id === subItem.id))
            : []
        if (selectedChildren.length === parentItem.subItems.length) {
          // Si item + TOUS LES AUTRES child sont select. => Delete it
          return false
        } else {
          // Sinon => Keep it
          return true
        }
      } else {
        if (
          !item.subItems ||
          (item.subItems && item.subItems.length === 0) ||
          (item.subItems && item.subItems.length > 0 && item.subItems[0].id === 'loading')
        ) {
          return true
        }

        const selectedChildren =
          item.subItems && item.subItems.length > 0
            ? item.subItems.filter((subItem) => !!array.find(({ id }) => id === subItem.id))
            : []

        if (selectedChildren.length === item.subItems.length) {
          // Si tous les enfants sont check => Keep it
          return true
        } else {
          // Sinon => Delete it
          return false
        }
      }
    })

    _selectedPopulations = _selectedPopulations.map((_selectedPopulation: ScopeTreeRow) => ({
      ..._selectedPopulation,
      subItems: []
    }))

    dispatch<any>(buildCohortCreation({ selectedPopulation: _selectedPopulations }))
    onChangeOpenDrawer(false)
  }

  useEffect(() => {
    let _rightError = false

    const populationWithRightError = selectedPopulation
      ? selectedPopulation.filter((selectedPopulation) => selectedPopulation === undefined)
      : []
    if (populationWithRightError && populationWithRightError.length > 0) {
      _rightError = true
    }

    setRightError(_rightError)
  }, [selectedPopulation])

  return (
    <>
      {loading ? (
        <div className={classes.populationCard}>
          <div className={classes.centerContainer}>
            <CircularProgress />
          </div>
        </div>
      ) : selectedPopulation !== null ? (
        <div className={classes.populationCard}>
          <div className={classes.leftDiv}>
            <Typography variant="h6" align="left" style={{ whiteSpace: 'nowrap' }}>
              Population source :
            </Typography>

            <div className={classes.chipContainer}>
              {isExtended ? (
                <>
                  {selectedPopulation &&
                    selectedPopulation.map((pop: any, index: number) => (
                      <Chip className={classes.populationChip} key={`${index}-${pop.name}`} label={pop.name} />
                    ))}
                  <IconButton size="small" classes={{ label: classes.populationLabel }} onClick={() => onExtend(false)}>
                    <CloseIcon />
                  </IconButton>
                </>
              ) : (
                <>
                  {selectedPopulation &&
                    selectedPopulation
                      .slice(0, 4)
                      .map((pop: any, index: number) =>
                        pop ? (
                          <Chip className={classes.populationChip} key={`${index}-${pop.name}`} label={pop.name} />
                        ) : (
                          <Chip className={classes.populationChip} key={index} label={'?'} />
                        )
                      )}
                  {selectedPopulation && selectedPopulation.length > 4 && (
                    <IconButton
                      size="small"
                      classes={{ label: classes.populationLabel }}
                      onClick={() => onExtend(true)}
                    >
                      <MoreHorizIcon />
                    </IconButton>
                  )}
                </>
              )}
            </div>
          </div>
          <IconButton className={classes.editButton} size="small" onClick={() => onChangeOpenDrawer(true)}>
            <EditIcon />
          </IconButton>
        </div>
      ) : (
        <div className={classes.centerContainer}>
          <Button className={classes.actionButton} onClick={() => onChangeOpenDrawer(true)}>
            Choisir une population source
          </Button>
        </div>
      )}

      <ModalRightError open={rightError} handleClose={() => onChangeOpenDrawer(true)} />

      <PopulationRightPanel open={openDrawer} onConfirm={submitPopulation} onClose={() => onChangeOpenDrawer(false)} />
    </>
  )
}

export default PopulationCard
