import React, { useState } from 'react'
import { useDispatch } from 'react-redux'

import { Button, IconButton, Chip, CircularProgress, Typography } from '@material-ui/core'

import EditIcon from '@material-ui/icons/Edit'
import CloseIcon from '@material-ui/icons/Close'
import MoreHorizIcon from '@material-ui/icons/MoreHoriz'

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

  const submitPopulation = (_selectedPopulation: ScopeTreeRow[] | null) => {
    dispatch<any>(buildCohortCreation({ selectedPopulation: _selectedPopulation }))
    onChangeOpenDrawer(false)
  }

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
                      .map((pop: any, index: number) => (
                        <Chip className={classes.populationChip} key={`${index}-${pop.name}`} label={pop.name} />
                      ))}
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

      <PopulationRightPanel open={openDrawer} onConfirm={submitPopulation} onClose={() => onChangeOpenDrawer(false)} />
    </>
  )
}

export default PopulationCard
