import React from 'react'
import { Alert, Grid, Snackbar } from '@mui/material'
import SearchSection from './SearchSection'
import CriteriasSection from './CriteriasSection'
import { useExplorationBoard } from './useExplorationBoard'
import { useData } from './useData'
import DataSection from './DataSection'
import { FetchStatus } from 'types'
import CustomAlert from 'components/ui/Alert'
import { GAP, ExplorationConfig } from 'types/exploration'
import { useSearchParams } from 'react-router-dom'

type ExplorationBoardProps<T> = {
  config: ExplorationConfig<T>
}

const ExplorationBoard = <T,>({ config }: ExplorationBoardProps<T>) => {
  const [searchParams] = useSearchParams()
  const pageFromUrl = parseInt(searchParams.get('page') ?? '1', 10)
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
  const { count, pagination, data, dataLoading, onChangePage } = useData(config, searchCriterias, pageFromUrl)

  return (
    <Grid item xs={12} container gap={GAP} margin={'16px 0'}>
      {config.getMessages?.().map((msg, index) => (
        <CustomAlert key={index}>{msg}</CustomAlert>
      ))}
      <SearchSection
        searchCriterias={searchCriterias}
        infos={additionalInfo}
        onSearch={(searchCriterias) => onSearch(searchCriterias)}
        savedFiltersActions={savedFiltersActions}
        savedFiltersData={savedFiltersData}
        displayOptions={config.displayOptions}
        count={count}
        isLoading={dataLoading}
      />
      {config.displayOptions.criterias && (
        <CriteriasSection
          onDelete={onRemoveCriteria}
          onSaveFilters={onSaveFilter}
          value={criterias}
          displayOptions={config.displayOptions}
        />
      )}
      <DataSection
        isLoading={dataLoading}
        data={data}
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
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
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
