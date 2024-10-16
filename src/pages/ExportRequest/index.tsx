import React, { useEffect, useState } from 'react'
import {
  Button,
  CssBaseline,
  DialogContentText,
  FormGroup,
  Grid,
  MenuItem,
  Select,
  TextField,
  Typography
} from '@mui/material'

import { useAppSelector } from 'state'
import apiDatamodel from 'services/apiDatamodel'

import sideBarTransition from 'styles/sideBarTransition'
import HeaderPage from 'components/ui/HeaderPage'

const ExportTable = () => {
  return <>Table d'export</>
}

const ExportForm: React.FC = () => {
  const [search, setSearch] = useState<string>('')
  const [response, setResponse] = useState<any>()
  const [compatibleTable, setCompatibleTable] = useState<string[]>([])
  const [error, setError] = useState<boolean>(false)
  const api = apiDatamodel

  const onsubmit = async () => {
    setResponse(await api.get(`/models`))
    console.log('manelle search', search)
  }

  const submitCompatibleTable = (arg1: string[]) => {
    const l = arg1
    return l
  }

  const hamiltonianPath = response?.data?.verifiedRelations?.[0].candidates
  const centralTable = response?.data?.verifiedRelations?.[1].candidates

  const fakeCohort = ['cohort1', 'cohort2', 'cohort3']

  useEffect(() => {
    console.log('manelle hamiltonianPath', hamiltonianPath)
    console.log('manelle centralTable', centralTable)
    setCompatibleTable(submitCompatibleTable(['test']))
    console.log('manelle entre dans le useEffect')
  }, [response])

  console.log('manelle response', response)
  console.log('manelle compatibleTable', compatibleTable)
  // console.log('manelle search', search)

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
          {fakeCohort.map((cohort) => (
            <MenuItem key={cohort} value={cohort}>
              {cohort}
            </MenuItem>
          ))}
        </Select>
      </Grid>

      <ExportTable />
    </Grid>
  )
}

const ExportRequest = () => {
  const { classes, cx } = sideBarTransition()
  const openDrawer = useAppSelector((state) => state.drawer)

  return (
    <Grid
      container
      flexDirection={'column'}
      className={cx(classes.appBar, {
        [classes.appBarShift]: openDrawer
      })}
    >
      <Grid container justifyContent="center" alignItems="center">
        <CssBaseline />
        <Grid container item xs={11}>
          <HeaderPage id="export-form-title" title="Demande d'export" />
          <ExportForm />
        </Grid>
      </Grid>
    </Grid>
  )
}

export default ExportRequest
