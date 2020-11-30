import React, { useState, useEffect } from 'react'
import { CircularProgress, Tabs, Tab } from '@material-ui/core'

import ControlPanel from './ControlPanel/ControlPanel'
import DiagramView from './DiagramView/DiagramView'
import JsonView from './JsonView/JsonView'

import { useAppSelector } from 'state'
import { ScopeTreeRow, SelectedCriteriaType, CohortCreationCounterType } from 'types'

import constructCriteriaList from './DataList_Criteria'

import useStyles from './styles'

import buildRequest from '../../../utils/buildRequest'
import { countCohort } from '../../../services/cohortCreation'

const Requeteur = () => {
  const practitioner = useAppSelector((state) => state.me)
  const classes = useStyles()

  const [loading, setLoading] = useState<boolean>(true)
  const [count, setCount] = useState<CohortCreationCounterType>({})
  const [seletedTab, onChangeTab] = useState<'diagramme' | 'JSON'>('diagramme')
  const [criteria, onChangeCriteria] = useState<any[]>([])

  // Pour le moment, sans forme de JSON...
  const [selectedPopulation, onChangeSelectedPopulation] = useState<ScopeTreeRow[] | null>(null)
  const [selectedCriteria, onChangeSelectedCriteria] = useState<SelectedCriteriaType[]>([])

  const _fetchCriteria = async () => {
    if (!practitioner) return

    const _criteria = constructCriteriaList()

    // Fetch Patient Data
    if (_criteria && _criteria[1] && _criteria[1].fetch) {
      _criteria[1].data.gender = await _criteria[1].fetch.fetchGender()
      _criteria[1].data.deceased = await _criteria[1].fetch.fetchStatus()
    }

    // Fetch Encouters Data
    if (_criteria && _criteria[2] && _criteria[2].fetch) {
      _criteria[2].data.admissionModes = await _criteria[2].fetch.fetchAdmissionModes()
      _criteria[2].data.entryModes = await _criteria[2].fetch.fetchEntryModes()
      _criteria[2].data.exitModes = await _criteria[2].fetch.fetchExitModes()
      _criteria[2].data.fileStatus = await _criteria[2].fetch.fetchFileStatus()
    }

    // Fetch DiagnosticCim10 Data
    if (
      _criteria &&
      _criteria[4] &&
      _criteria[4].subItems &&
      _criteria[4].subItems[0] &&
      _criteria[4].subItems[0].fetch
    ) {
      _criteria[4].subItems[0].data.statusDiagnostic = await _criteria[4].subItems[0].fetch.fetchStatusDiagnostic()
      _criteria[4].subItems[0].data.kindDiagnostic = await _criteria[4].subItems[0].fetch.fetchKindDiagnostic()
      _criteria[4].subItems[0].data.cim10Diagnostic = await _criteria[4].subItems[0].fetch.fetchCim10Diagnostic()
    }
    onChangeCriteria(_criteria)
  }

  useEffect(() => {
    const _init = async () => {
      setLoading(true)
      await _fetchCriteria()
      setLoading(false)
    }

    _init()
  }, []) // eslint-disable-line

  useEffect(() => {
    if (!selectedPopulation && !selectedCriteria) return

    const _countCohort = async (requeteurJson: string) => {
      let _count: CohortCreationCounterType = {
        includePatient: 'loading',
        byrequest: 'loading',
        alive: 'loading',
        deceased: 'loading',
        female: 'loading',
        male: 'loading'
      }
      await setCount(_count)
      const countResult = await countCohort(requeteurJson)
      _count = {
        includePatient: countResult?.count ?? 0,
        // TODO: CHANGE IT
        byrequest: 0,
        alive: 0,
        deceased: 0,
        female: 0,
        male: 0
      }
      setCount(_count)
    }

    const requeteurJson = buildRequest(selectedPopulation, selectedCriteria)
    _countCohort(requeteurJson)
  }, [selectedPopulation, selectedCriteria])

  const _onExecute = () => {}

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
        <JsonView />
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
      />
    </>
  )
}

export default Requeteur
