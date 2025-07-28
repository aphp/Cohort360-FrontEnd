import React from 'react'
import { AccordionDetails, AccordionSummary, Grid, Typography } from '@mui/material'
import DataTable from 'components/ui/Table'
import { Table } from 'types/table'
import { OrderBy } from 'types/searchCriterias'
import { StickyPagination } from 'components/ui/Pagination'
import Chart from 'components/ui/Chart'
import PyramidChart from 'components/Dashboard/Preview/Charts/PyramidChart'
import BarChart from 'components/Dashboard/Preview/Charts/BarChart'
import PieChart from 'components/Dashboard/Preview/Charts/PieChart'
import Timeline from 'components/Patient/MaternityTimeline'
import { AgeRepartitionType, SimpleChartDataType } from 'types'
import InfoCard from 'components/ui/Cards/InfoCard'
import { Timeline as TimelineT, Diagram, DiagramType, DisplayOptions, GAP } from 'types/exploration'
import { Card } from 'types/card'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import AccordionWrapper from 'components/ui/Accordion'
import CenteredCircularProgress from 'components/ui/CenteredCircularProgress'

type DataSectionProps = {
  data: { table: Table; cards: Card[]; diagrams: Diagram[]; timeline: TimelineT | null }
  orderBy: OrderBy
  isLoading: boolean
  pagination: { currentPage: number; total: number }
  displayOptions: DisplayOptions
  onChangePage: (page: number) => void
  onSort: (orderBy: OrderBy) => void
}

const DataSection = ({
  data,
  orderBy,
  isLoading,
  pagination,
  displayOptions,
  onChangePage,
  onSort
}: DataSectionProps) => {
  if (isLoading)
    return (
      <Grid container justifyContent="center" alignItems="center" height="50vh">
        <CenteredCircularProgress />
      </Grid>
    )
  return (
    <Grid container justifyContent="center" item xs={12} gap={GAP} sx={{ flexGrow: 1, flexDirection: 'column' }}>
      {displayOptions.diagrams && (
        <AccordionWrapper defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMoreIcon htmlColor="#153D8A" />}>
            <Typography fontWeight={600} fontSize={16} color="#153D8A" fontFamily={"'Montserrat', sans-serif"}>
              Graphiques
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={3}>
              {data.diagrams.map((diagram, index) => (
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
          </AccordionDetails>
        </AccordionWrapper>
      )}
      {data.timeline && (
        <Timeline questionnaireResponses={data.timeline.data} questionnaires={data.timeline.questionnaires} />
      )}
      <Grid container id="list">
        {displayOptions.sidebar && data.cards.map((card, index) => <InfoCard key={index} value={card} />)}
        {!displayOptions.sidebar && data.table && <DataTable value={data.table} orderBy={orderBy} onSort={onSort} />}
        <StickyPagination
          count={pagination.total}
          currentPage={pagination.currentPage}
          onPageChange={onChangePage}
          sidebarDisplay={displayOptions.sidebar}
        />
      </Grid>
    </Grid>
  )
}

export default DataSection
