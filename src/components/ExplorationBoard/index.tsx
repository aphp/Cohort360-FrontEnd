import React from 'react'
import { Alert, Grid, Snackbar } from '@mui/material'
import SearchSection from './SearchSection'
import CriteriasSection from './CriteriasSection'
import { useExplorationBoard } from './useExplorationBoard'
import { useData } from './useData'
import { ResourceType } from 'types/requestCriterias'
import DataSection from './DataSection'
import { useParams } from 'react-router-dom'
import { FetchStatus } from 'types'
import { AlertWrapper } from 'components/ui/Alert'
import { PatientState } from 'state/patient'
import { GAP, DEFAULT_OPTIONS, DisplayOptions } from 'types/exploration'

type ExplorationBoardProps = {
  type: ResourceType
  deidentified: boolean
  groupId: string[]
  patient?: PatientState
  messages?: string[]
  displayOptions?: DisplayOptions
}

const ExplorationBoard = ({
  type,
  deidentified,
  groupId,
  patient,
  messages,
  displayOptions = DEFAULT_OPTIONS
}: ExplorationBoardProps) => {
  const { search } = useParams<{ search: string }>()
  const {
    fetchStatus,
    additionalInfo,
    criterias,
    searchCriterias,
    savedFiltersActions,
    savedFiltersData,
    onSearch,
    onSort,
    onRemoveCriteria,
    onSaveFilter,
    resetFetchStatus
  } = useExplorationBoard(type, deidentified, !!patient, search)

  const { count, pagination, data, dataLoading, onChangePage } = useData(
    type,
    displayOptions.display,
    searchCriterias,
    deidentified,
    groupId,
    patient
  )
  // => const _page = page ? `&page=${page}` : ''
  return (
    <Grid item xs={12} container gap={GAP} sx={{ backgroundColor: '#fff' }}>
      <SearchSection
        searchCriterias={searchCriterias}
        infos={additionalInfo}
        onSearch={(searchCriterias) => onSearch(searchCriterias)}
        savedFiltersActions={savedFiltersActions}
        savedFiltersData={savedFiltersData}
        displayOptions={displayOptions}
      />
      {displayOptions.criterias && (
        <CriteriasSection
          onDelete={onRemoveCriteria}
          onSaveFilters={onSaveFilter}
          value={criterias}
          displayOptions={displayOptions}
        />
      )}
      {messages?.map((msg, index) => (
        <AlertWrapper key={index} severity="warning" sx={{ color: '#000' }}>
          {msg}
        </AlertWrapper>
      ))}
      <DataSection
        isLoading={dataLoading}
        infos={additionalInfo}
        data={data}
        count={count}
        isPatient={!!patient}
        orderBy={searchCriterias.orderBy}
        pagination={pagination}
        type={type}
        onChangePage={onChangePage}
        onSort={onSort}
        displayOptions={displayOptions}
      />
      {fetchStatus && (
        <Snackbar
          open={fetchStatus !== null}
          onClose={() => resetFetchStatus()}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          autoHideDuration={6000}
        >
          <Alert severity={fetchStatus?.status === FetchStatus.SUCCESS ? 'success' : 'error'}>
            {fetchStatus?.message}
          </Alert>
        </Snackbar>
      )}
    </Grid>
  )
}

export default ExplorationBoard
