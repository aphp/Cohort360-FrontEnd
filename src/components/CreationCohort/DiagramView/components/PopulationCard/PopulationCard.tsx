import React, { useEffect, useRef, useState } from 'react'

import { Button, Chip, CircularProgress, Grid, IconButton, Typography } from '@mui/material'

import EditIcon from '@mui/icons-material/Edit'
import CloseIcon from '@mui/icons-material/Close'
import MoreHorizIcon from '@mui/icons-material/MoreHoriz'

import ModalRightError from './components/ModalRightError'
import PopulationRightPanel from './components/PopulationRightPanel'

import { useAppDispatch, useAppSelector } from 'state'
import { buildCohortCreation } from 'state/cohortCreation'
import { fetchScopesList } from 'state/scope'

import { CriteriaNameType, ScopeType, ScopeTreeRow } from 'types'
import scopeTypes from 'data/scope_type.json'

import useStyles from './styles'
import { findEquivalentRowInItemAndSubItems } from 'utils/pmsi'
import { getCurrentScopeList } from 'utils/scopeTree'

export type PopulationCardPropsType = {
  label?: string
  title?: string
  form?: CriteriaNameType
  executiveUnits?: ScopeTreeRow[]
  disabled?: boolean
  isAcceptEmptySelection?: boolean
  isDeleteIcon?: boolean
  onChangeExecutiveUnits?: (_selectedPopulations: ScopeTreeRow[]) => void
}

const PopulationCard: React.FC<PopulationCardPropsType> = (props) => {
  const {
    label,
    title,
    form,
    executiveUnits,
    onChangeExecutiveUnits,
    disabled = false,
    isAcceptEmptySelection,
    isDeleteIcon
  } = props
  const { classes } = useStyles(props)
  const dispatch = useAppDispatch()
  const isRendered = useRef<boolean>(false)

  const maintenanceIsActive = useAppSelector((state) => state.me?.maintenance?.active ?? false)
  const scopeState = useAppSelector((state) => state.scope || {})
  const { selectedPopulation = [], ...requestState } = useAppSelector((state) => state.cohortCreation.request || {})

  const isExecutiveUnit: boolean = !!(form ? (scopeTypes.criteriaType[form] as ScopeType) : undefined) ?? false
  const scopesList = getCurrentScopeList(scopeState.scopesList, isExecutiveUnit) ?? []
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
    dispatch(buildCohortCreation({ selectedPopulation: selectedPopulations }))
  }

  const setUpdatedItems = (updatedSelection: ScopeTreeRow[]) => {
    let _updatedSelection = updatedSelection
    _updatedSelection = _updatedSelection.filter((item) => item.id)
    setSelectedItems(_updatedSelection)
    onChangeExecutiveUnits ? onChangeExecutiveUnits(_updatedSelection) : _onChangePopulation(_updatedSelection)
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

  useEffect(() => {
    setSelectedItems(selection.filter((item): item is ScopeTreeRow => item !== undefined))
  }, [executiveUnits])

  useEffect(() => {
    if (
      !isRendered.current &&
      !executiveUnits &&
      !openDrawer &&
      scopesList?.length === 1 &&
      requestState?.requestId &&
      (selectedPopulation === null || selectedPopulation?.length === 0)
    ) {
      const savedSelectedItems: ScopeTreeRow[] = [
        findEquivalentRowInItemAndSubItems(scopesList[0], scopesList).equivalentRow
      ]
      _onSubmit(savedSelectedItems)
      isRendered.current = true
    } else {
      isRendered.current = false
    }
  }, [scopesList, requestState])

  return (
    <>
      {loading ? (
        <div className={disabled ? classes.disabledPopulationCard : classes.populationCard}>
          <div className={classes.centerContainer}>
            <CircularProgress />
          </div>
        </div>
      ) : selectionAndPopulationWithRightError?.length !== 0 || form ? (
        <Grid
          container
          alignItems="center"
          className={disabled ? classes.disabledPopulationCard : classes.populationCard}
        >
          <Grid item xs container alignItems="center" justifyContent="flex-start" gap="8px" className={classes.leftDiv}>
            <Grid item>
              {!disabled ? (
                <Typography className={classes.typography} variant={form ? undefined : 'h6'} align="left">
                  {label ?? 'Population source :'}
                </Typography>
              ) : (
                <Typography className={classes.typography} variant={form ? undefined : 'h6'} align="left">
                  {selectedItems.length ? 'Sélectionnées: ' : 'Aucune unité exécutrice sélectionnée'}
                </Typography>
              )}
            </Grid>
            <Grid item>
              {isExtended ? (
                <>
                  {selectionAndPopulationWithRightError &&
                    selectionAndPopulationWithRightError.map((pop, index: number) => (
                      <Chip
                        disabled={disabled}
                        className={classes.populationChip}
                        key={`${index}-${pop?.name}`}
                        label={pop?.name}
                        onDelete={isDeleteIcon && !disabled ? () => _onDelete(index) : undefined}
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
                            disabled={disabled}
                            className={classes.populationChip}
                            key={`${index}-${pop.name}`}
                            label={pop.name}
                            onDelete={isDeleteIcon && !disabled ? () => _onDelete(index) : undefined}
                          />
                        ) : (
                          <Chip
                            disabled={disabled}
                            className={classes.populationChip}
                            key={index}
                            label={'?'}
                            onDelete={isDeleteIcon && !disabled ? () => _onDelete(index) : undefined}
                          />
                        )
                      )}
                  {selectionAndPopulationWithRightError && selectionAndPopulationWithRightError.length > 4 && (
                    <IconButton size="small" onClick={() => onExtend(true)}>
                      <MoreHorizIcon />
                    </IconButton>
                  )}
                </>
              )}
            </Grid>
          </Grid>
          <Grid item alignSelf="center">
            <IconButton
              className={classes.editButton}
              size="small"
              onClick={() => onChangeOpenDrawer(true)}
              disabled={maintenanceIsActive || disabled}
            >
              <EditIcon />
            </IconButton>
          </Grid>
        </Grid>
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
