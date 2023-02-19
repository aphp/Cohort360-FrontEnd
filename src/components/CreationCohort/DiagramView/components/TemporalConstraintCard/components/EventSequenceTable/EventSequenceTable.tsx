import React from 'react'

import {
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Paper,
  Tooltip
} from '@material-ui/core'
import DeleteIcon from '@material-ui/icons/Delete'

import { useAppDispatch, useAppSelector } from 'state'
import { buildCohortCreation, deleteTemporalConstraint } from 'state/cohortCreation'

import { TemporalConstraintsType } from 'types'

import useStyles from './styles'

const columns = [
  {
    label: '1er Critère',
    code: 'firstCriteria'
  },
  {
    label: 'type de contrainte',
    code: 'contrainteType'
  },
  {
    label: '2ème Critère',
    code: 'secondCriteria'
  },
  {
    label: 'de moins de',
    code: 'minDuration'
  },
  {
    label: 'de plus de',
    code: 'maxDuration'
  },
  {
    label: 'Suppression'
  }
]

const EventSequenceTable: React.FC = () => {
  const { temporalConstraints } = useAppSelector((state) => state.cohortCreation.request)
  const { selectedCriteria } = useAppSelector((state) => state.cohortCreation.request)

  const dispatch = useAppDispatch()
  const classes = useStyles()

  const onDeleteTemporalConstraint = (temporalConstraint: TemporalConstraintsType) => {
    dispatch<any>(deleteTemporalConstraint(temporalConstraint))
    dispatch<any>(buildCohortCreation({}))
  }

  const findCriteriaTitle = (id: any) => {
    const criteria = selectedCriteria.find((criteria) => criteria.id === id)
    return criteria?.title
  }

  const durationMesurementInFrench = (key: any) => {
    let keyInFrench
    if (key === 'days') {
      keyInFrench = 'jours'
    } else if (key === 'weeks') {
      keyInFrench = 'semaines'
    } else if (key === 'months') {
      keyInFrench = 'mois'
    } else if (key === 'years') {
      keyInFrench = 'ans'
    } else if (key === 'hours') {
      keyInFrench = 'heures'
    }
    return keyInFrench
  }

  const storeNonZeroMinDuration = (temporalConstraint: any) => {
    const minDuration = temporalConstraint.timeRelationMinDuration
    let nonZeroMinDuration: any = {}

    if (temporalConstraint.constraintType === 'directChronologicalOrdering' && minDuration) {
      for (const [key, value] of Object.entries(minDuration)) {
        if (value !== 0) {
          const keys = durationMesurementInFrench(key)
          const values = value
          nonZeroMinDuration = {
            keys: keys,
            values: values
          }
        }
      }
    }
    return nonZeroMinDuration
  }

  const storeNonZeroMaxDuration = (temporalConstraint: any) => {
    const maxDuration = temporalConstraint.timeRelationMaxDuration
    let nonZeroMaxDuration: any = {}

    if (temporalConstraint.constraintType === 'directChronologicalOrdering' && maxDuration) {
      for (const [key, value] of Object.entries(maxDuration)) {
        if (value !== 0) {
          const keys = durationMesurementInFrench(key)
          const values = value
          nonZeroMaxDuration = {
            keys: keys,
            values: values
          }
        }
      }
    }
    return nonZeroMaxDuration
  }

  return (
    <TableContainer component={Paper}>
      <Table className={classes.table}>
        <TableHead>
          <TableRow className={classes.tableHead}>
            {columns.map((column, index: number) => (
              <TableCell key={index} align="center" className={classes.tableHeadCell}>
                {column.label}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {!temporalConstraints ||
          temporalConstraints?.length === 0 ||
          (temporalConstraints.length === 1 && temporalConstraints.find(({ idList }) => idList[0] === 'All')) ? (
            <TableRow>
              <TableCell colSpan={7}>
                <Typography className={classes.loadingSpinnerContainer}>
                  Aucune séquence d'évènements à afficher
                </Typography>
              </TableCell>
            </TableRow>
          ) : (
            temporalConstraints.map((temporalConstraint: TemporalConstraintsType, index) => {
              const criteriaTitle1 = findCriteriaTitle(temporalConstraint.idList[0])
              const criteriaTitle2 = findCriteriaTitle(temporalConstraint.idList[1])
              const minDuration = storeNonZeroMinDuration(temporalConstraint)
              const maxDuration = storeNonZeroMaxDuration(temporalConstraint)
              return (
                temporalConstraint.constraintType === 'directChronologicalOrdering' && (
                  <TableRow key={index} className={classes.tableBodyRows} hover>
                    <TableCell align="center"> {`(${temporalConstraint.idList[0]}) - ${criteriaTitle1}`}</TableCell>
                    <TableCell align="center">s'est produit avant</TableCell>
                    <TableCell align="center">{`(${temporalConstraint.idList[1]}) - ${criteriaTitle2}`}</TableCell>
                    <TableCell align="center">{`${minDuration.values ?? '-'} ${minDuration.keys ?? ''}`}</TableCell>
                    <TableCell align="center">{`${maxDuration.values ?? '-'} ${maxDuration.keys ?? ''}`}</TableCell>
                    <TableCell align="center">
                      <Tooltip title="Supprimer la séquence temporelle" style={{ padding: '0 12px' }}>
                        <IconButton
                          onClick={(event) => {
                            event.stopPropagation()
                            onDeleteTemporalConstraint(temporalConstraint)
                          }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                )
              )
            })
          )}
        </TableBody>
      </Table>
    </TableContainer>
  )
}

export default EventSequenceTable
