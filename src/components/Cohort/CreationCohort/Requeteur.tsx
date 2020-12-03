import React, { useState, useEffect } from 'react'
import { CircularProgress, Tabs, Tab } from '@material-ui/core'
// import { useHistory } from 'react-router-dom'

import ControlPanel from './ControlPanel/ControlPanel'
import DiagramView from './DiagramView/DiagramView'
import JsonView from './JsonView/JsonView'

import { useAppSelector } from 'state'
import { ScopeTreeRow, SelectedCriteriaType, CohortCreationCounterType } from 'types'

import constructCriteriaList from './DataList_Criteria'

import useStyles from './styles'

import buildRequest from '../../../utils/buildRequest'
import { countCohort, createCohort, createRequest, createSnapshot } from '../../../services/cohortCreation'

const Requeteur = () => {
  const practitioner = useAppSelector((state) => state.me)
  const classes = useStyles()
  // const history = useHistory()

  const [loading, setLoading] = useState<boolean>(true)
  const [count, setCount] = useState<CohortCreationCounterType>({})
  const [seletedTab, onChangeTab] = useState<'diagramme' | 'JSON'>('diagramme')
  const [criteria, onChangeCriteria] = useState<any[]>([])
  const [currentSnapshot, onChangeCurrentSnapshot] = useState<string | undefined>(undefined)
  const [snapshotsHistory, onChangeSnapshotsHistory] = useState<string[]>([])
  const [requestId, onChangeRequestId] = useState<string>('')

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
  }

  const _onSaveJson = async (newJson: string) => {
    let _requestId = requestId ? requestId : null
    let newSnapshotId = null

    if (snapshotsHistory && snapshotsHistory.length === 0) {
      // Create request + first snapshot
      const _request = await createRequest()
      _requestId = _request ? _request.uuid : null
      if (_requestId) {
        onChangeRequestId(_requestId)

        const newSnapshot = await createSnapshot(_requestId, newJson, true)
        newSnapshotId = newSnapshot ? newSnapshot.uuid : null
        if (newSnapshotId) {
          onChangeCurrentSnapshot(newSnapshotId)
          onChangeSnapshotsHistory([newSnapshotId])
        }
      }
    } else if (currentSnapshot) {
      // Update snapshots list
      const newSnapshot = await createSnapshot(currentSnapshot, newJson, false)
      newSnapshotId = newSnapshot ? newSnapshot.uuid : null
      onChangeCurrentSnapshot(newSnapshotId)
      onChangeSnapshotsHistory([...snapshotsHistory, newSnapshotId])
    }
    _countCohort(newJson, newSnapshotId, _requestId ?? '')
  }

  /**
   * Execute query:
   *  - Create it with `createCohort`
   *  - Link fhir result with the back end, call /cohorts/
   */
  const _onExecute = () => {
    setLoading(true)
    const _createCohort = async () => {
      if (!json) return

      const newCohortResult = await createCohort(json, count?.uuid, currentSnapshot, requestId)
      const cohortId = newCohortResult?.['group.id']
      if (!cohortId) return

      // history.push(`/cohort/${cohortId}`)
    }
    _createCohort()
  }

  const _onUndo = () => {
    const index = snapshotsHistory && currentSnapshot && snapshotsHistory.indexOf(currentSnapshot)
    if (index === undefined || index === '' || index === -1) return
    const newSnapshotId = snapshotsHistory[index - 1 >= 0 ? index - 1 : 0]
    onChangeCurrentSnapshot(newSnapshotId)
  }

  const _onRedo = () => {
    const index = snapshotsHistory && currentSnapshot && snapshotsHistory.indexOf(currentSnapshot)
    if (index === undefined || index === '' || index === -1) return
    const newSnapshotId = snapshotsHistory[index <= snapshotsHistory.length ? index + 1 : snapshotsHistory.length - 1]
    onChangeCurrentSnapshot(newSnapshotId)
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

  /**
   * Construct json based on population + criteria cards
   */
  useEffect(() => {
    if (!selectedPopulation && selectedCriteria && selectedCriteria.length === 0) return

    const _json = buildRequest(selectedPopulation, selectedCriteria)
    onChangeJson(_json)
  }, [selectedPopulation, selectedCriteria]) // eslint-disable-line

  /**
   * For each json change:
   *  - save it => /request-query-snapshots/
   *  - count => /count
   */
  useEffect(() => {
    if (json) _onSaveJson(json)
  }, [json]) // eslint-disable-line

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
          onChangeSelectedPopulation={onChangeSelectedPopulation}
          criteria={criteria}
          selectedCriteria={selectedCriteria}
          onChangeSelectedCriteria={onChangeSelectedCriteria}
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
        onExecute={_onExecute}
        onUndo={
          snapshotsHistory &&
          currentSnapshot &&
          snapshotsHistory.indexOf(currentSnapshot) !== 0 &&
          snapshotsHistory.indexOf(currentSnapshot) !== -1
            ? _onUndo
            : undefined
        }
        onRedo={
          snapshotsHistory &&
          currentSnapshot &&
          snapshotsHistory.indexOf(currentSnapshot) !== snapshotsHistory.length - 1 &&
          snapshotsHistory.indexOf(currentSnapshot) !== -1
            ? _onRedo
            : undefined
        }
      />
    </>
  )
}

export default Requeteur
