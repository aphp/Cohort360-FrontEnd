import React, { useEffect, useState } from 'react'
import { Button, Grid } from '@mui/material'

import LogicalOperator from './components/LogicalOperator'
import TemporalConstraintCard from './components/TemporalConstraintCard/TemporalConstraintCard'
import CohortCreationBreadcrumbs from './components/Breadcrumbs/Breadcrumbs'
import { useAppDispatch, useAppSelector } from 'state'
import { Rights, SourceType, ScopeElement} from 'types/scope'
import { buildCohortCreation } from 'state/cohortCreation'
import { Hierarchy } from 'types/hierarchy'
import Panel from '../../ui/Panel'
import PopulationCard from './components/PopulationCard/PopulationCard'
import ModalRightError from './components/PopulationCard/components/ModalRightError'
import { checkNominativeCriteria, cleanNominativeCriterias } from 'utils/cohortCreation'
import ScopeTree from 'components/ScopeTree'
import CustomAlert from 'components/ui/Alert'

const DiagramView = () => {
  const dispatch = useAppDispatch()
  const { selectedPopulation = [], ...requestState } = useAppSelector((state) => state.cohortCreation.request || {})
  const { rights } = useAppSelector((state) => state.scope || {})
  const maintenanceIsActive = useAppSelector((state) => state.me?.maintenance?.active || false)
  const [openDrawer, setOpenDrawer] = useState(false)
  const [rightsError, setRightsError] = useState(false)
  const [selectedCodes, setSelectedCodes] = useState<Hierarchy<ScopeElement>[]>([])

  const handleChangePopulation = (selectedPopulation: Hierarchy<ScopeElement>[]) => {
    if (
      selectedPopulation?.some((perimeter) => perimeter?.access === 'Pseudonymisé') &&
      checkNominativeCriteria(requestState.selectedCriteria)
    ) {
      cleanNominativeCriterias(requestState.selectedCriteria, requestState.criteriaGroup, dispatch, selectedPopulation)
    } else {
      dispatch(buildCohortCreation({ selectedPopulation }))
    }
    setOpenDrawer(false)
  }

  useEffect(() => {
    setRightsError(false)
    if (selectedPopulation?.length) {
      const isError = selectedPopulation.filter((elem) => elem.id === Rights.EXPIRED).length > 0
      setRightsError(isError)
      setSelectedCodes(selectedPopulation.filter((selected) => selected?.id !== Rights.EXPIRED))
    }
  }, [selectedPopulation])

  useEffect(() => {
    if (!selectedPopulation?.length && rights.length === 1)
      dispatch(buildCohortCreation({ selectedPopulation: rights }))
  }, [selectedPopulation, rights])

  return (
    <Grid
      container
      flexDirection="column"
      flexWrap="nowrap"
      width="calc(100% - 300px)"
      height="100vh"
      padding="24px 26px 76px 26px"
      overflow="auto"
      marginRight="300px"
    >
      <div style={{ minWidth: 500, paddingRight: 24 }}>
        {maintenanceIsActive && (
          <CustomAlert severity="warning" style={{ marginTop: '-12px', marginBottom: '10px' }}>
            Une maintenance est en cours. Seules les consultations de cohortes, requêtes et données patients sont
            activées. Les créations, éditions et suppressions de cohortes et de requêtes sont désactivées.
          </CustomAlert>
        )}
        <CohortCreationBreadcrumbs />

        <Grid container justifyContent="center" alignItems="center">
          {selectedPopulation && selectedPopulation.length > 0 && (
            <PopulationCard
              onEditDisabled={maintenanceIsActive}
              onEdit={() => setOpenDrawer(true)}
              loading={requestState.loading}
              population={selectedPopulation}
            />
          )}
          {!selectedPopulation?.length && rights.length > 1 && (
            <Button
              variant="contained"
              sx={{ borderRadius: 25, background: '#19235A' }}
              onClick={() => setOpenDrawer(true)}
            >
              Choisir une population source
            </Button>
          )}
          {selectedPopulation && selectedPopulation.length > 0 ? <TemporalConstraintCard /> : <></>}
        </Grid>
        {selectedPopulation && selectedPopulation.length > 0 ? <LogicalOperator /> : <></>}
      </div>
      <Panel
        title="Structure hospitalière"
        open={openDrawer}
        mandatory={!selectedCodes.length}
        onConfirm={() => handleChangePopulation(selectedCodes)}
        onClose={() => setOpenDrawer(false)}
      >
        <ScopeTree
          baseTree={rights}
          selectedNodes={selectedCodes}
          onSelect={setSelectedCodes}
          sourceType={SourceType.ALL}
        />
      </Panel>
      <ModalRightError open={rightsError} handleClose={() => setOpenDrawer(true)} />
    </Grid>
  )
}

export default DiagramView
