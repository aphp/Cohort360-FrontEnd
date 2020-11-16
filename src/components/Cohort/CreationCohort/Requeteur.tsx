import React, { useState, useEffect } from 'react'
import { CircularProgress, Tabs, Tab } from '@material-ui/core'

import ControlPanel from './ControlPanel/ControlPanel'
import DiagramView from './DiagramView/DiagramView'
import JsonView from './JsonView/JsonView'

import { useAppSelector } from 'state'
import { ScopeTreeRow, SelectedCriteriaType } from 'types'

import constructCriteriaList from './DataList_Criteria'

import useStyles from './styles'

const Requeteur = () => {
  const practitioner = useAppSelector((state) => state.me)
  const classes = useStyles()

  const [loading, setLoading] = useState<boolean>(true)
  const [seletedTab, onChangeTab] = useState<'diagramme' | 'json'>('diagramme')
  const [criteria, onChangeCriteria] = useState<any[]>([])

  // Pour le moment, sans forme de JSON...
  const [selectedPopulation, onChangeSelectedPopulation] = useState<ScopeTreeRow[] | null>(null)
  const [selectedCriteria, onChangeSelectedCriteria] = useState<SelectedCriteriaType[]>([])

  const [json, onChangeJson] = useState<string>('')
  const [cursorError, onChangeCursorError] = useState<number>(0)

  const _fetchCriteria = async () => {
    if (!practitioner) return

    const _criteria = await constructCriteriaList()
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
    if (seletedTab === 'json') {
      console.log("Transfert d'Object to JSON", selectedPopulation, selectedCriteria)
    } else {
      try {
        if (json) console.log('Parse =>', JSON.parse(json))
      } catch (error) {
        onChangeTab('json')
        console.log('error', error)
        const _cursorError = parseInt(error.toString().split('\n')[0].replace(/\D/gm, ''))
        console.log('_cursorError', _cursorError)
        if (_cursorError > 0) {
          onChangeCursorError(_cursorError)
        }
      }
    }
  }, [seletedTab]) // eslint-disable-line

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
        <JsonView defaultJson={json} onChangeJson={onChangeJson} cursorStart={cursorError} />
      )}

      {/* Main Pannel */}
      <ControlPanel />
    </>
  )
}

export default Requeteur
