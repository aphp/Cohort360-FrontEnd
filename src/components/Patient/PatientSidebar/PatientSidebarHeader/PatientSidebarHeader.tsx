import React from 'react'
import moment from 'moment'

import { Button, Chip, Grid, IconButton, InputBase, TextField, Typography } from '@material-ui/core'

import { ReactComponent as FilterList } from 'assets/icones/filter.svg'
import { ReactComponent as SearchIcon } from 'assets/icones/search.svg'
import LockIcon from '@material-ui/icons/Lock'
import SortIcon from '@material-ui/icons/Sort'

import PatientFilters from 'components/Filters/PatientFilters/PatientFilters'
import SortDialog from 'components/Filters/SortDialog/SortDialog'

import { PatientGenderKind } from '@ahryman40k/ts-fhir-types/lib/R4'
import { PatientFilters as PatientFiltersType, SearchByTypes, Sort, VitalStatus } from 'types'

import useStyles from './styles'
import { Autocomplete } from '@material-ui/lab'
import { ageName } from 'utils/age'

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
  onKeyDownSearchInput: (e: { keyCode: number; preventDefault: () => void }) => void
  onSearchPatient: () => void
  onCloseButtonClick: () => void
  onClickSortButton: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void
  openSort: boolean
  onCloseSort: () => void
  onSubmitSort: () => void
  sort: Sort
  onChangeSort: (sort: Sort) => void
}
const PatientSidebarHeader: React.FC<PatientSidebarHeaderTypes> = (props) => {
  const classes = useStyles()

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
          birthdates: [moment().subtract(130, 'years').format('YYYY-MM-DD'), moment().format('YYYY-MM-DD')]
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

  const genderName = () => {
    switch (props.filters.gender) {
      case PatientGenderKind._female:
        return 'Genre: Femmes'
      case PatientGenderKind._male:
        return 'Genre: Hommes'
      case PatientGenderKind._other:
        return 'Genre: Autre'
    }
  }

  const vitalStatusName = () => {
    switch (props.filters.vitalStatus) {
      case VitalStatus.alive:
        return 'Patients vivants'
      case VitalStatus.deceased:
        return 'Patients décédés'
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
          renderInput={(params) => <TextField {...params} />}
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
          onSubmit={props.onSubmitSort}
          sort={props.sort}
          onChangeSort={props.onChangeSort}
        />
      </Grid>
      <Grid className={classes.filterChipsGrid}>
        {props.showFilterChip && props.filters.gender !== PatientGenderKind._unknown && (
          <Chip
            className={classes.chips}
            label={genderName()}
            onDelete={() => handleDeleteChip('gender')}
            color="primary"
            variant="outlined"
          />
        )}
        {props.showFilterChip && props.filters.vitalStatus !== VitalStatus.all && (
          <Chip
            className={classes.chips}
            label={vitalStatusName()}
            onDelete={() => handleDeleteChip('vitalStatus')}
            color="primary"
            variant="outlined"
          />
        )}
        {props.showFilterChip && props.filters.birthdates && ageName(props.filters.birthdates) && (
          <Chip
            className={classes.chips}
            label={ageName(props.filters.birthdates)}
            onDelete={() => handleDeleteChip('birthdates')}
            color="primary"
            variant="outlined"
          />
        )}
      </Grid>
    </div>
  )
}

export default PatientSidebarHeader
