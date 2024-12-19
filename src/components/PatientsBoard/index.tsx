import { Grid } from '@mui/material'
import SearchSection from './SearchSection'
import SavedFiltersSection from './SavedFiltersSection'
import CriteriasSection from './CriteriasSection'
import { usePatientBoard } from './usePatientsBoard'
import { useData } from './useData'
import { ResourceType } from 'types/requestCriterias'

type PatientsBoardProps = {
  deidentified: boolean | null
}

const PatientsBoard = ({ deidentified }: PatientsBoardProps) => {
  const { criterias, searchCriterias, onSaveSearchCriterias, removeFilter } = usePatientBoard()
  const { data, loadingStatus } = useData(ResourceType.PATIENT, searchCriterias, 0)

  return (
    <Grid container gap="25px">
      <Grid container gap="25px">
        <SearchSection
          deidentified={deidentified ?? false}
          criterias={searchCriterias}
          onSearch={(searchCriterias) => onSaveSearchCriterias(searchCriterias)}
        />
        <SavedFiltersSection
          canSave={criterias.length > 0 || searchCriterias.searchInput.length > 0}
          deidentified={deidentified ?? false}
          criterias={searchCriterias}
          onSelect={onSaveSearchCriterias}
        />
        <CriteriasSection onDelete={removeFilter} value={criterias} />
      </Grid>
    </Grid>
  )
}

export default PatientsBoard
