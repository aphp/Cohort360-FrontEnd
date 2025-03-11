import { Alert, Divider, Grid, Snackbar } from '@mui/material'
import SearchSection from './SearchSection'
import CriteriasSection from './CriteriasSection'
import { useExplorationBoard } from './useExplorationBoard'
import { useData } from './useData'
import { ResourceType } from 'types/requestCriterias'
import { useEffect } from 'react'
import DataSection from './DataSection'
import { useSearchParams } from 'react-router-dom'
import { FetchStatus } from 'types'
import { AlertWrapper } from 'components/ui/Alert'

type ExplorationBoardProps = {
  deidentified?: boolean
  type: ResourceType
  messages?: string[]
}

const ExplorationBoard = ({ deidentified = true, type, messages }: ExplorationBoardProps) => {
  const [searchParams] = useSearchParams()
  const groupId = searchParams.get('groupId') || undefined
  const page = parseInt(searchParams.get('page') || '1', 10)
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
  } = useExplorationBoard(type, deidentified)

  const { count, pagination, tableData, dataLoading, onChangePage } = useData(
    type,
    searchCriterias,
    page,
    deidentified,
    groupId
  )

  useEffect(() => {
    //console.log('test searchCriterias', searchCriterias)
    console.log('test searchCriterias', searchCriterias)
  }, [tableData])

  // double fetch au chargement de la ressource ?? peut-être normal
  // IPP et NDA non trouvé en mode deidentified dans le tableau PMSI
  // dernier lieu prise en charge non trouvé en mode deidentified dans le tableau Patients
  // searchParams à verifier pour l'url
  // ne pas oublier d'afficher les msg d'avertissement
  // => const _groupId = groupId ? `?groupId=${groupId}` : ''
  // => const _search = search ? `&search=${search}` : ''
  // => pmsiTabs
  // supprimer multiple dans le type Column
  // Supprimer StartDate et EndDate quand tâche terminée
  // Label ExecutiveUnits n'est pas en gras
  // double fetch au chargement de la ressource ?? peut-être normal
  // IPP et NDA non trouvé en mode deidentified dans le tableau PMSI
  // dernier lieu prise en charge non trouvé en mode deidentified dans le tableau Patients
  // searchParams à verifier pour l'url
  // => const _groupId = groupId ? `?groupId=${groupId}` : ''
  // => const _search = search ? `&search=${search}` : ''
  // => pmsiTabs
  // peut etre un bug où les réferentiels des codes ne sont pas présents (observé sur Biology mais semble random)
  // Vérifier ce qu'on fait pour l'afichage des champs des filtres sauvegardés quand on passe de pseudo à nomi
  return (
    <Grid item xs={12} container gap="25px" padding="50px" sx={{ backgroundColor: '#fff' }}>
      <SearchSection
        deidentified={deidentified}
        searchCriterias={searchCriterias}
        infos={additionalInfo}
        onSearch={(searchCriterias) => onSearch(searchCriterias)}
        savedFiltersActions={savedFiltersActions}
        savedFiltersData={savedFiltersData}
      />
      <Divider sx={{ width: '100%' }} />
      <CriteriasSection onDelete={onRemoveCriteria} onSaveFilters={onSaveFilter} value={criterias} />
      {messages?.map((msg) => (
        <AlertWrapper severity="warning" sx={{ color: '#000' }}>
          {msg}
        </AlertWrapper>
      ))}
      <DataSection
        isLoading={dataLoading}
        data={tableData}
        count={count}
        orderBy={searchCriterias.orderBy}
        pagination={pagination}
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
