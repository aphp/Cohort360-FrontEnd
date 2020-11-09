import React, { useEffect, useState } from 'react'

import {
  Button,
  CircularProgress,
  Grid,
  IconButton,
  InputBase,
  Paper,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Typography
} from '@material-ui/core'
import Pagination from '@material-ui/lab/Pagination'

import PMSIFilters from '../../Filters/PMSIFilters/PMSIFilters'
import { ReactComponent as SearchIcon } from '../../../assets/icones/search.svg'
import { ReactComponent as FilterList } from '../../../assets/icones/filter.svg'

import { fetchPMSI } from '../../../services/patient'

import useStyles from './styles'
import { PMSIEntry } from 'types'
import { IClaim, ICondition, IProcedure } from '@ahryman40k/ts-fhir-types/lib/R4'

type PatientPMSITypes = {
  patientId: string
  diagnostic?: PMSIEntry<ICondition>[]
  diagnosticTotal: number
  ccam?: PMSIEntry<IProcedure>[]
  ccamTotal: number
  ghm?: PMSIEntry<IClaim>[]
  ghmTotal: number
  deidentifiedBoolean: boolean
}
const PatientPMSI: React.FC<PatientPMSITypes> = ({
  patientId,
  diagnostic,
  diagnosticTotal,
  ccam,
  ccamTotal,
  ghm,
  ghmTotal,
  deidentifiedBoolean
}) => {
  const classes = useStyles()
  const [selectedTab, selectTab] = useState<'CIM10' | 'CCAM' | 'GHM'>('CIM10')
  // TODO aphp: changed any to something more detailed
  const [data, setData] = useState<PMSIEntry<IClaim | ICondition | IProcedure>[] | undefined>([])
  const [loadingStatus, setLoadingStatus] = useState(false)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [searchInput, setSearchInput] = useState('')
  const [open, setOpen] = useState(false)
  const [nda, setNda] = useState('')
  const [code, setCode] = useState('')
  const [startDate, setStartDate] = useState<string | undefined>(undefined)
  const [endDate, setEndDate] = useState<string | undefined>(undefined)

  const documentLines = 20 // Number of desired lines in the document array

  const handleChangePage = (event?: React.ChangeEvent<unknown>, value?: number) => {
    setPage(value ? value : 1)
    setLoadingStatus(true)
    fetchPMSI(true, value ? value : 1, patientId, selectedTab, searchInput, nda, code)
      .then((pmsiResp) => {
        setData(pmsiResp?.pmsiData ?? [])
        setTotal(pmsiResp?.pmsiTotal ?? 0)
      })
      .catch((error) => console.log(error))
      .then(() => setLoadingStatus(false))
  }

  const handleOpenDialog = () => {
    setOpen(true)
  }

  const handleCloseDialog = () => {
    setOpen(false)
    handleChangePage()
  }

  const handleChangeSearchInput = (event: { target: { value: React.SetStateAction<string> } }) => {
    setSearchInput(event.target.value)
  }

  const onSearchPMSI = async () => {
    handleChangePage()
  }

  const onKeyDown = async (e: { keyCode: number; preventDefault: () => void }) => {
    if (e.keyCode === 13) {
      e.preventDefault()
      onSearchPMSI()
    }
  }

  useEffect(() => {
    setPage(1)
    setSearchInput('')
    switch (selectedTab) {
      case 'CIM10':
        setData(diagnostic ?? [])
        setTotal(diagnosticTotal ?? 0)
        break
      case 'CCAM':
        setData(ccam ?? [])
        setTotal(ccamTotal ?? 0)
        break
      case 'GHM':
        setData(ghm ?? [])
        setTotal(ghmTotal ?? 0)
        break
      default:
        setData([])
        break
    }
  }, [patientId, selectedTab]) // eslint-disable-line

  return (
    <Grid container item xs={11} justify="flex-end" className={classes.documentTable}>
      <Grid item container justify="space-between" alignItems="center">
        <Tabs
          classes={{
            root: classes.root,
            indicator: classes.indicator
          }}
          value={selectedTab}
          onChange={(event, value) => selectTab(value)}
        >
          <Tab
            classes={{ selected: classes.selected }}
            className={classes.tabTitle}
            label="Diagnostics CIM10"
            value="CIM10"
          />
          <Tab classes={{ selected: classes.selected }} className={classes.tabTitle} label="Actes CCAM" value="CCAM" />
          <Tab classes={{ selected: classes.selected }} className={classes.tabTitle} label="GHM" value="GHM" />
        </Tabs>
        <Typography variant="button">
          {total || 0} /{' '}
          {selectedTab === 'CIM10'
            ? `${diagnosticTotal ?? 0} diagnostic(s)`
            : selectedTab === 'CCAM'
            ? `${ccamTotal} acte(s)`
            : `${ghmTotal} GHM`}
        </Typography>
        <div className={classes.documentButtons}>
          <Grid item container xs={10} alignItems="center" className={classes.searchBar}>
            <InputBase
              placeholder="Rechercher"
              className={classes.input}
              value={searchInput}
              onChange={handleChangeSearchInput}
              onKeyDown={onKeyDown}
            />
            <IconButton type="submit" aria-label="search" onClick={onSearchPMSI}>
              <SearchIcon fill="#ED6D91" height="15px" />
            </IconButton>
          </Grid>
          <Button
            variant="contained"
            disableElevation
            startIcon={<FilterList height="15px" fill="#FFF" />}
            className={classes.searchButton}
            onClick={handleOpenDialog}
          >
            Filtrer
          </Button>
          <PMSIFilters
            open={open}
            onClose={() => setOpen(false)}
            onSubmit={handleCloseDialog}
            nda={nda}
            onChangeNda={setNda}
            code={code}
            onChangeCode={setCode}
            startDate={startDate}
            onChangeStartDate={setStartDate}
            endDate={endDate}
            onChangeEndDate={setEndDate}
            deidentified={deidentifiedBoolean}
          />
        </div>
      </Grid>
      {loadingStatus ? (
        <Grid container justify="center">
          <CircularProgress />
        </Grid>
      ) : (
        <TableContainer component={Paper}>
          <Table className={classes.table} aria-label="simple table">
            <TableHead className={classes.tableHead}>
              <TableRow>
                <TableCell align="left" className={classes.tableHeadCell}>
                  {deidentifiedBoolean ? 'ID Technique Visite' : 'NDA'}
                </TableCell>
                <TableCell align="left" className={classes.tableHeadCell}>
                  Codage le
                </TableCell>
                <TableCell align="center" className={classes.tableHeadCell}>
                  Code
                </TableCell>
                <TableCell align="center" className={classes.tableHeadCell}>
                  Libellé
                </TableCell>
                {selectedTab === 'CIM10' && (
                  <TableCell align="center" className={classes.tableHeadCell}>
                    Type
                  </TableCell>
                )}
                <TableCell align="center" className={classes.tableHeadCell}>
                  Unité exécutrice
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data ? (
                <>
                  {data.map((row) => {
                    return (
                      <TableRow className={classes.tableBodyRows} key={row.id}>
                        <TableCell align="left">{row.NDA ?? 'Inconnu'}</TableCell>
                        <TableCell align="left">
                          {row.resourceType === 'Condition' &&
                            row.recordedDate &&
                            (new Date(row.recordedDate).toLocaleDateString('fr-FR') ?? 'Date inconnue')}
                          {row.resourceType === 'Claim' &&
                            row.created &&
                            (new Date(row.created).toLocaleDateString('fr-FR') ?? 'Date inconnue')}
                          {row.resourceType === 'Procedure' &&
                            row.performedDateTime &&
                            (new Date(row.performedDateTime).toLocaleDateString('fr-FR') ?? 'Date inconnue')}
                        </TableCell>
                        <TableCell align="center">
                          {row.resourceType === 'Claim'
                            ? row.diagnosis?.[0].packageCode?.coding?.[0].code
                            : // @ts-ignore TODO: There is no class member in Conditon or Procedure FHIR types
                              row.class?.code || row.code?.coding?.[0].code}
                        </TableCell>
                        <TableCell align="center" className={classes.libelle}>
                          {row.resourceType === 'Claim'
                            ? row.diagnosis?.[0].packageCode?.coding?.[0].display
                            : // @ts-ignore TODO: There is no class member in Conditon or Procedure FHIR types
                              row.class?.code || row.code?.coding?.[0].display}
                        </TableCell>
                        {selectedTab === 'CIM10' && (
                          <TableCell align="center">{row.extension ? row.extension[0].valueString : '-'}</TableCell>
                        )}
                        <TableCell align="center">{row.serviceProvider ?? 'Non renseigné'}</TableCell>
                      </TableRow>
                    )
                  })}
                </>
              ) : (
                <Grid container justify="center">
                  <Typography variant="button">Aucun document à afficher</Typography>
                </Grid>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      <Pagination
        className={classes.pagination}
        count={Math.ceil(total / documentLines)}
        shape="rounded"
        onChange={handleChangePage}
        page={page}
      />
    </Grid>
  )
}
export default PatientPMSI
