import React from 'react'

import {
  Avatar,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography
} from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'

import { useAppSelector } from 'state'

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
    label: 'de plus de',
    code: 'minDuration'
  },
  {
    label: 'de moins de',
    code: 'maxDuration'
  },
  {
    label: 'Suppression'
  }
]

const EventSequenceTable: React.FC<{ temporalConstraints: TemporalConstraintsType[]; onChangeConstraints: any }> = ({
  temporalConstraints,
  onChangeConstraints
}) => {
  const { selectedCriteria } = useAppSelector((state) => state.cohortCreation.request)

  const classes = useStyles()

  const onDeleteTemporalConstraint = (temporalConstraint: TemporalConstraintsType) => {
    const remainingConstraints = temporalConstraints.filter((constraint) => constraint !== temporalConstraint)
    onChangeConstraints(remainingConstraints)
  }

  const findCriteriaTitle = (id: any) => {
    const criteria = selectedCriteria.find((criteria) => criteria.id === id)
    return criteria?.title
  }

  const durationMeasurementInFrench = (key: any) => {
    let keyInFrench
    if (key === 'days') {
      keyInFrench = 'jour(s)'
    } else if (key === 'weeks') {
      keyInFrench = 'semaine(s)'
    } else if (key === 'months') {
      keyInFrench = 'mois'
    } else if (key === 'years') {
      keyInFrench = 'an(s)'
    } else if (key === 'hours') {
      keyInFrench = 'heure(s)'
    }
    return keyInFrench
  }

  const storeNonZeroMinDuration = (temporalConstraint: any) => {
    const minDuration = temporalConstraint.timeRelationMinDuration
    let nonZeroMinDuration: any = {}

    if (temporalConstraint.constraintType === 'directChronologicalOrdering' && minDuration) {
      for (const [key, value] of Object.entries(minDuration)) {
        if (value !== 0) {
          const keys = durationMeasurementInFrench(key)
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
          const keys = durationMeasurementInFrench(key)
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
          {!temporalConstraints || temporalConstraints?.length === 0 ? (
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
                    <TableCell align="center" className={classes.flexCenter}>
                      <Avatar className={classes.avatar}>{temporalConstraint.idList[0]}</Avatar>
                      <Typography style={{ width: 'fit-content', marginLeft: 4 }}> - {criteriaTitle1}</Typography>
                    </TableCell>
                    <TableCell align="center">s'est produit avant</TableCell>
                    <TableCell align="center" className={classes.flexCenter}>
                      <Avatar className={classes.avatar}>{temporalConstraint.idList[1]}</Avatar>
                      <Typography style={{ width: 'fit-content', marginLeft: 4 }}> - {criteriaTitle2}</Typography>
                    </TableCell>
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
