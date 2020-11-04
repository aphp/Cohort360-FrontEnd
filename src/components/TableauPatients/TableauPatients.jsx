import React, { memo } from 'react'
import { useHistory } from 'react-router-dom'

import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableContainer from '@material-ui/core/TableContainer'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'
import Paper from '@material-ui/core/Paper'
import Chip from '@material-ui/core/Chip'

import PropTypes from 'prop-types'

import { ReactComponent as FemaleIcon } from '../../assets/icones/venus.svg'
import { ReactComponent as MaleIcon } from '../../assets/icones/mars.svg'

import useStyles from './style'
import { CircularProgress } from '@material-ui/core'
import { getAgeAphp } from '../../utils/age.js'

const PatientGender = (props) => {
  const gender = props.gender
  const style = props.className
  if (gender === 'female') {
    return <FemaleIcon className={style} />
  } else {
    return <MaleIcon className={style} />
  }
}

const StatusShip = ({ type }) => {
  const classes = useStyles()
  if (type === 'Vivant') {
    return <Chip className={classes.aliveChip} label={type} />
  } else {
    return <Chip className={classes.deceasedChip} label={type} />
  }
}

const TableauPatients = memo(({ deidentified, patients, loading }) => {
  const history = useHistory()
  const classes = useStyles()

  return loading ? (
    <CircularProgress className={classes.loadingSpinner} size={50} />
  ) : (
    <TableContainer component={Paper} className={classes.tableContainer}>
      <Table className={classes.table} aria-label="customized table">
        <TableHead>
          <TableRow className={classes.tableHead}>
            <TableCell align="center" className={classes.tableHeadCell}>
              Sexe
            </TableCell>
            <TableCell className={classes.tableHeadCell}>Prénom</TableCell>
            <TableCell className={classes.tableHeadCell}>Nom</TableCell>
            <TableCell className={classes.tableHeadCell}>
              Date de naissance
            </TableCell>
            <TableCell className={classes.tableHeadCell}>
              Dernier lieu de prise en charge
            </TableCell>
            <TableCell className={classes.tableHeadCell}>
              Statut vital
            </TableCell>
            {!deidentified && (
              <TableCell className={classes.tableHeadCell}>N° IPP</TableCell>
            )}
          </TableRow>
        </TableHead>
        <TableBody>
          {patients ? (
            patients.map((patient) => {
              return (
                patient && (
                  <TableRow
                    key={patient.id}
                    className={classes.tableBodyRows}
                    hover
                    onClick={() => history.push(`/patients/${patient.id}`)}
                  >
                    <TableCell align="center">
                      <PatientGender
                        gender={patient.gender}
                        className={classes.genderIcon}
                      />
                    </TableCell>
                    <TableCell>
                      {deidentified ? 'Prénom' : patient.name[0].given[0]}
                    </TableCell>
                    <TableCell>
                      {deidentified
                        ? 'Nom'
                        : patient.name.map((e) => e.family).join(' ')}
                    </TableCell>
                    <TableCell>
                      {deidentified
                        ? getAgeAphp(patient.extension[1])
                        : `${patient.birthDate} (${getAgeAphp(
                            patient.extension[1]
                          )})`}
                    </TableCell>
                    <TableCell>{patient.lastEncounter}</TableCell>
                    <TableCell>
                      <StatusShip
                        type={patient.deceasedDateTime ? 'Décédé' : 'Vivant'}
                      />
                    </TableCell>
                    {!deidentified && (
                      <TableCell>
                        {
                          patient.identifier.find(
                            (item) => item.type.coding[0].code === 'IPP'
                          ).value
                        }
                      </TableCell>
                    )}
                  </TableRow>
                )
              )
            })
          ) : (
            <TableRow> Aucun résultat à afficher </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  )
})

TableauPatients.displayName = TableauPatients

TableauPatients.propTypes = {
  deidentified: PropTypes.bool,
  patients: PropTypes.arrayOf(
    PropTypes.shape({
      gender: PropTypes.string.isRequired,
      birthDate: PropTypes.string.isRequired,
      deceasedDateTime: PropTypes.string,
      identifier: PropTypes.arrayOf(
        PropTypes.shape({ value: PropTypes.string })
      )
    })
  ).isRequired,
  loading: PropTypes.bool
}

export default TableauPatients
