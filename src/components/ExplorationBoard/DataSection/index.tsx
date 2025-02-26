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
import Timeline from 'components/Patient/PatientForms/MaternityForms/Timeline'
import { ExplorationResults } from 'types'
import { QuestionnaireResponse } from 'fhir/r4'
import { AdditionalInfo } from '../useExplorationBoard'

type DataSectionProps = {
  data: { raw: Data | null; table: Table }
  infos: AdditionalInfo
  isPatient: boolean
  count: ExplorationCount | null
  orderBy: OrderBy
  isLoading: boolean
  type: ResourceType
  pagination: { currentPage: number; total: number }
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
  onChangePage,
  onSort
}: DataSectionProps) => {
  return (
    <Grid container justifyContent="center" item xs={12}>
      {type === ResourceType.PATIENT &&
        (() => {
          const patients = (data.raw as PatientsResponse)?.originalPatients
          const map = getGenderRepartitionSimpleData((data.raw as PatientsResponse)?.genderRepartitionMap)
          if (patients && !patients.length) return <Fragment />
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
      {isLoading && <CircularProgress />}
      {!isLoading &&
        isPatient &&
        type === ResourceType.QUESTIONNAIRE_RESPONSE &&
        (() => (
          <Timeline
            questionnaireResponses={(data.raw as ExplorationResults<QuestionnaireResponse>)?.list ?? []}
            questionnaires={infos.questionnaires?.raw ?? []}
          />
        ))()}
      {!isLoading && data.table.rows && !(type === ResourceType.QUESTIONNAIRE_RESPONSE && isPatient) && (
        <>
          {data.table.rows.length < 1 && <Typography variant="button">Aucune donnée à afficher</Typography>}
          {data.table.rows.length > 0 && (
            <Grid container gap={2} alignItems="center">
              {count && (
                <DisplayDigits
                  nb={count.ressource.results ?? 0}
                  total={count.ressource.total ?? 0}
                  label={'élément(s)'}
                />
              )}
              {!isPatient && count && <Typography fontSize={15}>concernant</Typography>}
              {!isPatient && count && (
                <DisplayDigits
                  nb={count.patients.results ?? 0}
                  total={count.patients.total ?? 0}
                  label={'patient(s)'}
                />
              )}

              <DataTable value={data.table} orderBy={orderBy} onSort={onSort} />
              <Grid
                container
                justifyContent="center"
                style={{
                  position: 'fixed',
                  bottom: 0,
                  right: 0,
                  backgroundColor: '#fff',
                  width: '100%'
                }}
              >
                <Pagination
                  color="#303030"
                  count={pagination.total}
                  currentPage={pagination.currentPage}
                  onPageChange={onChangePage}
                />
              </Grid>
            </Grid>
          )}
        </>
      )}
    </Grid>
  )
}

export default DataSection
