import React, { useState } from 'react'
// import moment from 'moment'
import { useDispatch } from 'react-redux'

import { Button, Card, CardHeader, CardContent, CircularProgress, IconButton } from '@material-ui/core'

import AddIcon from '@material-ui/icons/Add'
import DeleteIcon from '@material-ui/icons/Delete'
import EditIcon from '@material-ui/icons/Edit'

import CriteriaRightPanel from './components/CriteriaRightPanel/CriteriaRightPanel'
// import CriteriaCardContent from './components/CriteriaCardContent/CriteriaCardContent'

import { useAppSelector } from 'state'
import { buildCreationCohort } from 'state/cohortCreation'
import { SelectedCriteriaType } from 'types'

import useStyles from './styles'

const CriteriaCard: React.FC = () => {
  const classes = useStyles()
  const dispatch = useDispatch()

  const criteria = useAppSelector((state) => state.cohortCreation.criteria)
  const { loading = false, selectedCriteria = [] } = useAppSelector<{
    loading: boolean
    selectedCriteria: SelectedCriteriaType[]
  }>((state) => state.cohortCreation.request || {})

  const [indexCriteria, onChangeIndexCriteria] = useState<number | null>(null)
  const [openCriteriaDrawer, onChangeOpenCriteriaDrawer] = useState<boolean>(false)

  const _addSelectedCriteria = () => {
    onChangeIndexCriteria(null)
    onChangeOpenCriteriaDrawer(true)
  }

  const _editSelectedCriteria = (index: number) => {
    onChangeIndexCriteria(index)
    onChangeOpenCriteriaDrawer(true)
  }

  const _deleteSelectedCriteria = (index: number) => {
    const savedSelectedCriteria = [...selectedCriteria]
    savedSelectedCriteria.splice(index, 1)
    dispatch(buildCreationCohort({ selectedCriteria: savedSelectedCriteria }))
  }

  const _onChangeSelectedCriteria = (newSelectedCriteria: SelectedCriteriaType) => {
    let savedSelectedCriteria = [...selectedCriteria]
    if (indexCriteria !== null) {
      savedSelectedCriteria[indexCriteria] = newSelectedCriteria
    } else {
      savedSelectedCriteria = [...savedSelectedCriteria, newSelectedCriteria]
    }
    dispatch(buildCreationCohort({ selectedCriteria: savedSelectedCriteria }))
  }

  return (
    <>
      <div className={classes.root}>
        <Card className={classes.card}>
          <CardHeader
            className={classes.cardHeader}
            action={
              <>
                <IconButton size="small" onClick={() => _editSelectedCriteria(0)} style={{ color: 'currentcolor' }}>
                  <EditIcon />
                </IconButton>
                <IconButton size="small" onClick={() => _deleteSelectedCriteria(0)} style={{ color: 'currentcolor' }}>
                  <DeleteIcon />
                </IconButton>
              </>
            }
          />
          <CardContent className={classes.cardContent}></CardContent>
        </Card>
      </div>

      <div className={classes.root}>
        <Button
          disabled={loading}
          className={classes.addButton}
          onClick={_addSelectedCriteria}
          variant="contained"
          color="primary"
        >
          {loading ? <CircularProgress className={classes.loading} /> : <AddIcon />}
        </Button>
      </div>

      <CriteriaRightPanel
        criteria={criteria}
        selectedCriteria={indexCriteria !== null ? selectedCriteria[indexCriteria] : null}
        onChangeSelectedCriteria={_onChangeSelectedCriteria}
        open={openCriteriaDrawer}
        onClose={() => onChangeOpenCriteriaDrawer(false)}
      />
    </>
  )
}

export default CriteriaCard
