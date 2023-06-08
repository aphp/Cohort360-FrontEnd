import React from 'react'

import { Button, Grid, IconButton, InputBase, TextField, Typography } from '@mui/material'
import { Autocomplete } from '@mui/lab'

import { ReactComponent as FilterList } from 'assets/icones/filter.svg'
import { ReactComponent as SearchIcon } from 'assets/icones/search.svg'
import LockIcon from '@mui/icons-material/Lock'
import SortIcon from '@mui/icons-material/Sort'

import PatientFilters from 'components/Filters/PatientFilters/PatientFilters'
import SortDialog from 'components/Filters/SortDialog/SortDialog'
import MasterChips from 'components/MasterChips/MasterChips'

import { PatientFilters as PatientFiltersType, PatientGenderKind, SearchByTypes, Sort, VitalStatus } from 'types'

import { buildPatientFiltersChips } from 'utils/chips'

import useStyles from './styles'

type PatientSidebarHeaderTypes = {
  showFilterChip: boolean
  deidentified: boolean
  searchBy: string
  onChangeSelect: (searchBy: SearchByTypes) => void
  onClickFilterButton: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void
  open: boolean
  onCloseFilterDialog: () => void
  onSubmitDialog: () => void
  filters: PatientFiltersType
  onChangeFilters: (newFilters: PatientFiltersType) => void
  searchInput: string
  onChangeSearchInput: (event: { target: { value: React.SetStateAction<string> } }) => void
  onKeyDownSearchInput: (e: React.KeyboardEvent<HTMLTextAreaElement | HTMLInputElement>) => void
  onSearchPatient: () => void
  onCloseButtonClick: () => void
  onClickSortButton: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void
  openSort: boolean
  onCloseSort: () => void
  sort: Sort
  onChangeSort: (sort: Sort) => void
}
const PatientSidebarHeader: React.FC<PatientSidebarHeaderTypes> = (props) => {
  const { classes } = useStyles()

  const _onChangeSelect = (
    event: React.ChangeEvent<{}>,
    value: {
      label: string
      code: SearchByTypes
    } | null
  ) => {
    props.onChangeSelect(value?.code as SearchByTypes)
  }

  if (props.deidentified) {
    return (
      <div className={classes.root}>
        <Grid container item justifyContent="flex-end" className={classes.margin}>
          <Button
            variant="contained"
            disableElevation
            startIcon={<FilterList height="15px" fill="#FFF" />}
            className={classes.buttons}
            onClick={props.onClickFilterButton}
          >
            Filtrer
          </Button>
          <PatientFilters
            open={props.open}
            onClose={props.onCloseFilterDialog}
            onSubmit={props.onSubmitDialog}
            filters={props.filters}
            onChangeFilters={props.onChangeFilters}
          />
        </Grid>
        <Grid container alignItems="center">
          <LockIcon className={classes.lockIcon} />
          <Typography variant="h6">Recherche désactivée en mode pseudonymisé.</Typography>
        </Grid>
      </div>
    )
  }

  const searchByNames = [
    { label: 'Tous les champs', code: SearchByTypes.text },
    { label: 'Nom', code: SearchByTypes.family },
    { label: 'Prénom', code: SearchByTypes.given },
    { label: 'IPP', code: SearchByTypes.identifier }
  ]

  const handleDeleteChip = (filterName: string) => {
    switch (filterName) {
      case 'gender':
        // @ts-ignore
        props.onChangeFilters((prevFilters) => ({
          ...prevFilters,
          gender: PatientGenderKind._unknown
        }))
        break
      case 'birthdates':
        // @ts-ignore
        props.onChangeFilters((prevFilters) => ({
          ...prevFilters,
          birthdatesRanges: ['', '']
        }))
        break
      case 'vitalStatus':
        // @ts-ignore
        props.onChangeFilters((prevFilters) => ({
          ...prevFilters,
          vitalStatus: VitalStatus.all
        }))
        break
    }
  }

  return (
    <div className={classes.root}>
      <Typography variant="button">Rechercher par :</Typography>
      <Grid container item justifyContent="space-between" alignItems="center">
        <Autocomplete
          options={searchByNames}
          getOptionLabel={(option) => option.label}
          value={searchByNames.find((value) => value.code === props.searchBy)}
          renderInput={(params) => <TextField {...params} variant="standard" />}
          onChange={_onChangeSelect}
          className={classes.autocomplete}
        />
        <Grid item container xs={7} alignItems="center" className={classes.searchBar}>
          <InputBase
            placeholder="Rechercher"
            className={classes.input}
            value={props.searchInput}
            onChange={props.onChangeSearchInput}
            onKeyDown={props.onKeyDownSearchInput}
          />
          <IconButton type="submit" aria-label="search" onClick={props.onSearchPatient}>
            <SearchIcon fill="#ED6D91" height="15px" />
          </IconButton>
        </Grid>
      </Grid>
      <Grid container item justifyContent="space-between">
        <Button
          variant="contained"
          disableElevation
          startIcon={<FilterList height="15px" fill="#FFF" />}
          className={classes.buttons}
          onClick={props.onClickFilterButton}
        >
          Filtrer
        </Button>
        <PatientFilters
          open={props.open}
          onClose={props.onCloseFilterDialog}
          onSubmit={props.onSubmitDialog}
          filters={props.filters}
          onChangeFilters={props.onChangeFilters}
        />
        <Button
          variant="contained"
          disableElevation
          startIcon={<SortIcon height="15px" fill="#FFF" />}
          className={classes.buttons}
          onClick={props.onClickSortButton}
        >
          Trier
        </Button>
        <SortDialog
          open={props.openSort}
          onClose={props.onCloseSort}
          sort={props.sort}
          onChangeSort={props.onChangeSort}
        />
      </Grid>
      <MasterChips chips={buildPatientFiltersChips(props.filters, handleDeleteChip)} />
    </div>
  )
}

export default PatientSidebarHeader
