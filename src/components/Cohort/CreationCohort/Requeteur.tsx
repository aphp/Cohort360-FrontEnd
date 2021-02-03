import React, { useCallback, useState, useEffect } from 'react'
import { CircularProgress, Tabs, Tab } from '@material-ui/core'
import { useHistory } from 'react-router-dom'
import { useDispatch } from 'react-redux'

import ControlPanel from './ControlPanel/ControlPanel'
import DiagramView from './DiagramView/DiagramView'
import JsonView from './JsonView/JsonView'

import { useAppSelector } from 'state'
import { setCriteriaList } from 'state/criteria'
import { unbuildCreationCohort, resetCohortCreation } from 'state/cohortCreation'
import { CohortCreationSnapshotType } from 'types'

import constructCriteriaList from './DataList_Criteria'

import useStyles from './styles'

import { getDataFromFetch } from '../../../utils/cohortCreation'
import { createCohort } from '../../../services/cohortCreation'

const Requeteur = () => {
  const practitioner = useAppSelector((state) => state.me)
  const {
    requestId = '',
    currentSnapshot = '',
    selectedCriteria = [],
    snapshotsHistory = [],
    count = {},
    json = ''
  } = useAppSelector((state) => state.cohortCreation.request || {})

  const classes = useStyles()
  const history = useHistory()
  const dispatch = useDispatch()

  const [loading, setLoading] = useState<boolean>(false)
  const [seletedTab, onChangeTab] = useState<'diagramme' | 'JSON'>('diagramme')

  /**
   * Fetch all criteria to display list + retrieve all data from fetcher
   */
  const _fetchCriteria = useCallback(async () => {
    setLoading(true)
    if (!practitioner) return

    let _criteria = constructCriteriaList()
    _criteria = await getDataFromFetch(Object.freeze(_criteria), selectedCriteria)
    dispatch(setCriteriaList(_criteria))
    setLoading(false)
  }, []) // eslint-disable-line

  const _unbuildRequest = async (newCurrentSnapshot: CohortCreationSnapshotType) => {
    dispatch(unbuildCreationCohort({ newCurrentSnapshot }))
  }

  /**
   * Execute query:
   *  - Create it with `createCohort`
   *  - Link fhir result with the back end, call /cohorts/
   */
  const _onExecute = (cohortName: string, cohortDescription: string) => {
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
      dispatch(resetCohortCreation())
    }

    _createCohort()
  }

  const _onUndo = async () => {
    const foundItem = snapshotsHistory.find(
      (snapshotsHistory: CohortCreationSnapshotType) => snapshotsHistory.uuid === currentSnapshot
    )
    const index = foundItem ? snapshotsHistory.indexOf(foundItem) : -1
    if (index !== -1) {
      const newCurrentSnapshot = snapshotsHistory[index - 1 > 0 ? index - 1 : 0]
      await _unbuildRequest(newCurrentSnapshot)
    }
  }

  const _onRedo = async () => {
    const foundItem = snapshotsHistory.find(
      (snapshotsHistory: CohortCreationSnapshotType) => snapshotsHistory.uuid === currentSnapshot
    )
    const index = foundItem ? snapshotsHistory.indexOf(foundItem) : -1
    if (index !== -1) {
      const newCurrentSnapshot =
        snapshotsHistory[index <= snapshotsHistory.length ? index + 1 : snapshotsHistory.length - 1]
      await _unbuildRequest(newCurrentSnapshot)
    }
  }

  const _canUndo: () => boolean = () => {
    const foundItem = snapshotsHistory
      ? snapshotsHistory.find(
          (snapshotsHistory: CohortCreationSnapshotType) => snapshotsHistory.uuid === currentSnapshot
        )
      : null
    const index = foundItem ? snapshotsHistory.indexOf(foundItem) : -1
    return index !== 0 && index !== -1
  }

  const _canRedo: () => boolean = () => {
    const foundItem = snapshotsHistory.find(
      (snapshotsHistory: CohortCreationSnapshotType) => snapshotsHistory.uuid === currentSnapshot
    )
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
    _fetchCriteria()
  }, [_fetchCriteria])

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
      {seletedTab === 'diagramme' ? <DiagramView /> : <JsonView defaultJson={json} onChangeJson={() => null} />}

      {/* Main Pannel */}
      <ControlPanel
        onExecute={_canExecute() ? _onExecute : undefined}
        onUndo={_canUndo() ? _onUndo : undefined}
        onRedo={_canRedo() ? _onRedo : undefined}
      />
    </>
  )
}

export default Requeteur
