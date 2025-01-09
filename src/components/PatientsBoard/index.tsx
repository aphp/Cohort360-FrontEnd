import { Grid } from '@mui/material'
import SearchSection from './SearchSection'
import SavedFiltersSection from './SavedFiltersSection'
import CriteriasSection from './CriteriasSection'
import { usePatientBoard } from './usePatientsBoard'
import { useData } from './useData'
import { ResourceType } from 'types/requestCriterias'
import { useEffect } from 'react'
import DataSection from './DataSection'
import { useDataToTable } from './useDataToTable'
import { useSearchParams } from 'react-router-dom'

type PatientsBoardProps = {
  deidentified?: boolean
}

const PatientsBoard = ({ deidentified = true }: PatientsBoardProps) => {
  const [searchParams] = useSearchParams()
  const groupId = searchParams.get('groupId') ?? undefined
  const page = +searchParams.get('page') ?? 0
  const { criterias, searchCriterias, onSaveSearchCriterias, removeFilter } = usePatientBoard()
  const { data, loadingStatus } = useData(ResourceType.PATIENT, searchCriterias, page, groupId)
  const { tableData } = useDataToTable(data, deidentified)

  useEffect(() => {
    console.log('test deidentified', deidentified)
    console.log('test data', data, tableData)
  }, [data])

  return (
    <Grid container gap="25px">
      <Grid container gap="25px">
        <SearchSection
          deidentified={deidentified}
          criterias={searchCriterias}
          onSearch={(searchCriterias) => onSaveSearchCriterias(searchCriterias)}
        />
        <SavedFiltersSection
          canSave={criterias.length > 0 || searchCriterias.searchInput.length > 0}
          deidentified={deidentified}
          criterias={searchCriterias}
          onSelect={onSaveSearchCriterias}
        />
        <CriteriasSection onDelete={removeFilter} value={criterias} />
        <DataSection deidentified={deidentified} loadingStatus={loadingStatus} data={tableData} />
      </Grid>
    </Grid>
  )
}

export default PatientsBoard
