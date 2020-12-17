import React, { useState, useEffect } from 'react'
import { CircularProgress, Tabs, Tab } from '@material-ui/core'
import { useHistory } from 'react-router-dom'

import ControlPanel from './ControlPanel/ControlPanel'
import DiagramView from './DiagramView/DiagramView'
import JsonView from './JsonView/JsonView'

import { useAppSelector } from 'state'
import { ScopeTreeRow, SelectedCriteriaType, CohortCreationCounterType } from 'types'

import constructCriteriaList from './DataList_Criteria'

import useStyles from './styles'

import { buildRequest, unbuildRequest } from '../../../utils/buildRequest'
import { countCohort, createCohort, createRequest, createSnapshot } from '../../../services/cohortCreation'

type SnapshotType = {
  uuid: string
  json: string
  date: string
}

const Requeteur = () => {
  const practitioner = useAppSelector((state) => state.me)
  const classes = useStyles()
  const history = useHistory()

  const [loading, setLoading] = useState<boolean>(true)
  const [actionLoading, setActionLoading] = useState<boolean[]>([])
  const [seletedTab, onChangeTab] = useState<'diagramme' | 'JSON'>('diagramme')

  const [criteria, onChangeCriteria] = useState<any[]>([])

  const [requestId, onChangeRequestId] = useState<string>('')
  const [currentSnapshot, onChangeCurrentSnapshot] = useState<string | undefined>(undefined)
  const [snapshotsHistory, onChangeSnapshotsHistory] = useState<SnapshotType[]>([])

  const [count, setCount] = useState<CohortCreationCounterType>({})

  // Pour le moment, sans forme de JSON...
  const [selectedPopulation, onChangeSelectedPopulation] = useState<ScopeTreeRow[] | null>(null)
  const [selectedCriteria, onChangeSelectedCriteria] = useState<SelectedCriteriaType[]>([])

  const [json, onChangeJson] = useState<string>('')

  /**
   * Fetch all criteria to display list + retrieve all data from fetcher
   */
  const _fetchCriteria = async () => {
    if (!practitioner) return

    const getDataFromFetch = async (_criteria: any) => {
      for (const _criterion of _criteria) {
        if (_criterion.fetch) {
          _criterion.data = {}
          const fetchKeys = Object.keys(_criterion.fetch)
          for (const fetchKey of fetchKeys) {
            const dataKey = fetchKey.replace('fetch', '').replace(/(\b[A-Z])(?![A-Z])/g, ($1) => $1.toLowerCase())
            _criterion.data[dataKey] = await _criterion.fetch[fetchKey]()
          }
        }
        _criterion.subItems =
          _criterion.subItems && _criterion.subItems.length > 0 ? await getDataFromFetch(_criterion.subItems) : []
      }
      return _criteria
    }

    let _criteria = constructCriteriaList()
    _criteria = await getDataFromFetch(_criteria)

    onChangeCriteria(_criteria)
  }

  /**
   * Set all data to 'loading' to display a loader, save-it.
   * Just after, get new count and save it
   */
  const _countCohort = async (_json: string, _snapshotId: string, _requestId: string) => {
    if (!_json || !_snapshotId || !_requestId) return
    setActionLoading([...actionLoading, true])

    let _count: CohortCreationCounterType = {
      includePatient: 'loading',
      byrequest: 'loading',
      alive: 'loading',
      deceased: 'loading',
      female: 'loading',
      male: 'loading'
    }
    await setCount(_count)
    const countResult = await countCohort(_json, _snapshotId, _requestId)
    _count = {
      uuid: countResult?.uuid ?? '',
      includePatient: countResult?.count ?? 0,
      // TODO: CHANGE IT, for the moment, we have not details ....
      byrequest: 0,
      alive: 0,
      deceased: 0,
      female: 0,
      male: 0
    }
    setCount(_count)
    setActionLoading(actionLoading.slice(0, actionLoading.length - 2 > 0 ? actionLoading.length - 2 : 0))
  }

  const _onSaveNewJson = async (newJson: string) => {
    setActionLoading([...actionLoading, true])
    let _requestId = requestId ? requestId : null

    if (snapshotsHistory && snapshotsHistory.length === 0) {
      // Create request + first snapshot
      const _request = await createRequest()
      _requestId = _request ? _request.uuid : null
      if (_requestId) {
        onChangeRequestId(_requestId)

        const newSnapshot = await createSnapshot(_requestId, newJson, true)
        if (newSnapshot) {
          const uuid = newSnapshot.uuid
          const json = newSnapshot.serialized_query
          const date = newSnapshot.created_at
          onChangeCurrentSnapshot(uuid)
          onChangeSnapshotsHistory([{ uuid, json, date }])
          _countCohort(newJson, uuid, _requestId ?? '')
        }
      }
    } else if (currentSnapshot) {
      // Update snapshots list
      const newSnapshot = await createSnapshot(currentSnapshot, newJson, false)

      if (newSnapshot) {
        const foundItem = snapshotsHistory.find(({ uuid }) => uuid === currentSnapshot)
        const index = foundItem ? snapshotsHistory.indexOf(foundItem) : -1

        const uuid = newSnapshot.uuid
        const json = newSnapshot.serialized_query
        const date = newSnapshot.created_at

        const _snapshotsHistory =
          index === snapshotsHistory.length - 1 ? snapshotsHistory : snapshotsHistory.splice(0, index + 1)

        onChangeCurrentSnapshot(uuid)
        onChangeSnapshotsHistory([..._snapshotsHistory, { uuid, json, date }])
        _countCohort(newJson, uuid, _requestId ?? '')
      }
    }
    setActionLoading(actionLoading.slice(0, actionLoading.length - 2 > 0 ? actionLoading.length - 2 : 0))
  }

  const _buildRequest = async (
    _selectedPopulation: ScopeTreeRow[] | null,
    _selectedCriteria: SelectedCriteriaType[]
  ) => {
    onChangeSelectedPopulation(_selectedPopulation)
    onChangeSelectedCriteria(_selectedCriteria)
    if (!_selectedPopulation && _selectedCriteria && _selectedCriteria.length === 0) return

    const _json = buildRequest(_selectedPopulation, _selectedCriteria)
    onChangeJson(_json)
    _onSaveNewJson(_json)
  }

  const _unbuildRequest = async (newCurrentSnapshot: SnapshotType) => {
    const { population, criteria } = await unbuildRequest(newCurrentSnapshot.json)
    onChangeSelectedPopulation(population)
    onChangeSelectedCriteria(criteria)
    _countCohort(newCurrentSnapshot.json, newCurrentSnapshot.uuid, requestId)
  }

  /**
   * Execute query:
   *  - Create it with `createCohort`
   *  - Link fhir result with the back end, call /cohorts/
   */
  const _onExecute = () => {
    setActionLoading([...actionLoading, true])

    const _createCohort = async () => {
      if (!json) return

      const newCohortResult = await createCohort(json, count?.uuid, currentSnapshot, requestId)
      const cohortId = newCohortResult ? newCohortResult['fhir_group_id'] : ''
      if (!cohortId) return

      history.push(`/cohort/${cohortId}`)
    }

    _createCohort()
    setActionLoading(actionLoading.slice(0, actionLoading.length - 2 > 0 ? actionLoading.length - 2 : 0))
  }

  const _onUndo = () => {
    const foundItem = snapshotsHistory.find(({ uuid }) => uuid === currentSnapshot)
    const index = foundItem ? snapshotsHistory.indexOf(foundItem) : -1
    if (index !== -1) {
      const newCurrentSnapshot = snapshotsHistory[index - 1 > 0 ? index - 1 : 0]
      onChangeCurrentSnapshot(newCurrentSnapshot.uuid)
      onChangeJson(newCurrentSnapshot.json)
      _unbuildRequest(newCurrentSnapshot)
    }
  }

  const _onRedo = () => {
    const foundItem = snapshotsHistory.find(({ uuid }) => uuid === currentSnapshot)
    const index = foundItem ? snapshotsHistory.indexOf(foundItem) : -1
    if (index !== -1) {
      const newCurrentSnapshot =
        snapshotsHistory[index <= snapshotsHistory.length ? index + 1 : snapshotsHistory.length - 1]
      onChangeCurrentSnapshot(newCurrentSnapshot.uuid)
      onChangeJson(newCurrentSnapshot.json)
      _unbuildRequest(newCurrentSnapshot)
    }
  }

  const _canUndo: () => boolean = () => {
    const foundItem = snapshotsHistory ? snapshotsHistory.find(({ uuid }) => uuid === currentSnapshot) : null
    const index = foundItem ? snapshotsHistory.indexOf(foundItem) : -1
    return index !== 0 && index !== -1
  }

  const _canRedo: () => boolean = () => {
    const foundItem = snapshotsHistory.find(({ uuid }) => uuid === currentSnapshot)
    const index = foundItem ? snapshotsHistory.indexOf(foundItem) : -1
    return index !== snapshotsHistory.length - 1 && index !== -1
  }

  // Initial useEffect
  useEffect(() => {
    const _init = async () => {
      setLoading(true)
      await _fetchCriteria()
      setLoading(false)
    }

    _init()
  }, []) // eslint-disable-line

  if (loading) return <CircularProgress />

  return (
    <>
      {/* Div Main */}
      <div className={classes.tabsContainer}>
        <Tabs value={seletedTab} onChange={(e, tab) => onChangeTab(tab)}>
          <Tab
            classes={{ root: classes.tabItem, selected: classes.selectedTabItem }}
            label="Diagramme"
            disableFocusRipple
            disableRipple
            value="diagramme"
          />
          <Tab
            classes={{ root: classes.tabItem, selected: classes.selectedTabItem }}
            label="JSON"
            disableFocusRipple
            disableRipple
            value="json"
          />
        </Tabs>
      </div>

      {/* Display View (Diagramme + JSON) */}
      {seletedTab === 'diagramme' ? (
        <DiagramView
          selectedPopulation={selectedPopulation}
          onChangeSelectedPopulation={(_selectedPopulation: ScopeTreeRow[] | null) =>
            _buildRequest(_selectedPopulation, selectedCriteria || [])
          }
          criteria={criteria}
          selectedCriteria={selectedCriteria}
          onChangeSelectedCriteria={(_selectedCriteria: SelectedCriteriaType[]) =>
            _buildRequest(selectedPopulation, _selectedCriteria)
          }
          actionLoading={actionLoading.length > 0}
        />
      ) : (
        <JsonView defaultJson={json} onChangeJson={onChangeJson} />
      )}

      {/* Main Pannel */}
      <ControlPanel
        includePatient={count.includePatient}
        byrequest={count.byrequest}
        alive={count.alive}
        deceased={count.deceased}
        female={count.female}
        male={count.male}
        executeLoading={actionLoading.length > 0}
        onExecute={_onExecute}
        onUndo={_canUndo() ? _onUndo : undefined}
        onRedo={_canRedo() ? _onRedo : undefined}
      />
    </>
  )
}

export default Requeteur
