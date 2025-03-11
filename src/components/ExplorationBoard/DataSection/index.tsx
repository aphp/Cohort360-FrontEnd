import React, { Fragment } from 'react'
import { CircularProgress, Grid, Typography } from '@mui/material'
import DataTable from 'components/ui/Table'
import { Table } from 'types/table'
import { OrderBy } from 'types/searchCriterias'
import DisplayDigits from 'components/ui/Display/DisplayDigits'
import { Pagination } from 'components/ui/Pagination'
import { Data, ExplorationCount } from '../useData'
import Chart from 'components/ui/Chart'
import PyramidChart from 'components/Dashboard/Preview/Charts/PyramidChart'
import { PatientsResponse } from 'types/patient'
import { ResourceType } from 'types/requestCriterias'
import BarChart from 'components/Dashboard/Preview/Charts/BarChart'
import { getGenderRepartitionSimpleData } from 'utils/graphUtils'
import PieChart from 'components/Dashboard/Preview/Charts/PieChart'
import Timeline from 'components/Patient/MaternityTimeline'
import { ExplorationResults } from 'types'
import { QuestionnaireResponse } from 'fhir/r4'
import InfoCard from 'components/ui/Cards/InfoCard'
import { DisplayOptions, DATA_DISPLAY, AdditionalInfo } from 'types/exploration'
import { Card } from 'types/card'

type DataSectionProps = {
  data: { raw: Data | null; table: Table; cards: Card[] }
  infos: AdditionalInfo
  isPatient: boolean
  count: ExplorationCount | null
  orderBy: OrderBy
  isLoading: boolean
  type: ResourceType
  pagination: { currentPage: number; total: number }
  displayOptions: DisplayOptions
  onChangePage: (page: number) => void
  onSort: (orderBy: OrderBy) => void
}

const DataSection = ({
  data,
  isPatient,
  infos,
  count,
  type,
  orderBy,
  isLoading,
  pagination,
  displayOptions,
  onChangePage,
  onSort
}: DataSectionProps) => {
  return (
    <Grid container justifyContent="center" item xs={12}>
      {isPatient &&
        type === ResourceType.QUESTIONNAIRE_RESPONSE &&
        (() => (
          <>
            {isLoading && <CircularProgress />}
            {!isLoading && (
              <Timeline
                questionnaireResponses={(data.raw as ExplorationResults<QuestionnaireResponse>)?.list ?? []}
                questionnaires={infos.questionnaires?.raw ?? []}
              />
            )}
          </>
        ))()}
      {!(type === ResourceType.QUESTIONNAIRE_RESPONSE && isPatient) && (
        <Grid container alignItems="center">
          {!isLoading && (
            <>
              {!!!count && (
                <Grid container justifyContent="center">
                  <Typography variant="button">Aucune donnée à afficher</Typography>
                </Grid>
              )}
              {count && (
                <>
                  {count.ressource && type !== ResourceType.PATIENT && (
                    <DisplayDigits
                      nb={count.ressource.results ?? 0}
                      total={count.ressource.total ?? 0}
                      label={'élément(s)'}
                    />
                  )}
                  {!isPatient && count.patients && type !== ResourceType.PATIENT && (
                    <Typography fontSize={15}>concernant</Typography>
                  )}
                  {!isPatient && count.patients && (
                    <DisplayDigits
                      nb={count.patients.results ?? 0}
                      total={count.patients.total ?? 0}
                      label={'patient(s)'}
                    />
                  )}
                </>
              )}
            </>
          )}
          {type === ResourceType.PATIENT &&
            displayOptions.diagrams &&
            (() => {
              const patients = (data.raw as PatientsResponse)?.originalPatients
              const map = getGenderRepartitionSimpleData((data.raw as PatientsResponse)?.genderRepartitionMap)
              if (patients && patients.length < 1) return <Fragment />
              return (
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6} lg={4}>
                    <Chart isLoading={isLoading} title="Répartition par genre">
                      <BarChart data={map.genderData} width={250} />
                    </Chart>
                  </Grid>
                  <Grid item xs={12} md={6} lg={4}>
                    <Chart isLoading={isLoading} title="Répartition par statut vital">
                      <PieChart data={map.vitalStatusData ?? []} width={250} />
                    </Chart>
                  </Grid>
                  <Grid item xs={12} md={12} lg={4}>
                    <Chart isLoading={isLoading} title="Pyramide des âges">
                      <PyramidChart data={(data.raw as PatientsResponse)?.agePyramidData} width={250} />
                    </Chart>
                  </Grid>
                </Grid>
              )
            })()}
          {isLoading && (
            <Grid container justifyContent="center">
              <CircularProgress />
            </Grid>
          )}
          {!isLoading && count && (
            <Grid container>
              {displayOptions.display === DATA_DISPLAY.INFO &&
                data.cards.map((card, index) => <InfoCard key={index} value={card} />)}
              {displayOptions.display === DATA_DISPLAY.TABLE && data.raw?.totalPatients && (
                <DataTable value={data.table} orderBy={orderBy} onSort={onSort} />
              )}
              <Grid
                container
                sx={{
                  position: 'sticky',
                  bottom: 0,
                  backgroundColor: '#fff',
                  maxWidth: '100%', // S'assure qu'elle ne dépasse pas le container
                  width: '100%', // Pour occuper toute la largeur du parent
                  zIndex: 10, // Pour s'assurer qu'elle reste au-dessus du reste du contenu
                  padding: '0px 0px 10px 0px', // Ajoute un peu d'espace
                  boxShadow: '0px -2px 5px rgba(0, 0, 0, 0.1)' // Ajoute une légère ombre pour la visibilité
                }}
              >
                <Pagination
                  color="#303030"
                  count={pagination.total}
                  currentPage={pagination.currentPage}
                  onPageChange={onChangePage}
                  centered={true}
                />
              </Grid>
            </Grid>
          )}
        </Grid>
      )}
    </Grid>
  )
}

export default DataSection
