import React, { useState } from 'react'

import {
  Dialog,
  DialogTitle,
  Button,
  IconButton,
  Collapse,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  DialogContent,
  MenuItem,
  Select,
  Typography,
  Tooltip,
  Grid,
  CircularProgress
} from '@material-ui/core'
import AddIcon from '@material-ui/icons/Add'
import CloseIcon from '@material-ui/icons/Close'
import { Alert } from '@material-ui/lab'
import { v4 as uuid } from 'uuid'
import fileDownload from 'js-file-download'

import CohortItem from './CohortItem/CohortItem'
import { CrfParameter, CRF_ATTRIBUTES } from '../../data/crfParameters'
import useStyles from './styles'
import api from 'services/apiJpyltime'

type RedcapExportProps = {
  patientIds: string[]
  open: boolean
  onClose: () => void
  cohortName?: string
}

export type ExportItem = CrfParameter & { id: string }

const RedcapExport = (props: RedcapExportProps): JSX.Element => {
  const [anonymization, setAnonymization] = useState<number>(2)
  const [isExportLoading, setIsExportLoading] = useState(false)

  const [crfAttribute, setCrfAttribute] = useState<ExportItem[]>([
    { ...CRF_ATTRIBUTES[0], id: uuid() },
    { ...CRF_ATTRIBUTES[1], id: uuid() },
    { ...CRF_ATTRIBUTES[2], id: uuid() }
  ])

  const [risk, setRisk] = useState(null)
  const [error, setError] = useState(null)

  const handleAnonymization = (event: React.ChangeEvent<{ value: unknown }>) => {
    setAnonymization(event.target.value as number)
  }

  const handleAddButton = () => {
    const tmp = [...crfAttribute]
    tmp.push({ ...CRF_ATTRIBUTES[0], id: uuid() })
    setCrfAttribute(tmp)
  }

  const exportCSV = () => {
    setIsExportLoading(true)
    api
      .post(`fhir2dataset`, {
        practitioner_id: '1',
        attributes: [],
        patient_ids: []
      })
      .then((response) => {
        fileDownload(response.data, 'cohortExport.csv')
        setIsExportLoading(false)
      })
  }
  const removeItem = (item: ExportItem) => {
    const idx = crfAttribute.findIndex(({ id }) => id === item.id)
    const tmp = [...crfAttribute]
    idx >= 0 && tmp.splice(idx, 1)
    setCrfAttribute(tmp)
  }
  const handleChangeItem = (item: ExportItem) => {
    const idx = crfAttribute.findIndex(({ id }) => id === item.id)
    const tmp = [...crfAttribute]
    idx >= 0 && tmp.splice(idx, 1, item)
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
    >
      <DialogTitle id="simple-dialog-title" disableTypography>
        <Typography variant="h1">Exporter la cohorte</Typography>
      </DialogTitle>
      <DialogContent>
        <Grid container direction="column" spacing={4}>
          <Grid item>
            <div>
              <Typography variant="h5" gutterBottom>
                Mode d'export
              </Typography>
              <Select value={anonymization} variant="outlined" onChange={handleAnonymization}>
                <MenuItem value={0} disabled>
                  Nominatif
                </MenuItem>
                <MenuItem value={1} disabled>
                  Anonymisé
                </MenuItem>
                <MenuItem value={2} disabled>
                  Pseudonymisé
                </MenuItem>
              </Select>
            </div>
          </Grid>
          <Grid item>
            <div>
              <Typography variant="h5" gutterBottom>
                Sélectionner les variables à exporter
              </Typography>
              <TableContainer component={Paper}>
                <Table aria-label="simple table">
                  <TableHead>
                    <TableRow>
                      <TableCell align="left">
                        <Tooltip title="Nom de l'attribut à exporter">
                          <span>Variable à exporter </span>
                        </Tooltip>
                      </TableCell>

                      <TableCell align="left" padding="none">
                        <Tooltip title="Rennomer la colonne pour l'export">
                          <span> Nom de colonne (personnalisable) </span>
                        </Tooltip>
                      </TableCell>
                      <TableCell align="right"></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {crfAttribute.map((item, index) => {
                      return <CohortItem item={item} key={index} onDelete={removeItem} onChange={handleChangeItem} />
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
              <Button
                className={classes.addButton}
                variant="outlined"
                onClick={handleAddButton}
                startIcon={<AddIcon />}
              >
                Ajouter une variable
              </Button>
            </div>
          </Grid>
          {/* <Grid item>
            <Alert severity="info">
              <Typography>
                L'export permet de télécharger un csv au format compatible avec <strong>eCRF</strong> (e.g. REDCap)
              </Typography>
              <Typography>
                Les attributs exportables donnent par défaut la valeur de l'attribut, en précisant le{' '}
                <i>Champ de recherche</i>, la valeur retournée est 1 si le patient possède ce champs 0 sinon.
              </Typography>
              <Typography>Vous pouvez choisir d'exporter un fichier brut, pseudonymisé ou anonymisé</Typography>
              <Typography>La pseudonymisation supprime les attributs identifiants</Typography>
              <Typography>
                L'anonymisation fournit un niveau de protection supplémentaire, transfomant les attributs qui, couplés à
                des informations extérieures, permettent d'identifier un individu.
              </Typography>
              <Typography>
                La <strong>K-anonymity</strong> assure que chaque individu inclus dans le dataset anonymisé est
                indistinguable d'au moins K-1 individus également inclus dans le dataset anonymisé (définissant une
                classe d'équivalence).
              </Typography>
              <Typography>
                La <strong>L-diversity</strong> assure que chaque classe d'équivalence contient au moins L valeurs
                distinctes d'attributs sensibles.
              </Typography>
              <Typography className={classes.importantText}>
                Lorsqu'un attribut a servi à construire la cohorte, il est conseillé de désactiver l'anonymisation
                associée.
              </Typography>
            </Alert>
          </Grid> */}
        </Grid>
      </DialogContent>
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
        <Button
          className={classes.exportButton}
          variant="contained"
          color="primary"
          onClick={exportCSV}
          disabled={isExportLoading}
        >
          {isExportLoading ? <CircularProgress size={20} /> : 'Export'}
        </Button>
      </div>
    </Dialog>
  )
}

export default RedcapExport
