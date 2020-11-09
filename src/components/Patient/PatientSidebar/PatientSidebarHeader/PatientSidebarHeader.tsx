import React from 'react'

import { Button, Grid, IconButton, InputBase, MenuItem, Select, Typography } from '@material-ui/core'

import { ReactComponent as FilterList } from '../../../../assets/icones/filter.svg'
import { ReactComponent as SearchIcon } from '../../../../assets/icones/search.svg'
import LockIcon from '@material-ui/icons/Lock'

import PatientFilters from '../../../Filters/PatientFilters/PatientFilters'

import { PatientGenderKind } from '@ahryman40k/ts-fhir-types/lib/R4'
import { SearchByTypes, VitalStatus } from 'types'

import useStyles from './styles'

type PatientSidebarHeaderTypes = {
  deidentified: boolean
  searchBy: string
  onChangeSelect: (searchBy: SearchByTypes) => void
  onClickFilterButton: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void
  open: boolean
  onCloseFilterDialog: () => void
  onSubmitDialog: () => void
  gender: PatientGenderKind
  onChangeGender: (gender: PatientGenderKind) => void
  age: [number, number]
  onChangeAge: (newAge: [number, number]) => void
  vitalStatus: VitalStatus
  onChangeVitalStatus: (status: VitalStatus) => void
  searchInput: string
  onChangeSearchInput: (event: { target: { value: React.SetStateAction<string> } }) => void
  onKeyDownSearchInput: (e: { keyCode: number; preventDefault: () => void }) => void
  onSearchPatient: () => void
  onCloseButtonClick: () => void
}
const PatientSidebarHeader: React.FC<PatientSidebarHeaderTypes> = (props) => {
  const classes = useStyles()

  const _onChangeSelect = (
    event: React.ChangeEvent<{
      name?: string | undefined
      value: unknown
    }>
  ) => {
    props.onChangeSelect(event.target.value as SearchByTypes)
  }

  if (props.deidentified) {
    return (
      <div className={classes.root}>
        <Grid container item justify="flex-end" className={classes.margin}>
          <Button
            variant="contained"
            disableElevation
            startIcon={<FilterList height="15px" fill="#FFF" />}
            className={classes.searchButton}
            onClick={props.onClickFilterButton}
          >
            Filtrer
          </Button>
          <PatientFilters
            open={props.open}
            onClose={props.onCloseFilterDialog}
            onSubmit={props.onSubmitDialog}
            gender={props.gender}
            onChangeGender={props.onChangeGender}
            age={props.age}
            onChangeAge={props.onChangeAge}
            vitalStatus={props.vitalStatus}
            onChangeVitalStatus={props.onChangeVitalStatus}
          />
        </Grid>
        <Grid container alignItems="center">
          <LockIcon className={classes.lockIcon} />
          <Typography variant="h6">Recherche désactivée en mode pseudonymisé.</Typography>
        </Grid>
      </div>
    )
  }

  return (
    <div className={classes.root}>
      <Grid container item>
        <Grid container item xs={6}>
          <Typography variant="h6">Rechercher par :</Typography>
        </Grid>
        <Grid container item xs={6} justify="center">
          <Select value={props.searchBy} onChange={_onChangeSelect}>
            <MenuItem value={SearchByTypes.text}>Tous les champs</MenuItem>
            <MenuItem value={SearchByTypes.family}>Nom</MenuItem>
            <MenuItem value={SearchByTypes.given}>Prénom</MenuItem>
            <MenuItem value={SearchByTypes.identifier}>IPP</MenuItem>
          </Select>
        </Grid>
      </Grid>
      <Grid container item alignItems="center">
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
        <Grid container item xs={5} justify="flex-end" className={classes.margin}>
          <Button
            variant="contained"
            disableElevation
            startIcon={<FilterList height="15px" fill="#FFF" />}
            className={classes.searchButton}
            onClick={props.onClickFilterButton}
          >
            Filtrer
          </Button>
          <PatientFilters
            open={props.open}
            onClose={props.onCloseFilterDialog}
            onSubmit={props.onSubmitDialog}
            gender={props.gender}
            onChangeGender={props.onChangeGender}
            age={props.age}
            onChangeAge={props.onChangeAge}
            vitalStatus={props.vitalStatus}
            onChangeVitalStatus={props.onChangeVitalStatus}
          />
        </Grid>
      </Grid>
    </div>
  )
}

export default PatientSidebarHeader
