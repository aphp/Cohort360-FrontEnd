import React from 'react'
import { Alert, Divider, Grid, Snackbar } from '@mui/material'
import SearchSection from './SearchSection'
import CriteriasSection from './CriteriasSection'
import { useExplorationBoard } from './useExplorationBoard'
import { useData } from './useData'
import { ResourceType } from 'types/requestCriterias'
import { useEffect } from 'react'
import DataSection from './DataSection'
import { useParams, useSearchParams } from 'react-router-dom'
import { FetchStatus } from 'types'
import { AlertWrapper } from 'components/ui/Alert'
import { PatientState } from 'state/patient'

export type DisplayOptions = {
  myFilters: boolean
  filterBy: boolean
  orderBy: boolean
  saveFilters: boolean
  criterias: boolean
  search: boolean
  diagrams: boolean
  count: boolean
}

type ExplorationBoardProps = {
  type: ResourceType
  deidentified: boolean
  groupId: string[]
  patient?: PatientState
  messages?: string[]
  displayOptions?: DisplayOptions
}

const defaultOptions: DisplayOptions = {
  myFilters: true,
  filterBy: true,
  orderBy: false,
  saveFilters: true,
  criterias: true,
  search: true,
  diagrams: true,
  count: true
}

const ExplorationBoard = ({
  type,
  deidentified,
  groupId,
  patient,
  messages,
  displayOptions = defaultOptions
}: ExplorationBoardProps) => {
  const [searchParams] = useSearchParams()
  const page = parseInt(searchParams.get('page') || '1', 10)
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
  } = useExplorationBoard(type, deidentified, search)

  const { count, pagination, data, dataLoading, onChangePage } = useData(
    type,
    searchCriterias,
    page,
    deidentified,
    groupId,
    patient
  )

  useEffect(() => {
    //console.log('test searchCriterias', searchCriterias)
    console.log('testt board', search)
  }, [searchCriterias.filters])

  // supprimer multiple dans le type Column
  // Supprimer StartDate et EndDate quand tâche terminée
  // Label ExecutiveUnits n'est pas en gras
  // searchParams à verifier pour l'url
  // => const _groupId = groupId ? `?groupId=${groupId}` : ''
  // => const _search = search ? `&search=${search}` : ''
  // => erreur sur les pmsiTabs / medicationTabs
  // Vérifier qu'on atterie sur le bon onglet ressource et filtres quand URL
  // Vérifier ce qu'on fait pour l'afichage des champs des filtres sauvegardés quand on passe de pseudo à nomi
  // L'option Documents dont les pdf sont disponibles n'est dispo que en non pseudo
  // Les champs ipp ne doivent plus apparaitre dans l'exploration d'un patient
  // TOUS LES TYPES des réponses du service et de useData sont mauvais!!
  // Le retour en arrière d'un patient sur la liste des patients ne se fait pas correctement
  // Une recherche se lance (ùmode pseudo) lorsque le selectBy est modifié alors que ce comportement n'est pas souhaité
  return (
    <Grid item xs={12} container gap="25px" sx={{ backgroundColor: '#fff' }}>
      <SearchSection
        searchCriterias={searchCriterias}
        infos={additionalInfo}
        onSearch={(searchCriterias) => onSearch(searchCriterias)}
        savedFiltersActions={savedFiltersActions}
        savedFiltersData={savedFiltersData}
        displayOptions={displayOptions}
      />
      <Divider sx={{ width: '100%' }} />
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
