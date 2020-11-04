import React from 'react'
import IconButton from '@material-ui/core/IconButton'
import useStyles from './styles'
import PropTypes from 'prop-types'
import InputBase from '@material-ui/core/InputBase'
import SvgIcon from '@material-ui/core/SvgIcon'
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'
import Select from '@material-ui/core/Select'
import MenuItem from '@material-ui/core/MenuItem'
import Button from '@material-ui/core/Button'

import PatientFilters from '../../../Filters/PatientFilters/PatientFilters'

import { ReactComponent as FilterList } from '../../../../assets/icones/filter.svg'
import { ReactComponent as ArrowRightIcon } from '../../../../assets/icones/angle-right.svg'
import { ReactComponent as SearchIcon } from '../../../../assets/icones/search.svg'

const PatientSidebarHeader = (props) => {
  const classes = useStyles()

  return (
    <div className={classes.root}>
      <Typography variant="h6">Rechercher par :</Typography>
      <Grid container item>
        <Grid container item xs={6}>
          <Select value={props.searchBy} onChange={props.onChangeSelect}>
            <MenuItem value="_text">Tous les champs</MenuItem>
            <MenuItem value="family">Nom</MenuItem>
            <MenuItem value="given">Prénom</MenuItem>
            <MenuItem value="identifier">IPP</MenuItem>
          </Select>
        </Grid>
        <Grid container item xs={6} justify="flex-end">
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
      <Grid container item alignItems="center">
        <Grid
          item
          container
          xs={10}
          alignItems="center"
          className={classes.searchBar}
        >
          <InputBase
            placeholder="Rechercher"
            className={classes.input}
            value={props.searchInput}
            onChange={props.onChangeSearchInput}
            onKeyDown={props.onKeyDownSearchInput}
          />
          <IconButton
            type="submit"
            aria-label="search"
            onClick={props.onSearchPatient}
          >
            <SearchIcon fill="#ED6D91" height="15px" />
          </IconButton>
        </Grid>
        <IconButton onClick={props.onCloseButtonClick} aria-label="Fermer">
          <SvgIcon
            component={ArrowRightIcon}
            viewBox="0 0 192 512"
            htmlColor="#5BC5F2"
          />
        </IconButton>
      </Grid>
    </div>
  )
}

PatientSidebarHeader.propTypes = {
  onCloseButtonClick: PropTypes.func.isRequired,
  searchInput: PropTypes.string,
  onChangeSearchInput: PropTypes.func,
  onKeyDownSearchInput: PropTypes.func,
  searchBy: PropTypes.string,
  onChangeSelect: PropTypes.func,
  onSearchPatient: PropTypes.func,
  open: PropTypes.bool,
  onClickFilterButton: PropTypes.func,
  onCloseFilterDialog: PropTypes.func,
  onSubmitDialog: PropTypes.func,
  gender: PropTypes.string,
  onChangeGender: PropTypes.func,
  age: PropTypes.array,
  onChangeAge: PropTypes.func,
  vitalStatus: PropTypes.string,
  onChangeVitalStatus: PropTypes.func
}

export default PatientSidebarHeader
