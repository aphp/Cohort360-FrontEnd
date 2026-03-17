import React, { useEffect, useMemo, useState } from 'react'
import { Button, Grid, Box, Stack, Typography } from '@mui/material'

import LogicalOperator from './components/LogicalOperator'
import JsonView from './components/JsonView'
import TemporalConstraintCard from './components/TemporalConstraintCard/TemporalConstraintCard'
import CohortCreationBreadcrumbs from './components/Breadcrumbs/Breadcrumbs'
import { useAppDispatch, useAppSelector } from 'state'
import { Rights, SourceType, ScopeElement } from 'types/scope'
import { buildCohortCreation, editDiagramViewMode } from 'state/cohortCreation'
import { Hierarchy } from 'types/hierarchy'
import Panel from '../../ui/Panel'
import PopulationCard from './components/PopulationCard/PopulationCard'
import ModalRightError from './components/PopulationCard/components/ModalRightError'
import { checkNominativeCriteria, cleanNominativeCriterias } from 'utils/cohortCreation'
import ScopeTree from 'components/ScopeTree'
import CustomAlert from 'components/ui/Alert'
import { HiddenScrollBar } from 'components/ui/Scrollbar/styles'
import { CriteriaType, ViewMode } from 'types/requestCriterias'
import { PinkSwitch } from './styles'

interface DiagramViewWithAjvProps {
  isValidJson: (canExecuteJson: boolean) => void
}

const DiagramView: React.FC<DiagramViewWithAjvProps> = ({ isValidJson }) => {
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

  const hasClaim = useMemo(
    () => requestState.selectedCriteria.some((criteria) => criteria.type === CriteriaType.CLAIM),
    [requestState.selectedCriteria]
  )

  return (
    <HiddenScrollBar
      container
      flexDirection="column"
      flexWrap="nowrap"
      width="calc(100% - 300px)"
      height="100vh"
      padding="24px 26px 76px 26px"
      overflow="auto"
      marginRight="300px"
      position="relative"
    >
      <div style={{ minWidth: 500, paddingRight: 24, display: 'flex', flexDirection: 'column', minHeight: '100%' }}>
        {maintenanceIsActive && (
          <CustomAlert severity="warning" style={{ marginTop: '-12px', marginBottom: '10px' }}>
            Une maintenance est en cours. Seules les consultations de cohortes, requêtes et données patients sont
            activées. Les créations, éditions et suppressions de cohortes et de requêtes sont désactivées.
          </CustomAlert>
        )}
        {hasClaim && (
          <CustomAlert severity="warning" style={{ marginTop: '-12px', marginBottom: '10px' }}>
            En raison de la suppression temporaire du critère de GHM, seules les consultations de cohortes, requêtes et
            données patients sont activées. Les créations, éditions et suppressions de cohortes et de requêtes sont
            désactivées.
          </CustomAlert>
        )}
        <CohortCreationBreadcrumbs />

        <Grid container justifyContent="center" alignItems="center">
          {selectedPopulation && selectedPopulation.length > 0 && (
            <PopulationCard
              onEditDisabled={maintenanceIsActive || hasClaim}
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
        {requestState.viewMode === 'logicalOperator' ? (
          selectedPopulation && selectedPopulation.length > 0 ? (
            <LogicalOperator />
          ) : (
            <></>
          )
        ) : (
          <JsonView onJsonIssuesChange={isValidJson} />
        )}

        {/* Switch between view modes */}
        <Box
          sx={{
            borderRadius: 1,
            px: 1,
            py: 0.5,
            mt: 'auto'
          }}
        >
          <Stack direction="row" alignItems="center" spacing={1}>
            <Typography variant="caption" fontWeight={'bold'}>
              Interface graphique
            </Typography>
            <PinkSwitch
              size="medium"
              checked={requestState.viewMode === 'json'}
              onChange={(e) => {
                dispatch(
                  editDiagramViewMode(e.target.checked ? ViewMode.JSON_INTERFACE : ViewMode.LOGICAL_OPERATOR_INTERFACE)
                )
              }}
            />
            <Typography variant="caption" fontWeight={'bold'}>
              Interface json
            </Typography>
          </Stack>
        </Box>
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
    </HiddenScrollBar>
  )
}

export default DiagramView
