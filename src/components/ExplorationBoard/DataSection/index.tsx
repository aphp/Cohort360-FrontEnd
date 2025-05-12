import React, { Fragment } from 'react'
import { CircularProgress, Grid, Typography } from '@mui/material'
import DataTable from 'components/ui/Table'
import { Table } from 'types/table'
import { OrderBy } from 'types/searchCriterias'
import DisplayDigits from 'components/ui/Display/DisplayDigits'
import { Pagination } from 'components/ui/Pagination'
import Chart from 'components/ui/Chart'
import PyramidChart from 'components/Dashboard/Preview/Charts/PyramidChart'
import BarChart from 'components/Dashboard/Preview/Charts/BarChart'
import PieChart from 'components/Dashboard/Preview/Charts/PieChart'
import Timeline from 'components/Patient/MaternityTimeline'
import { AgeRepartitionType, SimpleChartDataType } from 'types'
import InfoCard from 'components/ui/Cards/InfoCard'
import { Timeline as TimelineT, CountDisplay, Diagram, DiagramType, DisplayOptions } from 'types/exploration'
import { Card } from 'types/card'
import { StickyContainer } from 'components/ui/Pagination/styles'

type DataSectionProps = {
  data: { table: Table; cards: Card[]; diagrams: Diagram[]; timeline: TimelineT | null }
  count: CountDisplay | null
  orderBy: OrderBy
  isLoading: boolean
  pagination: { currentPage: number; total: number }
  displayOptions: DisplayOptions
  onChangePage: (page: number) => void
  onSort: (orderBy: OrderBy) => void
}

const DataSection = ({
  data,
  count,
  orderBy,
  isLoading,
  pagination,
  displayOptions,
  onChangePage,
  onSort
}: DataSectionProps) => {
  if (isLoading)
    return (
      <Grid container justifyContent="center" item xs={12}>
        <CircularProgress />
      </Grid>
    )
  return (
    <Grid container justifyContent="center" item xs={12}>
      <Grid container alignItems="center" gap="20px">
        {displayOptions.count && count && (
          <>
            {!count[0].count.results && !count[1].count.results ? (
              <Grid container justifyContent="center">
                <Typography variant="button">Aucune donnée à afficher</Typography>
              </Grid>
            ) : (
              <Grid container alignItems="center">
                {count[0].display && (
                  <DisplayDigits nb={count[0].count.results} total={count[0].count.total} label={count[0].label} />
                )}
                {count[1].display && (
                  <Typography fontSize={15} margin="0px 5px">
                    concernant
                  </Typography>
                )}
                {count[1].display && (
                  <>
                    <DisplayDigits nb={count[1].count.results} total={count[1].count.total} label={count[1].label} />
                  </>
                )}
              </Grid>
            )}
          </>
        )}
        <Grid container spacing={3}>
          {displayOptions.diagrams &&
            data.diagrams.map((diagram, index) => (
              <Grid key={index} item xs={12} md={6} lg={4}>
                <Chart isLoading={isLoading} title="Répartition par genre">
                  {diagram.type === DiagramType.BAR && (
                    <BarChart data={diagram.data as SimpleChartDataType[]} width={250} />
                  )}
                  {diagram.type === DiagramType.PIE && (
                    <PieChart data={diagram.data as SimpleChartDataType[]} width={250} />
                  )}
                  {diagram.type === DiagramType.PYRAMID && (
                    <PyramidChart data={diagram.data as AgeRepartitionType} width={250} />
                  )}
                </Chart>
              </Grid>
            ))}
        </Grid>
        {data.timeline && (
          <Timeline questionnaireResponses={data.timeline.data} questionnaires={data.timeline.questionnaires} />
        )}
        {!!count && count[0].count.results > 0 && (
          <Grid container id="list">
            {data.cards.map((card, index) => (
              <InfoCard key={index} value={card} />
            ))}
            {data.table && <DataTable value={data.table} orderBy={orderBy} onSort={onSort} />}
            <StickyContainer>
              <Pagination
                color="#303030"
                count={pagination.total}
                currentPage={pagination.currentPage}
                onPageChange={onChangePage}
                centered={true}
              />
            </StickyContainer>
          </Grid>
        )}
      </Grid>
    </Grid>
  )
}

export default DataSection
