import React, { useEffect, useState } from 'react'

import { Button, Chip, CircularProgress, IconButton, Tooltip, Typography } from '@mui/material'

import EditIcon from '@mui/icons-material/Edit'
import CloseIcon from '@mui/icons-material/Close'
import MoreHorizIcon from '@mui/icons-material/MoreHoriz'

import ModalRightError from './components/ModalRightError'
import PopulationRightPanel from './components/PopulationRightPanel'

import { useAppDispatch, useAppSelector } from 'state'
import { buildCohortCreation, CohortCreationState } from 'state/cohortCreation'
import { fetchScopesList, ScopeState } from 'state/scope'
import { MeState } from 'state/me'

import { ScopeTreeRow } from 'types'
import { filterScopeTree, getSelectedScopes } from 'utils/scopeTree'
import servicesPerimeters from 'services/aphp/servicePerimeters'

import useStyles from './styles'
import InfoIcon from '@mui/icons-material/Info'
import scopeType from 'data/scope_type.json'

export type populationCardPropsType = {
  label?: string
  title?: string
  form?: 'cim10' | 'ccam' | 'ghm' | 'document' | 'medication' | 'biology' | 'supported'
  executiveUnits?: (ScopeTreeRow | undefined)[]
  isAcceptEmptySelection?: boolean
  isDeleteIcon?: boolean
  onChangeExecutiveUnits?: (_selectedPopulations: ScopeTreeRow[] | undefined) => void
}

const PopulationCard: React.FC<populationCardPropsType> = (props) => {
  const { label, title, form, executiveUnits, onChangeExecutiveUnits, isAcceptEmptySelection, isDeleteIcon } = props
  const classes = useStyles(props)
  const dispatch = useAppDispatch()

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
  const [selectedItems, setSelectedItems] = useState<ScopeTreeRow[]>(
    (executiveUnits ?? selectedPopulation ?? []).filter((item): item is ScopeTreeRow => item !== undefined)
  )

  const _onChangePopulation = async (selectedPopulations: ScopeTreeRow[]) => {
    const allowSearchIpp = await servicesPerimeters.allowSearchIpp(selectedPopulations)
    dispatch<any>(buildCohortCreation({ selectedPopulation: selectedPopulations, allowSearchIpp: allowSearchIpp }))
  }

  const setUpdatedItems = (updatedSelection: ScopeTreeRow[]) => {
    setSelectedItems(updatedSelection)
    onChangeExecutiveUnits ? onChangeExecutiveUnits(updatedSelection) : _onChangePopulation(updatedSelection)
  }

  const _onSubmit = async (updatedSelection: ScopeTreeRow[] | null) => {
    if (updatedSelection === null && !executiveUnits) return
    updatedSelection = filterScopeTree(updatedSelection ?? [])
    updatedSelection = updatedSelection.map((selectedPopulations: ScopeTreeRow) => ({
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
      dispatch<any>(fetchScopesList({}))
    }
  }

  useEffect(() => {
    fetchScopeTree()
  }, [])

  // useEffect(() => {
  //   // setSelectedHospitals(executiveUnits?.filter((item): item is ScopeTreeRow => item !== undefined) ?? [])
  //   console.log('executiveUnits = ' + executiveUnits)
  // }, [executiveUnits])

  useEffect(() => {
    let _rightError = false

    const populationWithRightError = selectedItems
      ? selectedItems.filter((selectedPopulation) => selectedPopulation === undefined)
      : []
    if (populationWithRightError && populationWithRightError.length > 0) {
      _rightError = true
    }

    setRightError(_rightError)
  }, [selectedItems])

  useEffect(() => {
    if (
      !executiveUnits &&
      !openDrawer &&
      scopesList &&
      scopesList.length === 1 &&
      requestState.requestId &&
      (selectedItems === null || (selectedItems && selectedItems.length === 0))
    ) {
      const savedSelectedItems: ScopeTreeRow[] = getSelectedScopes(scopesList[0], [], scopesList)
      _onSubmit(savedSelectedItems)
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
      ) : selectedItems !== null ? (
        <div className={classes.populationCard}>
          <div className={classes.leftDiv}>
            <Typography className={classes.typography} variant={form ? undefined : 'h6'} align="left">
              {label ?? 'Population source'}
              {form && (
                <>
                  <Tooltip
                    title={
                      <>
                        {'- Le niveau hiérarchique de associé est : ' + scopeType?.criteriaType[form] + '.'}
                        <br />
                        {
                          '- En utilisant ce filtre, seuls les patients qui ont visité au moins un des services sélectionnés sont conservés.'
                        }
                      </>
                    }
                  >
                    <InfoIcon fontSize="small" color="primary" style={{ marginLeft: 4 }} />
                  </Tooltip>
                </>
              )}
            </Typography>

            <div className={classes.chipContainer}>
              {isExtended ? (
                <>
                  {selectedItems &&
                    selectedItems.map((pop: any, index: number) => (
                      <Chip
                        className={classes.populationChip}
                        key={`${index}-${pop.name}`}
                        label={pop.name}
                        onDelete={isDeleteIcon ? () => _onDelete(index) : undefined}
                      />
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
                  {selectedItems &&
                    selectedItems
                      .slice(0, 4)
                      .map((pop: any, index: number) =>
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
                  {selectedItems && selectedItems.length > 4 && (
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

      <ModalRightError open={rightError} handleClose={() => onChangeOpenDrawer(true)} />

      <PopulationRightPanel
        open={openDrawer}
        title={title}
        isAcceptEmptySelection={isAcceptEmptySelection}
        selectedPopulation={selectedItems}
        executiveUnitType={form ?? undefined}
        onConfirm={_onSubmit}
        onClose={() => onChangeOpenDrawer(false)}
      />
    </>
  )
}

export default PopulationCard
