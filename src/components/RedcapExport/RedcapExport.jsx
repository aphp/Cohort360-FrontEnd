import React, { useState } from 'react'

import Dialog from '@material-ui/core/Dialog'
import DialogTitle from '@material-ui/core/DialogTitle'
import Button from '@material-ui/core/Button'
import ToggleButton from '@material-ui/lab/ToggleButton'
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup'
import IconButton from '@material-ui/core/IconButton'
import Collapse from '@material-ui/core/Collapse'

import AnonymisationParameter from './AnonymisationParameter/AnonymisationParameter'
import CohortItem from './CohortItem/CohortItem'

import { CRF_ATTRIBUTES } from 'data/crfParameters'

import AddIcon from '@material-ui/icons/Add'
import CloseIcon from '@material-ui/icons/Close'

import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableContainer from '@material-ui/core/TableContainer'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'
import Paper from '@material-ui/core/Paper'

import { Alert, AlertTitle } from '@material-ui/lab'

import PropTypes from 'prop-types'
import useStyles from './styles'

import api from 'services/apiFhir'
import Tooltip from '@material-ui/core/Tooltip'

const RedcapExport = (props) => {
  const [anonymization, setAnonymization] = useState(0)

  const [crfAttribute, setCrfAttribute] = useState([
    { ...CRF_ATTRIBUTES[0] },
    { ...CRF_ATTRIBUTES[1] },
    { ...CRF_ATTRIBUTES[2] }
  ])

  const [k, setK] = useState(2)
  const [l, setL] = useState(1)

  const [risk, setRisk] = useState(null)
  const [error, setError] = useState(null)

  const handleAnonymization = (event, newAno) => {
    setAnonymization(newAno)
  }

  const handleAddButton = () => {
    const tmp = [...crfAttribute]
    tmp.push({ ...CRF_ATTRIBUTES[0] })
    setCrfAttribute(tmp)
  }

  const exportCSV = async () => {
    setError(null)
    const json = {
      idPatient: props.patientIds,
      anonymization: {
        type: anonymization,
        k: k,
        l: l
      },
      attributes: crfAttribute
    }

    try {
      const resp = await api.post('/Group?$export', json)

      if (resp.data.error) {
        setError(resp.data.error.message)
      } else {
        setRisk(resp.data.score)
      }

      const dataframe = resp.data.df
      const colNames = Object.keys(dataframe[0])

      const writeRow = (row) => colNames.map((name) => row[name]).join(',')

      let csvResult = `${colNames.join(',')}\n`
      for (const row of dataframe) {
        csvResult += `${writeRow(row)}\n`
      }

      const hiddenElement = document.createElement('a')
      hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodeURI(csvResult)
      hiddenElement.target = '_blank'
      if (props.cohortName) {
        hiddenElement.download = `redcap_export_${props.cohortName}.csv`
      } else {
        hiddenElement.download = 'redcap_export.csv'
      }
      hiddenElement.click()

      return json
    } catch (err) {
      setError(err.response.data ? err.response.data.error.message : err)
    }
  }
  const removeItem = (item) => {
    const idx = crfAttribute.indexOf(item)
    const tmp = [...crfAttribute]
    tmp.splice(idx, 1)
    setCrfAttribute(tmp)
  }
  const classes = useStyles(crfAttribute)

  return (
    <Dialog
      fullWidth={true}
      maxWidth={'lg'}
      onClose={props.onClose}
      aria-labelledby="simple-dialog-title"
      open={props.open}
      classes={{ paper: classes.dialogPaper }}
      className={classes.dialogRedcap}
    >
      <DialogTitle id="simple-dialog-title">eCRF Export</DialogTitle>

      <div className={classes.exportContent}>
        <div className={classes.insideExportContent}>
          <div className={classes.anonymChoice}>
            <ToggleButtonGroup
              value={anonymization}
              exclusive
              onChange={handleAnonymization}
              aria-label="text alignment"
            >
              <ToggleButton value={0}>Pas d&apos;anonymisation</ToggleButton>
              <ToggleButton value={1}>Pseudonymisation</ToggleButton>
              <ToggleButton value={2}>Anonymisation</ToggleButton>
            </ToggleButtonGroup>
          </div>
          {anonymization === 2 && <AnonymisationParameter setK={setK} setL={setL} />}
          <TableContainer component={Paper}>
            <Table className={classes.table} aria-label="simple table">
              <TableHead>
                <TableRow>
                  <TableCell align="left">
                    <Tooltip title="Activer pour pseudonymiser ou anonymiser la colonne">
                      <span> Anonymiser </span>
                    </Tooltip>
                  </TableCell>
                  <TableCell align="left">
                    <Tooltip title="Nom de l'attribut à exporter">
                      <span>Attribut à exporter </span>
                    </Tooltip>
                  </TableCell>

                  <TableCell align="left">
                    <Tooltip title="Rennomer la colonne pour l'export">
                      <span> Nom de colonne (personnalisable) </span>
                    </Tooltip>
                  </TableCell>
                  <TableCell align="left">
                    <Tooltip
                      title="Si précisé, renvoie 1 si le patient
                      possède ce champ, 0 sinon (peut être un Medication name ou Specific diagnostic)"
                    >
                      <span> Champ de recherche </span>
                    </Tooltip>
                  </TableCell>
                  <TableCell align="right"></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {crfAttribute.map((form, index) => {
                  return <CohortItem crfAttribute={form} key={index} onRemove={removeItem} />
                })}
              </TableBody>
            </Table>
          </TableContainer>
          <div className={classes.exportBox}>
            <div className={classes.riskText}>
              {error ? (
                <Collapse in={error !== null}>
                  <Alert
                    severity="error"
                    action={
                      <IconButton
                        aria-label="close"
                        color="inherit"
                        size="small"
                        onClick={() => {
                          setError(null)
                        }}
                      >
                        <CloseIcon fontSize="inherit" />
                      </IconButton>
                    }
                  >
                    <div>Une erreur est survenue, les paramètres d'anonymisation sont peut être trop stringeant.</div>
                    <div>{error}</div>
                  </Alert>
                </Collapse>
              ) : (
                risk !== null && (
                  <Collapse in={risk !== null}>
                    <Alert
                      action={
                        <IconButton
                          aria-label="close"
                          color="inherit"
                          size="small"
                          onClick={() => {
                            setRisk(null)
                          }}
                        >
                          <CloseIcon fontSize="inherit" />
                        </IconButton>
                      }
                    >
                      Risque de réidentification du dernier export : {risk}
                    </Alert>
                  </Collapse>
                )
              )}
            </div>
            <Button className={classes.exportButton} variant="contained" color="primary" onClick={exportCSV}>
              Export
            </Button>
          </div>
          <Button className={classes.addButton} variant="contained" onClick={handleAddButton}>
            <AddIcon />
          </Button>

          <Alert severity="info" className={classes.alertREDCAP}>
            <AlertTitle></AlertTitle>
            <div>
              L'export permet de télécharger un csv au format compatible avec <strong>eCRF</strong> (e.g. REDCap)
            </div>
            <div>
              Les attributs exportables donnent par défaut la valeur de l'attribut, en précisant le{' '}
              <i>Champ de recherche</i>, la valeur retournée est 1 si le patient possède ce champs 0 sinon.
            </div>
            <div>Vous pouvez choisir d'exporter un fichier brut, pseudonymisé ou anonymisé</div>
            <div>La pseudonymisation supprime les attributs identifiants</div>
            <div>
              L'anonymisation fournit un niveau de protection supplémentaire, transfomant les attributs qui, couplés à
              des informations extérieures, permettent d'identifier un individu.
            </div>
            <div>
              La <strong>K-anonymity</strong> assure que chaque individu inclus dans le dataset anonymisé est
              indistinguable d'au moins K-1 individus également inclus dans le dataset anonymisé (définissant une classe
              d'équivalence).
            </div>
            <div>
              La <strong>L-diversity</strong> assure que chaque classe d'équivalence contient au moins L valeurs
              distinctes d'attributs sensibles.
            </div>
            <div className={classes.importantText}>
              Lorsqu'un attribut a servi à construire la cohorte, il est conseillé de désactiver l'anonymisation
              associée.
            </div>
          </Alert>
        </div>
      </div>
    </Dialog>
  )
}

RedcapExport.propTypes = {
  patientIds: PropTypes.array.isRequired,
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  cohortName: PropTypes.string
}

export default RedcapExport
