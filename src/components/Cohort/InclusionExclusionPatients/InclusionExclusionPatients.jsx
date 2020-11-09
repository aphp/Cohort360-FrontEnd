import React, { useCallback, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useHistory } from 'react-router'
import {
  Grid,
  Paper,
  Typography,
  IconButton,
  Link,
  Dialog,
  ListItem,
  ListItemIcon,
  ListItemAvatar,
  Avatar,
  ListItemText,
  List,
  SvgIcon,
  Checkbox,
  Chip,
  ListItemSecondaryAction,
  ListSubheader,
  FormControlLabel,
  Button,
  Menu,
  MenuItem,
  CircularProgress
} from '@material-ui/core'
import AddIcon from '@material-ui/icons/Add'
import OtherGenderIcon from '@material-ui/icons/Wc'
import PropTypes from 'prop-types'

import useStyles from './styles'
import ScopeTree from '../../ScopeTree/ScopeTree'
import Research from '../../SavedResearch/ResearchCard'
import {
  addImportedPatients,
  excludePatients,
  includePatients,
  removeImportedPatients,
  removeExcludedPatients,
  updateCohort
} from '../../../state/exploredCohort'
import { getAgeArkhn } from '../../../utils/age'
import { ReactComponent as FemaleIcon } from '../../../assets/icones/venus.svg'
import { ReactComponent as MaleIcon } from '../../../assets/icones/mars.svg'

import { getPatientsFromPerimeter, getPatientsFromCohortId } from 'services/patient'
import { patchCohortMembers } from 'services/cohortCreation'

const PatientRow = ({ patient, selected, fromCohort, onClickCheckbox }) => {
  const classes = useStyles()
  const name = patient.name[0]
  const identifier = patient.identifier[0]
  const gender = patient.gender
  const isPatientDeceased = undefined !== patient.deceasedDateTime
  const birthDate = new Date(patient.birthDate)
  const deathDateOrToday = isPatientDeceased ? new Date(patient.deceasedDateTime) : new Date()
  const age = getAgeArkhn(birthDate, deathDateOrToday)
  const GenderIcon = (
    <SvgIcon
      component={gender === 'male' ? MaleIcon : gender === 'female' ? FemaleIcon : OtherGenderIcon}
      viewBox={gender === 'male' ? '0 0 380 500' : '0 0 300 500'}
      // fontSize="small"
      className={classes.SvgIcon}
    />
  )

  return (
    <ListItem className={fromCohort ? classes.cohortPatientListItem : null}>
      <ListItemIcon>{<Checkbox checked={selected} onClick={() => onClickCheckbox(patient.id)} />}</ListItemIcon>
      <ListItemAvatar>
        <Avatar>{GenderIcon}</Avatar>
      </ListItemAvatar>
      <ListItemText primary={`${name.given[0]} ${name.family}`} secondary={`${age} ans - ${identifier.value}`} />
      <ListItemSecondaryAction>
        <Chip
          label={isPatientDeceased ? 'Décédé' : 'Vivant'}
          classes={{
            root: isPatientDeceased ? classes.deceasedChip : classes.aliveChip
          }}
        />
      </ListItemSecondaryAction>
    </ListItem>
  )
}
PatientRow.propType = {
  patient: PropTypes.object.isRequired,
  selected: PropTypes.bool.isRequired,
  fromCohort: PropTypes.bool,
  onClickCheckbox: PropTypes.func.isRequired
}

const ImportPatientMenu = ({ anchorEl, handleClose, setOpenModal, setModalContent }) => {
  const dispatch = useDispatch()
  const practitioner = useSelector((state) => state.practitioner)
  const cohort = useSelector((state) => state.exploredCohort)

  const classes = useStyles()

  const importPatientsFromPerimeter = useCallback(async (providers) => {
    const patients = await getPatientsFromPerimeter(providers)
    dispatch(addImportedPatients(patients))
  }, []) //eslint-disable-line

  const importPatientsFromCohortId = useCallback(async (cohortId) => {
    const patients = await getPatientsFromCohortId(cohortId)
    dispatch(addImportedPatients(patients))
  }, []) //eslint-disable-line

  return anchorEl !== undefined ? (
    <Menu anchorEl={anchorEl} keepMounted open={Boolean(anchorEl)} onClose={handleClose}>
      <MenuItem
        onClick={() => {
          dispatch(addImportedPatients(practitioner.patients))
          handleClose()
        }}
      >
        Tous mes patients
      </MenuItem>
      <MenuItem
        onClick={() => {
          setModalContent(
            <ScopeTree
              title={'Choisir un périmètre'}
              submit={(selectedItems) => {
                importPatientsFromPerimeter(selectedItems)
                setOpenModal(false)
              }}
            />
          )
          setOpenModal(true)
          handleClose()
        }}
      >
        Choisir un périmètre
      </MenuItem>
      <MenuItem
        onClick={() => {
          setModalContent(
            <Research
              simplified={true}
              onClickRow={(row) => {
                importPatientsFromCohortId(row.researchId)
                setOpenModal(false)
              }}
              filteredIds={[cohort.cohort.id]}
            />
          )
          setOpenModal(true)
          handleClose()
        }}
      >
        Importer d'une autre cohorte
      </MenuItem>
    </Menu>
  ) : (
    <>
      <Link
        component="button"
        underline="always"
        classes={{ root: classes.buttonLink }}
        onClick={() => {
          dispatch(addImportedPatients(practitioner.patients))
        }}
      >
        Tous mes patients
      </Link>
      <Link
        component="button"
        underline="always"
        classes={{ root: classes.buttonLink }}
        onClick={() => {
          setModalContent(
            <ScopeTree
              title={'Choisir un périmètre'}
              submit={(selectedItems) => {
                importPatientsFromPerimeter(selectedItems)
                setOpenModal(false)
              }}
            />
          )
          setOpenModal(true)
        }}
      >
        Choisir un périmètre
      </Link>
      <Link
        component="button"
        underline="always"
        classes={{ root: classes.buttonLink }}
        onClick={() => {
          setModalContent(
            <Research
              simplified={true}
              onClickRow={(row) => {
                importPatientsFromCohortId(row.researchId)
                setOpenModal(false)
              }}
              filteredIds={[cohort.cohort.id]}
            />
          )
          setOpenModal(true)
        }}
      >
        Importer d'une autre cohorte
      </Link>
    </>
  )
}
ImportPatientMenu.propType = {
  anchorEl: PropTypes.element,
  handleClose: PropTypes.func,
  setOpenModal: PropTypes.func,
  setModalContent: PropTypes.func.isRequired
}

const InclusionExclusionContainer = ({ title, content, setOpenModal, setModalContent }) => {
  const classes = useStyles()

  const [anchorEl, setAnchorEl] = useState(null)

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  return (
    <Paper classes={{ root: classes.subContainer }}>
      <div className={classes.header}>
        <Typography variant="h5" classes={{ root: classes.headerTitle }}>
          {title}
        </Typography>
        {setOpenModal && setModalContent && (
          <>
            <IconButton classes={{ root: classes.iconButtonRoot }} onClick={handleClick}>
              <AddIcon />
            </IconButton>
            <ImportPatientMenu
              anchorEl={anchorEl}
              handleClose={handleClose}
              setOpenModal={setOpenModal}
              setModalContent={setModalContent}
            />
          </>
        )}
      </div>
      <div className={classes.content}>{content}</div>
    </Paper>
  )
}
InclusionExclusionContainer.propType = {
  title: PropTypes.string.isRequired,
  content: PropTypes.string.isRequired,
  setOpenModal: PropTypes.func,
  setModalContent: PropTypes.func
}

const PatientSelectableList = ({ patients, cohortPatients, onChangeSelection, selectedPatients }) => {
  const classes = useStyles()

  const allPatients = [...patients, ...(cohortPatients || [])]

  const handleSelection = (patientId) => {
    let newSelectedList = []
    if (selectedPatients.find((p) => p.id === patientId)) {
      newSelectedList = selectedPatients.filter((p) => p.id !== patientId)
    } else {
      newSelectedList = [...selectedPatients, allPatients.find((p) => p.id === patientId)]
    }
    onChangeSelection(newSelectedList)
  }

  const handleSelectAll = () => {
    if (selectedPatients.length === allPatients.length) {
      onChangeSelection([])
    } else {
      onChangeSelection(allPatients)
    }
  }

  return (
    <List
      classes={{ root: classes.patientListRoot }}
      subheader={
        <ListSubheader classes={{ root: classes.patientListHeaderContainer }}>
          <FormControlLabel
            control={<Checkbox onClick={handleSelectAll} checked={selectedPatients.length === allPatients.length} />}
            label="Tout sélectionner"
          />
          <Typography classes={{ root: classes.patientListHeaderLabel }}>{`${allPatients.length} patients`}</Typography>
        </ListSubheader>
      }
    >
      {cohortPatients &&
        cohortPatients.map((patient) => {
          const isPatientSelected = !!selectedPatients.find((p) => p && p.id === patient.id)
          return (
            <PatientRow
              patient={patient}
              key={patient.id}
              onClickCheckbox={handleSelection}
              selected={isPatientSelected}
              fromCohort={true}
            />
          )
        })}
      {patients.map((patient) => {
        const isPatientSelected = undefined !== selectedPatients.find((p) => p && p.id === patient.id)
        return (
          <PatientRow
            patient={patient}
            key={patient.id}
            onClickCheckbox={handleSelection}
            selected={isPatientSelected}
          />
        )
      })}
    </List>
  )
}

const ImportPatientsContent = ({ setModalContent, setOpenModal }) => {
  const dispatch = useDispatch()
  const classes = useStyles()

  const importedPatients = useSelector((state) => state.exploredCohort.importedPatients)

  const [selectedPatients, setSelectedPatients] = useState([])

  return (
    <>
      {importedPatients.length === 0 ? (
        <ImportPatientMenu setModalContent={setModalContent} setOpenModal={setOpenModal} />
      ) : (
        <>
          <PatientSelectableList
            patients={importedPatients}
            selectedPatients={selectedPatients}
            onChangeSelection={setSelectedPatients}
          />
          <div className={classes.footerButtonContainer}>
            <Button
              disabled={selectedPatients.length === 0}
              variant="contained"
              onClick={() => {
                dispatch(includePatients(selectedPatients))
                setSelectedPatients([])
              }}
            >
              Inclure la sélection
            </Button>
            <Button
              disabled={selectedPatients.length === 0}
              variant="contained"
              onClick={() => {
                dispatch(removeImportedPatients(selectedPatients))
                setSelectedPatients([])
              }}
            >
              Supprimer la sélection
            </Button>
          </div>
        </>
      )}
    </>
  )
}

ImportPatientsContent.propType = {
  setOpenModal: PropTypes.func.isRequired,
  setModalContent: PropTypes.func.isRequired
}

const InclusionExclusionContent = ({ include }) => {
  const dispatch = useDispatch()
  const classes = useStyles()
  const patients = useSelector((state) =>
    include ? state.exploredCohort.includedPatients : state.exploredCohort.excludedPatients
  )
  const originalPatients = useSelector((state) => (include ? state.exploredCohort.originalPatients : []))
  const [selectedPatients, setSelectedPatients] = useState([])
  return (
    <>
      {patients.length + originalPatients.length === 0 ? (
        <Typography>Pas de patients.</Typography>
      ) : (
        <>
          <PatientSelectableList
            patients={patients}
            cohortPatients={originalPatients}
            selectedPatients={selectedPatients}
            onChangeSelection={setSelectedPatients}
          />
          <div className={classes.footerButtonContainer}>
            <Button
              disabled={selectedPatients.length === 0}
              variant="contained"
              onClick={() => {
                if (include) {
                  dispatch(excludePatients(selectedPatients))
                } else {
                  dispatch(removeExcludedPatients(selectedPatients))
                }
                setSelectedPatients([])
              }}
            >
              {include ? 'Exclure la sélection' : 'Supprimer la sélection'}
            </Button>
          </div>
        </>
      )}
    </>
  )
}
InclusionExclusionContent.propType = {
  include: PropTypes.bool.isRequired
}

const InclusionExclusionPatientsPanel = ({ cohort, loading }) => {
  const classes = useStyles()
  const history = useHistory()
  const dispatch = useDispatch()

  const [openModal, setOpenModal] = useState(false)
  const [modalContent, setModalContent] = useState(null)

  //eslint-disable-next-line
  const onSave = useCallback(async () => {
    const newMembers = patchCohortMembers(cohort)
    dispatch(updateCohort(newMembers))
    history.push(`/cohort/${cohort.cohort.id}/apercu`)
  })

  return loading ? (
    <CircularProgress className={classes.loadingSpinner} size={50} />
  ) : (
    <>
      <Dialog
        fullWidth={true}
        maxWidth="lg"
        open={openModal}
        onClose={() => setOpenModal(false)}
        classes={{ paper: classes.modalContainer }}
      >
        {modalContent}
      </Dialog>
      <Grid direction="row" container classes={{ root: classes.mainContainer }}>
        <InclusionExclusionContainer
          setOpenModal={setOpenModal}
          setModalContent={setModalContent}
          title={'Patients importés'}
          content={<ImportPatientsContent setOpenModal={setOpenModal} setModalContent={setModalContent} />}
        />
        <InclusionExclusionContainer title={'Patients inclus'} content={<InclusionExclusionContent include />} />
        <InclusionExclusionContainer
          title={'Patients exclus'}
          content={<InclusionExclusionContent include={false} />}
        />
      </Grid>
      <div className={classes.footerButtonContainer}>
        <Button className={classes.saveButton} variant="contained" onClick={onSave}>
          {'Sauvegarder'}
        </Button>
      </div>
    </>
  )
}

InclusionExclusionContainer.propType = {
  cohort: PropTypes.object,
  loading: PropTypes.bool
}

export default InclusionExclusionPatientsPanel
