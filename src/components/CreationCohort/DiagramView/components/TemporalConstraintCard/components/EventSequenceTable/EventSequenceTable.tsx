import React from 'react'

import {
  IconButton,
  Paper,
  Table,
  TableBody,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography
} from '@mui/material'
import { AvatarWrapper } from 'components/ui/Avatar/styles'
import DeleteIcon from '@mui/icons-material/Delete'
import { TableCellWrapper } from 'components/ui/TableCell/styles'

import { useAppSelector } from 'state'

import { CalendarRequestLabel } from 'types/dates'
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
    label: "d'au moins",
    code: 'minDuration'
  },
  {
    label: "d'au plus",
    code: 'maxDuration'
  },
  {
    label: 'Suppression'
  }
]

const EventSequenceTable: React.FC<{
  temporalConstraints: TemporalConstraintsType[]
  onChangeConstraints: (c: TemporalConstraintsType[]) => void
}> = ({ temporalConstraints, onChangeConstraints }) => {
  const { selectedCriteria } = useAppSelector((state) => state.cohortCreation.request)

  const { classes } = useStyles()

  const onDeleteTemporalConstraint = (temporalConstraint: TemporalConstraintsType) => {
    const remainingConstraints = temporalConstraints.filter((constraint) => constraint !== temporalConstraint)
    onChangeConstraints(remainingConstraints)
  }

  const findCriteriaTitle = (id: number | 'All') => {
    const criteria = selectedCriteria.find((criteria) => criteria.id === id)
    return criteria?.title
  }

  const durationMeasurementInFrench = (key: string) => {
    let keyInFrench
    if (key === 'days') {
      keyInFrench = CalendarRequestLabel.DAY
    } else if (key === 'weeks') {
      keyInFrench = CalendarRequestLabel.WEEK
    } else if (key === 'months') {
      keyInFrench = CalendarRequestLabel.MONTH
    } else if (key === 'years') {
      keyInFrench = CalendarRequestLabel.YEAR
    } else if (key === 'hours') {
      keyInFrench = CalendarRequestLabel.HOUR
    }
    return keyInFrench
  }

  const storeNonZeroMinDuration = (temporalConstraint: TemporalConstraintsType) => {
    const minDuration = temporalConstraint.timeRelationMinDuration
    let nonZeroMinDuration: { keys?: string; values?: number } = {}

    if (minDuration) {
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

  const storeNonZeroMaxDuration = (temporalConstraint: TemporalConstraintsType) => {
    const maxDuration = temporalConstraint.timeRelationMaxDuration
    let nonZeroMaxDuration: { keys?: string; values?: number } = {}

    if (maxDuration) {
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
    <TableContainer component={Paper} style={{ marginBottom: '1em' }}>
      <Table className={classes.table}>
        <TableHead>
          <TableRow className={classes.tableHead}>
            {columns.map((column, index: number) => (
              <TableCellWrapper key={index} className={classes.tableHeadCell}>
                {column.label}
              </TableCellWrapper>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {!temporalConstraints || temporalConstraints.length === 0 ? (
            <TableRow>
              <TableCellWrapper colSpan={7}>
                <Typography className={classes.loadingSpinnerContainer}>
                  Aucune séquence d'évènements à afficher
                </Typography>
              </TableCellWrapper>
            </TableRow>
          ) : (
            temporalConstraints.map((temporalConstraint: TemporalConstraintsType, index) => {
              const criteriaTitle1 = findCriteriaTitle(temporalConstraint.idList[0])
              const criteriaTitle2 = findCriteriaTitle(temporalConstraint.idList[1])
              const minDuration = storeNonZeroMinDuration(temporalConstraint)
              const maxDuration = storeNonZeroMaxDuration(temporalConstraint)
              return (
                <TableRow key={index} className={classes.tableBodyRows} hover>
                  <TableCellWrapper className={classes.flexCenter}>
                    <AvatarWrapper>{temporalConstraint.idList[0]}</AvatarWrapper>
                    <Typography style={{ width: 'fit-content', marginLeft: 4 }}> - {criteriaTitle1}</Typography>
                  </TableCellWrapper>
                  <TableCellWrapper>s'est produit avant</TableCellWrapper>
                  <TableCellWrapper className={classes.flexCenter}>
                    <AvatarWrapper>{temporalConstraint.idList[1]}</AvatarWrapper>
                    <Typography style={{ width: 'fit-content', marginLeft: 4 }}> - {criteriaTitle2}</Typography>
                  </TableCellWrapper>
                  <TableCellWrapper>{`${minDuration.values ?? '-'} ${minDuration.keys ?? ''}`}</TableCellWrapper>
                  <TableCellWrapper>{`${maxDuration.values ?? '-'} ${maxDuration.keys ?? ''}`}</TableCellWrapper>
                  <TableCellWrapper>
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
                  </TableCellWrapper>
                </TableRow>
              )
            })
          )}
        </TableBody>
      </Table>
    </TableContainer>
  )
}

export default EventSequenceTable
