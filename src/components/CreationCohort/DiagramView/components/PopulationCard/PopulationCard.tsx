import React, { useEffect, useRef, useState } from 'react'

import { Button, Chip, CircularProgress, IconButton, Typography } from '@mui/material'

import EditIcon from '@mui/icons-material/Edit'
import CloseIcon from '@mui/icons-material/Close'
import MoreHorizIcon from '@mui/icons-material/MoreHoriz'

import ModalRightError from './components/ModalRightError'
import PopulationRightPanel from './components/PopulationRightPanel'

import { useAppDispatch, useAppSelector } from 'state'
import { buildCohortCreation, CohortCreationState } from 'state/cohortCreation'
import { fetchScopesList, ScopeState } from 'state/scope'
import { MeState } from 'state/me'

import { CriteriaNameType, ScopeType, ScopeTreeRow } from 'types'
import scopeTypes from 'data/scope_type.json'

import useStyles from './styles'
import { findEquivalentRowInItemAndSubItems } from 'utils/pmsi'

export type populationCardPropsType = {
  label?: string
  title?: string
  form?: CriteriaNameType
  executiveUnits?: (ScopeTreeRow | undefined)[]
  isAcceptEmptySelection?: boolean
  isDeleteIcon?: boolean
  onChangeExecutiveUnits?: (_selectedPopulations: ScopeTreeRow[] | undefined) => void
}

const PopulationCard: React.FC<populationCardPropsType> = (props) => {
  const { label, title, form, executiveUnits, onChangeExecutiveUnits, isAcceptEmptySelection, isDeleteIcon } = props
  const { classes } = useStyles(props)
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

  const selection = executiveUnits ?? selectedPopulation ?? []
  const [selectedItems, setSelectedItems] = useState<ScopeTreeRow[]>(
    selection.filter((item): item is ScopeTreeRow => item !== undefined)
  )
  const populationWithRightError = selection.filter((item) => item === undefined)
  const selectionAndPopulationWithRightError = [...selectedItems, ...populationWithRightError]

  const _onChangePopulation = async (selectedPopulations: ScopeTreeRow[]) => {
    dispatch<any>(buildCohortCreation({ selectedPopulation: selectedPopulations }))
  }

  const setUpdatedItems = (updatedSelection: ScopeTreeRow[]) => {
    setSelectedItems(updatedSelection)
    onChangeExecutiveUnits ? onChangeExecutiveUnits(updatedSelection) : _onChangePopulation(updatedSelection)
  }

  const _onSubmit = async (updatedSelection: ScopeTreeRow[] | null) => {
    if (updatedSelection === null && !executiveUnits) return
    updatedSelection = (updatedSelection ?? []).map((selectedPopulations: ScopeTreeRow) => ({
      ...selectedPopulations,
      subItems: []
    }))
    setUpdatedItems(updatedSelection)
    onChangeOpenDrawer(false)
  }

  const _onDelete = (index: number) => {
    const updatedSelection: ScopeTreeRow[] = [...selectedItems]
    updatedSelection.splice(index, 1)
    setUpdatedItems(updatedSelection)
  }

  const fetchScopeTree = () => {
    if (scopesList && scopesList.length === 0) {
      dispatch(fetchScopesList({}))
    }
  }

  useEffect(() => {
    fetchScopeTree()
  }, [])

  useEffect(() => {
    let _rightError = false
    if (populationWithRightError && populationWithRightError.length > 0) {
      _rightError = true
    }
    setRightError(_rightError)
  }, [selectedItems])

  console.log('test scopesList avant useEffect', scopesList)

  useEffect(() => {
    if (
      !isRendered.current &&
      !executiveUnits &&
      !openDrawer &&
      scopesList?.length === 1 &&
      requestState?.requestId &&
      (selectedPopulation === null || selectedPopulation?.length === 0)
    ) {
      console.log('test scopesList avant', scopesList)
      const savedSelectedItems: ScopeTreeRow[] = [
        findEquivalentRowInItemAndSubItems(scopeState.scopesList[0], scopesList).equivalentRow
      ]
      console.log('test scopesList apres', scopesList)
      console.log('test savedSelectedItems', savedSelectedItems)
      _onSubmit(savedSelectedItems)
      isRendered.current = true
    } else {
      isRendered.current = false
    }
  }, [scopesList, requestState])

  console.log('test scopesList apres useEffect', scopesList)

  return (
    <>
      {loading ? (
        <div className={classes.populationCard}>
          <div className={classes.centerContainer}>
            <CircularProgress />
          </div>
        </div>
      ) : selectionAndPopulationWithRightError?.length !== 0 || form ? (
        <div className={classes.populationCard}>
          <div className={classes.leftDiv}>
            <Typography className={classes.typography} variant={form ? undefined : 'h6'} align="left">
              {label ?? 'Population source :'}
            </Typography>

            <div className={classes.chipContainer}>
              {isExtended ? (
                <>
                  {selectionAndPopulationWithRightError &&
                    selectionAndPopulationWithRightError.map((pop, index: number) => (
                      <Chip
                        className={classes.populationChip}
                        key={`${index}-${pop?.name}`}
                        label={pop?.name}
                        onDelete={isDeleteIcon ? () => _onDelete(index) : undefined}
                      />
                    ))}
                  <IconButton size="small" onClick={() => onExtend(false)}>
                    <CloseIcon />
                  </IconButton>
                </>
              ) : (
                <>
                  {selectionAndPopulationWithRightError &&
                    selectionAndPopulationWithRightError
                      .slice(0, 4)
                      .map((pop, index: number) =>
                        pop ? (
                          <Chip
                            className={classes.populationChip}
                            key={`${index}-${pop.name}`}
                            label={pop.name}
                            onDelete={isDeleteIcon ? () => _onDelete(index) : undefined}
                          />
                        ) : (
                          <Chip
                            className={classes.populationChip}
                            key={index}
                            label={'?'}
                            onDelete={isDeleteIcon ? () => _onDelete(index) : undefined}
                          />
                        )
                      )}
                  {selectionAndPopulationWithRightError && selectionAndPopulationWithRightError.length > 4 && (
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
          <Button className={classes.actionButton} onClick={() => onChangeOpenDrawer(true)}>
            {title ?? 'Choisir une population source'}
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

      <PopulationRightPanel
        open={openDrawer}
        title={title}
        isAcceptEmptySelection={isAcceptEmptySelection}
        selectedPopulation={selectedItems}
        executiveUnitType={form ? (scopeTypes.criteriaType[form] as ScopeType) : undefined}
        onConfirm={_onSubmit}
        onClose={() => onChangeOpenDrawer(false)}
      />
    </>
  )
}

export default PopulationCard
