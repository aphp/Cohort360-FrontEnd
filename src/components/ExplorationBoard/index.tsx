import React, { useEffect } from 'react'
import { Alert, Grid, Snackbar } from '@mui/material'
import SearchSection from './SearchSection'
import CriteriasSection from './CriteriasSection'
import { useExplorationBoard } from './useExplorationBoard'
import { useData } from './useData'
import DataSection from './DataSection'
import { FetchStatus } from 'types'
import { AlertWrapper } from 'components/ui/Alert'
import { GAP, ExplorationConfig } from 'types/exploration'
import { Filters } from 'types/searchCriterias'

type ExplorationBoardProps<T> = {
  config: ExplorationConfig<T>
}

const ExplorationBoard = <T,>({ config }: ExplorationBoardProps<T>) => {
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
  } = useExplorationBoard(config)

  const { count, pagination, data, dataLoading, onChangePage } = useData(config, searchCriterias)

  return (
    <Grid item xs={12} container gap={GAP} sx={{ backgroundColor: '#fff' }}>
      <SearchSection
        searchCriterias={searchCriterias}
        infos={additionalInfo}
        onSearch={(searchCriterias) => onSearch(searchCriterias)}
        savedFiltersActions={savedFiltersActions}
        savedFiltersData={savedFiltersData}
        displayOptions={config.displayOptions}
      />
      {config.displayOptions.criterias && (
        <CriteriasSection
          onDelete={onRemoveCriteria}
          onSaveFilters={onSaveFilter}
          value={criterias}
          displayOptions={config.displayOptions}
        />
      )}
      {config.getMessages &&
        config.getMessages().map((msg, index) => (
          <AlertWrapper key={index} severity="warning" sx={{ color: '#000' }}>
            {msg}
          </AlertWrapper>
        ))}
      <DataSection
        isLoading={dataLoading}
        data={data}
        count={count}
        orderBy={searchCriterias.orderBy}
        pagination={pagination}
        displayOptions={config.displayOptions}
        onChangePage={onChangePage}
        onSort={onSort}
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
