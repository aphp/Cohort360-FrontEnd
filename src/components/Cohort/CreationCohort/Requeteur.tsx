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
    setLoading(true)
    if (!practitioner) return

    const getDataFromFetch = async (_criteria: any) => {
      for (const _criterion of _criteria) {
        if (_criterion.fetch) {
          if (!_criterion.data) _criterion.data = {}
          const fetchKeys = Object.keys(_criterion.fetch)
          for (const fetchKey of fetchKeys) {
            const dataKey = fetchKey.replace('fetch', '').replace(/(\b[A-Z])(?![A-Z])/g, ($1) => $1.toLowerCase())
            const currentSelectedCriterion = selectedCriteria.find(
              (selectedCriterion: SelectedCriteriaType) => selectedCriterion.type === _criterion.id
            )
            switch (dataKey) {
              case 'ghmData':
              case 'ccamData':
              case 'cim10Diagnostic':
                if (_criterion.data[dataKey] === 'loading') _criterion.data[dataKey] = []

                if (currentSelectedCriterion) {
                  const allreadyHere = _criterion.data[dataKey]
                    ? _criterion.data[dataKey].find((data: any) => data.id === currentSelectedCriterion.code?.id)
                    : undefined

                  if (!allreadyHere) {
                    _criterion.data[dataKey] = [
                      ..._criterion.data[dataKey],
                      ...(await _criterion.fetch[fetchKey](currentSelectedCriterion.code?.id))
                    ]
                  }
                }
                break
              default:
                if (_criterion.data[dataKey] === 'loading') {
                  _criterion.data[dataKey] = await _criterion.fetch[fetchKey]()
                }
                break
            }
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
    setLoading(false)
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
    let uuid = ''

    if (snapshotsHistory && snapshotsHistory.length === 0) {
      // Create request + first snapshot
      const _request = await createRequest()
      _requestId = _request ? _request.uuid : null
      if (_requestId) {
        onChangeRequestId(_requestId)

        const newSnapshot = await createSnapshot(_requestId, newJson, true)
        if (newSnapshot) {
          uuid = newSnapshot.uuid
          const json = newSnapshot.serialized_query
          const date = newSnapshot.created_at
          onChangeCurrentSnapshot(uuid)
          onChangeSnapshotsHistory([{ uuid, json, date }])
        }
      }
    } else if (currentSnapshot) {
      // Update snapshots list
      const newSnapshot = await createSnapshot(currentSnapshot, newJson, false)
      if (newSnapshot) {
        const foundItem = snapshotsHistory.find(({ uuid }) => uuid === currentSnapshot)
        const index = foundItem ? snapshotsHistory.indexOf(foundItem) : -1

        uuid = newSnapshot.uuid
        const json = newSnapshot.serialized_query
        const date = newSnapshot.created_at

        const _snapshotsHistory =
          index === snapshotsHistory.length - 1 ? snapshotsHistory : snapshotsHistory.splice(0, index + 1)

        onChangeCurrentSnapshot(uuid)
        onChangeSnapshotsHistory([..._snapshotsHistory, { uuid, json, date }])
      }
    }
    setActionLoading(actionLoading.slice(0, actionLoading.length - 2 > 0 ? actionLoading.length - 2 : 0))
    _countCohort(newJson, uuid, _requestId ?? '')
  }

  const _buildRequest = async (
    _selectedPopulation: ScopeTreeRow[] | null,
    _selectedCriteria: SelectedCriteriaType[]
  ) => {
    onChangeSelectedPopulation(_selectedPopulation)
    onChangeSelectedCriteria(_selectedCriteria)

    const _json = await buildRequest(_selectedPopulation, _selectedCriteria)
    onChangeJson(_json)
    await _onSaveNewJson(_json)
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
  const _onExecute = (cohortName: string, cohortDescription: string) => {
    setActionLoading([...actionLoading, true])

    const _createCohort = async () => {
      if (!json) return

      const newCohortResult = await createCohort(
        json,
        count?.uuid,
        currentSnapshot,
        requestId,
        cohortName,
        cohortDescription
      )

      history.push(`/cohort/${newCohortResult?.['fhir_group_id']}`)
    }

    _createCohort()
    setActionLoading(actionLoading.slice(0, actionLoading.length - 2 > 0 ? actionLoading.length - 2 : 0))
  }

  const _onUndo = async () => {
    const foundItem = snapshotsHistory.find(({ uuid }) => uuid === currentSnapshot)
    const index = foundItem ? snapshotsHistory.indexOf(foundItem) : -1
    if (index !== -1) {
      const newCurrentSnapshot = snapshotsHistory[index - 1 > 0 ? index - 1 : 0]
      onChangeCurrentSnapshot(newCurrentSnapshot.uuid)
      onChangeJson(newCurrentSnapshot.json)
      await _unbuildRequest(newCurrentSnapshot)
      await _fetchCriteria()
    }
  }

  const _onRedo = async () => {
    const foundItem = snapshotsHistory.find(({ uuid }) => uuid === currentSnapshot)
    const index = foundItem ? snapshotsHistory.indexOf(foundItem) : -1
    if (index !== -1) {
      const newCurrentSnapshot =
        snapshotsHistory[index <= snapshotsHistory.length ? index + 1 : snapshotsHistory.length - 1]
      onChangeCurrentSnapshot(newCurrentSnapshot.uuid)
      onChangeJson(newCurrentSnapshot.json)
      await _unbuildRequest(newCurrentSnapshot)
      await _fetchCriteria()
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

  const _canExecute: () => boolean = () => {
    if (!json || !count?.uuid || !currentSnapshot || !requestId) {
      return false
    }
    return true
  }

  // Initial useEffect
  useEffect(() => {
    const _init = async () => {
      await _fetchCriteria()
    }

    _init()
  }, []) // eslint-disable-line

  // Re-fetch criteria after update population or criteria
  useEffect(() => {
    const _reload = async () => {
      await _fetchCriteria()
    }

    _reload()
  }, [selectedCriteria]) // eslint-disable-line

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
          onChangeSelectedPopulation={(_selectedPopulation: ScopeTreeRow[] | null) => {
            _buildRequest(_selectedPopulation, _selectedPopulation ? selectedCriteria || [] : [])
          }}
          criteria={criteria}
          selectedCriteria={selectedCriteria}
          onChangeSelectedCriteria={async (_selectedCriteria: SelectedCriteriaType[]) => {
            _buildRequest(selectedPopulation, _selectedCriteria)
          }}
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
        onExecute={_canExecute() ? _onExecute : undefined}
        onUndo={_canUndo() ? _onUndo : undefined}
        onRedo={_canRedo() ? _onRedo : undefined}
      />
    </>
  )
}

export default Requeteur
