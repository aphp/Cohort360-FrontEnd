import React, { useState, useEffect, useRef } from 'react'

import { Button, IconButton, Chip, CircularProgress, Typography } from '@mui/material'

import EditIcon from '@mui/icons-material/Edit'
import CloseIcon from '@mui/icons-material/Close'
import MoreHorizIcon from '@mui/icons-material/MoreHoriz'

import ModalRightError from './components/ModalRightError'
import PopulationRightPanel from './components/PopulationRightPanel'

import { useAppSelector, useAppDispatch } from 'state'
import { CohortCreationState, buildCohortCreation } from 'state/cohortCreation'
import { ScopeState, fetchScopesList } from 'state/scope'
import { MeState } from 'state/me'

import { ScopeTreeRow } from 'types'
import { getSelectedScopes, filterScopeTree } from 'utils/scopeTree'

import useStyles from './styles'

const PopulationCard: React.FC = () => {
  const classes = useStyles()
  const dispatch = useAppDispatch()
  const isRendered = useRef<boolean>(false)

  const {
    request: { selectedPopulation = [], ...requestState },
    scopeState,
    meState
  } = useAppSelector<{
    request: CohortCreationState
    scopeState: ScopeState
    meState: MeState
  }>((state) => ({
    request: state.cohortCreation.request || {},
    scopeState: state.scope || {},
    meState: state.me
  }))

  const maintenanceIsActive = meState?.maintenance?.active

  const { scopesList = [] } = scopeState
  const loading = requestState.loading || scopeState.loading

  const [isExtended, onExtend] = useState(false)
  const [openDrawer, onChangeOpenDrawer] = useState(false)
  const [rightError, setRightError] = useState(false)

  const submitPopulation = async (_selectedPopulations: ScopeTreeRow[] | null) => {
    if (_selectedPopulations === null) return

    _selectedPopulations = filterScopeTree(_selectedPopulations)
    if (_selectedPopulations === null) return
    _selectedPopulations = _selectedPopulations.map((_selectedPopulation: ScopeTreeRow) => ({
      ..._selectedPopulation,
      subItems: []
    }))

    dispatch(buildCohortCreation({ selectedPopulation: _selectedPopulations }))
    onChangeOpenDrawer(false)
  }

  const fetchScopeTree = () => {
    if (scopesList && scopesList.length === 0) {
      dispatch(fetchScopesList())
    }
  }

  useEffect(() => {
    fetchScopeTree()
  }, [])

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

  useEffect(() => {
    if (
      !isRendered.current &&
      !openDrawer &&
      scopesList?.length === 1 &&
      requestState?.requestId &&
      (selectedPopulation === null || selectedPopulation?.length === 0)
    ) {
      const savedSelectedItems: ScopeTreeRow[] = getSelectedScopes(scopesList[0], [], scopesList)
      submitPopulation(savedSelectedItems)
      isRendered.current = true
    } else {
      isRendered.current = false
    }
  }, [scopesList, requestState])

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
                    selectedPopulation.map((pop, index: number) => (
                      <Chip className={classes.populationChip} key={`${index}-${pop?.name}`} label={pop?.name} />
                    ))}
                  <IconButton
                    size="small"
                    /*classes={{ label: classes.populationLabel }}*/ onClick={() => onExtend(false)}
                  >
                    <CloseIcon />
                  </IconButton>
                </>
              ) : (
                <>
                  {selectedPopulation &&
                    selectedPopulation
                      .slice(0, 4)
                      .map((pop, index: number) =>
                        pop ? (
                          <Chip className={classes.populationChip} key={`${index}-${pop.name}`} label={pop.name} />
                        ) : (
                          <Chip className={classes.populationChip} key={index} label={'?'} />
                        )
                      )}
                  {selectedPopulation && selectedPopulation.length > 4 && (
                    <IconButton
                      size="small"
                      /*classes={{ label: classes.populationLabel }}*/
                      onClick={() => onExtend(true)}
                    >
                      <MoreHorizIcon />
                    </IconButton>
                  )}
                </>
              )}
            </div>
          </div>
          <IconButton
            className={classes.editButton}
            size="small"
            onClick={() => onChangeOpenDrawer(true)}
            disabled={maintenanceIsActive}
          >
            <EditIcon />
          </IconButton>
        </div>
      ) : (
        <div className={classes.centerContainer}>
          <Button
            className={classes.actionButton}
            onClick={() => {
              onChangeOpenDrawer(true)
            }}
          >
            Choisir une population source
          </Button>
        </div>
      )}

      <ModalRightError
        open={rightError}
        handleClose={() => {
          onChangeOpenDrawer(true)
          setRightError(false)
        }}
      />

      <PopulationRightPanel open={openDrawer} onConfirm={submitPopulation} onClose={() => onChangeOpenDrawer(false)} />
    </>
  )
}

export default PopulationCard
