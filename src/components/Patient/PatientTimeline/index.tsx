import React, { useState, useEffect, useMemo } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'

import CenteredCircularProgress from 'components/ui/CenteredCircularProgress'
import Typography from '@mui/material/Typography'

import CriteriasSection from 'components/ExplorationBoard/CriteriasSection'

import { CohortEncounter } from 'types'

import { useAppDispatch } from 'state'
import { fetchAllProcedures } from 'state/patient'

import useStyles from './styles'
import { Condition, Procedure } from 'fhir/r4'
import { Direction, FilterKeys, LabelObject, Order, TimelineFilter } from 'types/searchCriterias'
import { getConfig } from 'config'
import { getCleanGroupId } from 'utils/paginationUtils'
import { getCodeList } from 'services/aphp/serviceValueSets'
import { GAP } from 'types/exploration'
import { selectFiltersAsArray } from 'utils/filters'
import { Box } from '@mui/material'
import { generateTimelineFormattedData } from './mappers'
import useSearchCriterias from 'reducers/searchCriteriasReducer'
import FilterBy from 'components/ExplorationBoard/SearchSection/FilterBy'
import { ResourceType } from 'types/requestCriterias'
import Timeline from './Timeline'
import { TimelineOutput } from './types'

const initSearchCriterias = () => ({
  filters: {
    diagnosticTypes: [],
    encounterStatus: []
  },
  orderBy: { orderBy: Order.CREATED_AT, orderDirection: Direction.DESC }
})

const displayOptions = {
  myFilters: false,
  filterBy: true,
  orderBy: false,
  saveFilters: false,
  criterias: true,
  search: false,
  diagrams: false,
  count: false,
  sidebar: false
}

/**
 * Converts array of events in to object having date as the key and list of
 * event for that date as the value
 *
 * @param {Array} hospit Array of events in the form of ts and text
 * @param {Array} consult Array of events in the form of ts and text
 * @returns {Object} return object with key as date and values array in events for that date
 */

type PatientTimelineTypes = {
  loading: boolean
  deidentified: boolean
  hospits?: CohortEncounter[]
  procedures?: Procedure[]
  diagnostics?: Condition[]
}
const PatientTimeline = ({ loading, deidentified, hospits, procedures, diagnostics }: PatientTimelineTypes) => {
  const dispatch = useAppDispatch()
  const { classes } = useStyles({})
  const [_loading, setLoading] = useState(loading)

  const [diagnosticTypesList, setDiagnosticTypesList] = useState<LabelObject[]>([])
  const [encounterStatusList, setEncounterStatusList] = useState<LabelObject[]>([])
  const [timeline, setTimeline] = useState<TimelineOutput>([])
  const [{ filters }, { addFilters, removeFilter }] = useSearchCriterias<TimelineFilter>(
    initSearchCriterias(),
    ResourceType.PROCEDURE
  )

  const groupId = getCleanGroupId(useSearchParams()[0].get('groupId'))
  const { patientId } = useParams<{ patientId: string }>()

  useEffect(() => {
    const _fetch = async () => {
      const [diagnosticTypes, encounterStatus] = await Promise.all([
        getCodeList(getConfig().features.condition.valueSets.conditionStatus.url),
        getCodeList(getConfig().core.valueSets.encounterStatus.url)
      ])
      setEncounterStatusList(encounterStatus.results)
      setDiagnosticTypesList(diagnosticTypes.results)
    }
    _fetch()
  }, [])

  useEffect(() => {
    if (patientId) dispatch(fetchAllProcedures({ patientId, groupId }))
  }, [dispatch, patientId, groupId])

  useEffect(() => {
    setLoading(true)
    addFilters({
      encounterStatus: [],
      diagnosticTypes: diagnosticTypesList.filter((diagnosticType) => diagnosticType.id === 'dp')
    })
  }, [diagnosticTypesList])

  useEffect(() => {
    setLoading(true)
    const timeline = generateTimelineFormattedData(
      filters.encounterStatus.map(({ id }) => id),
      hospits,
      procedures,
      diagnostics,
      filters.diagnosticTypes
    )
    setTimeline(timeline)
    setLoading(false)
  }, [hospits, procedures, diagnostics, filters])

  const criterias = useMemo(() => {
    return filters ? selectFiltersAsArray(filters, '') : []
  }, [filters])

  return (
    <>
      {_loading && (
        <Box width="100%" height="100%" display="flex" justifyContent="center" alignItems="center">
          <CenteredCircularProgress size={25} />
        </Box>
      )}

      {!loading && (
        <Box width="100%" display="flex" flexDirection="row" flexWrap="wrap" gap={GAP} sx={{ my: 2 }}>
          {timeline.length ? (
            <>
              <Box width="100px">
                <FilterBy
                  filters={filters}
                  infos={{
                    deidentified: false,
                    type: ResourceType.PROCEDURE,
                    diagnosticTypesList: diagnosticTypesList,
                    encounterStatusList: encounterStatusList
                  }}
                  onSubmit={(filters) => addFilters(filters as TimelineFilter)}
                />
              </Box>

              <CriteriasSection
                value={criterias}
                displayOptions={displayOptions}
                onDelete={(category, value) => removeFilter(category as FilterKeys, value)}
              />

              <Box className={classes.centeredTimeline}>
                <Timeline timeline={timeline} groupId={groupId} deidentified={deidentified} />
              </Box>
            </>
          ) : (
            <Typography variant="button">Le patient n'a pas de visites à afficher.</Typography>
          )}
        </Box>
      )}
    </>
  )
}

export default PatientTimeline
