import React, { useState } from 'react'

import {
  Grid,
  Typography,
  TextField,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Tooltip,
  IconButton,
  Button,
  Card
} from '@mui/material'

import InfoIcon from '@mui/icons-material/Info'
import { IndeterminateCheckBoxOutlined } from '@mui/icons-material'

import ExportTable from '../ExportTable'

import { fakeExportTable, fakeCohortList } from 'pages/ExportRequest/fakedata/fakeExportTable'

import { exportTablesInfo } from 'services/aphp/serviceExportCohort'

import useStyles from '../../styles'

const ExportForm: React.FC = () => {
  const initialState: any = {
    motif: '',
    conditions: false,
    tables: fakeExportTable.map<any>((table) => ({
      ...table,
      checked: table.name === 'person',
      fhir_filter: null,
      respect_table_relationships: true,
      count: 0
    }))
  }

  const { classes } = useStyles()
  const [error, setError] = useState<boolean>(false)
  const [oneFile, setOneFile] = useState<boolean>(false)
  const [exportTableSettings, setExportTableSettings] = useState<any>(initialState)
  const [exportTypeFile, setExportTypeFile] = useState<'csv' | 'xlsx'>('csv')

  const resetSelectedTables = () => {
    console.log('manelle veux reinitialiser les tables selectionne')
  }

  const handleSubmitPayload = () => {
    console.log('manelle veux submit le payload pour envoie au back', exportTableSettings)
  }

  const handleChangeExportTableSettings = (key: string, value: any) => {
    return console.log('manelle change des params de la table', key, value)
    // setExportExportSettings({ ...exportSettings, [key]: value })
  }

  exportTablesInfo()

  return (
    <Grid container flexDirection={'column'}>
      <Typography style={{ color: 'black' }}>
        Pour effectuer un export de données, veuillez renseigner un motif, sélectionner uniquement les tables que vous
        voulez exporter et accepter les conditions de l'entrepôt de données de santé (EDS). <br />
        Tous les champs sont obligatoires
      </Typography>

      <TextField
        id="motif"
        multiline
        autoFocus
        fullWidth
        minRows={3}
        maxRows={5}
        style={{ marginTop: '20px', backgroundColor: 'white' }}
        // value={settings.motif}
        // helperText="Le motif doit comporter au moins 10 caractères"
        // FormHelperTextProps={{ className: classes.helperText }}
        label="Motif de l'export"
        // variant="filled"
        // onChange={(e) => handleChangeSettings('motif', e.target.value)}
        error={error}
      />

      <Typography style={error ? { color: 'red' } : { color: 'black' }}>
        Le motif doit comporter au moins 10 caractères
      </Typography>

      <Grid container>
        <Typography variant="h2">Sélectionner la cohorte à exporter</Typography>
        <Select>
          {fakeCohortList.map((cohort, index) => (
            <MenuItem key={index + cohort.name} value={cohort.name}>
              {cohort.name}
            </MenuItem>
          ))}
        </Select>
      </Grid>

      <Grid>
        <FormControlLabel
          control={
            <Checkbox
              checked={oneFile}
              onClick={() => {
                setOneFile(!oneFile)
                resetSelectedTables()
              }}
            />
          }
          label={'Regrouper plusieurs tables en un seul fichier'}
        />
        <Tooltip
          title={
            <span>
              Cette fonctionnalité permet d'intégrer, dans chaque fichier généré correspondant à une table sélectionnée,
              les données patient et visites associées.
            </span>
          }
        >
          <InfoIcon fontSize="small" color="primary" style={{ marginLeft: 4 }} />
        </Tooltip>
      </Grid>

      <Grid container className={classes.referentielContainer}>
        <Typography variant="h3">Type de fichier : </Typography>
        <Select
          className={classes.select}
          style={{ height: 32 }}
          id="file-type-selector"
          value={exportTypeFile}
          onChange={(event) => setExportTypeFile(event.target.value as 'csv' | 'xlsx')}
        >
          <MenuItem value={'csv'}>{'Fichier csv'}</MenuItem>
          <MenuItem value={'xlsx'}>{'Fichier excel (.xlsx)'}</MenuItem>
        </Select>
      </Grid>

      <Grid item container alignItems="center" flexWrap="nowrap" pr="33px">
        <Grid item container>
          <Typography className={classes.dialogHeader} variant="h5">
            Tables exportées
          </Typography>

          <IconButton
            size="small"
            onClick={() =>
              window.open(
                `https://id.pages.data.aphp.fr/pfm/bigdata/eds-central-database/latest/data_catalog/`,
                '_blank'
              )
            }
          >
            <InfoIcon />
          </IconButton>
        </Grid>

        {
          /*!isChecked &&*/ <Grid item whiteSpace="nowrap">
            <FormControlLabel
              className={classes.selectAllTables}
              control={
                <Checkbox
                  color="secondary"
                  className={classes.selectAllExportTablesCheckbox}
                  // indeterminate={
                  //   settings.tables.filter((table) => table.checked).length !== settings.tables.length &&
                  //   settings.tables.filter((table) => table.checked).length > 0
                  // }
                  indeterminateIcon={<IndeterminateCheckBoxOutlined style={{ color: 'rgba(0,0,0,0.6)' }} />}
                  // checked={settings.tables.filter((table) => table.checked).length === settings.tables.length}
                  onChange={resetSelectedTables}
                />
              }
              label={
                'test'
                // settings.tables.filter((table) => table.checked).length === settings.tables.length
                //   ? 'Tout désélectionner'
                //   : 'Tout sélectionner'
              }
              labelPlacement="start"
            />
          </Grid>
        }
      </Grid>

      <Grid>
        <Card>
          {fakeExportTable.map((_exportTable: any, index: number) => (
            <ExportTable
              key={_exportTable.name + index}
              exportTable={_exportTable}
              exportTableSettings={exportTableSettings}
              setError={setError}
              setExportTableSettings={setExportTableSettings}
            />
          ))}
        </Card>
      </Grid>

      <Grid container gap="12px" pb="10px">
        <Typography className={classes.dialogHeader} variant="h5">
          Conditions de l'EDS
        </Typography>

        <Grid item container gap="8px" justifyContent={'space-between'}>
          <Typography variant="caption" className={classes.textBody2}>
            Le niveau d’habilitation dont vous disposez dans Cohort360 vous autorise à exporter des données à caractère
            personnel conformément à la réglementation et aux règles institutionnelles d’utilisation des données du
            Système d’Information clinique de l’AP-HP. Vous êtes garant des données exportées et vous vous engagez à :
          </Typography>
          <Grid item container>
            <Typography variant="caption" className={classes.conditionItem}>
              N’exporter, parmi les catégories de données accessibles, que les données strictement nécessaires et
              pertinentes au regard des objectifs de la recherche
            </Typography>

            <Typography variant="caption" className={classes.conditionItem}>
              A stocker temporairement les données extraites sur un répertoire dont l’accès est techniquement restreint
              aux personnes dûment habilitées et authentifiées, présentes dans les locaux du responsable de la
              recherche.
            </Typography>

            <Typography variant="caption" className={classes.conditionItem}>
              A ne pas utiliser du matériel ou des supports de stockage n’appartenant pas à l’AP-HP, à ne pas sortir les
              données des locaux de l’AP-HP ou sur un support amovible emporté hors AP-HP.
            </Typography>
            <Typography variant="caption" className={classes.conditionItem}>
              A procéder à la destruction de toutes données exportées, dès qu’il n’y a plus nécessité d’en disposer dans
              le cadre de la recherche dans le périmètre concerné.
            </Typography>

            <Typography variant="caption" className={classes.conditionItem}>
              A ne pas communiquer les données à des tiers non autorisés
            </Typography>

            <Typography variant="caption" className={classes.conditionItem}>
              A informer les chefs de services des UF de Responsabilité où ont été collectées les données exportées
            </Typography>

            <Typography variant="caption" className={classes.conditionItem}>
              A ne pas croiser les données avec tout autre jeu de données, sans autorisation auprès de la CNIL
            </Typography>
          </Grid>

          <FormControlLabel
            className={classes.selectAgreeConditions}
            control={
              <Checkbox
                color="secondary"
                className={classes.agreeCheckbox}
                name="conditions"
                // checked={settings.conditions}
                // onChange={() => handleChangeSettings('conditions', !settings.conditions)}
              />
            }
            labelPlacement="end"
            label={
              <Typography variant="caption" className={classes.textBody1}>
                Je reconnais avoir lu et j'accepte les conditions ci-dessus
              </Typography>
            }
          />
          <Button onClick={handleSubmitPayload}>Confirmer</Button>
        </Grid>
      </Grid>
    </Grid>
  )
}

export default ExportForm
