import React, { useState, useEffect, Fragment } from 'react'

import { Drawer, ListItem, ListItemIcon, ListItemText, Collapse, List, Grid, Typography } from '@mui/material'

import ExpandLess from '@mui/icons-material/ExpandLess'
import ExpandMore from '@mui/icons-material/ExpandMore'
import SavedSearchIcon from '@mui/icons-material/SavedSearch'
import PersonSearchIcon from '@mui/icons-material/PersonSearch'
import BarChartIcon from '@mui/icons-material/BarChart'
import EventIcon from '@mui/icons-material/Event'
import DescriptionIcon from '@mui/icons-material/Description'
import MedicalInformationIcon from '@mui/icons-material/MedicalInformation'
import VaccinesIcon from '@mui/icons-material/Vaccines'
import BiotechIcon from '@mui/icons-material/Biotech'
import MonitorHeartIcon from '@mui/icons-material/MonitorHeart'
import ArticleIcon from '@mui/icons-material/Article'
import ContactPageIcon from '@mui/icons-material/ContactPage'
import LocalHospitalIcon from '@mui/icons-material/LocalHospital'
import ScienceIcon from '@mui/icons-material/Science'
import CoronavirusIcon from '@mui/icons-material/Coronavirus'
import { IdType } from 'types'

import { CriteriaItemType, SelectedCriteriaType } from 'types'
import useStyles from './styles'

type CriteriaListItemProps = {
  criteriaItem: CriteriaItemType
  handleClick: (criteriaItem: CriteriaItemType) => void
}

const CriteriaListItem: React.FC<CriteriaListItemProps> = (props) => {
  const { criteriaItem, handleClick } = props
  const { color, title, components, subItems, disabled, id, fontWeight } = criteriaItem

  const { classes } = useStyles()
  const [open, setOpen] = useState(true)

  const svgIcone =
    id === IdType.Request ? (
      <SavedSearchIcon />
    ) : id === IdType.IPPList ? (
      <PersonSearchIcon />
    ) : id === IdType.Patient ? (
      <BarChartIcon />
    ) : id === IdType.Encounter ? (
      <EventIcon />
    ) : id === IdType.DocumentReference ? (
      <DescriptionIcon />
    ) : id === IdType.Pmsi ? (
      <MedicalInformationIcon />
    ) : id === IdType.Condition ? (
      <ArticleIcon />
    ) : id === IdType.Procedure ? (
      <ContactPageIcon />
    ) : id === IdType.Claim ? (
      <LocalHospitalIcon />
    ) : id === IdType.Medication ? (
      <VaccinesIcon />
    ) : id === IdType.Biologie_microbiologie ? (
      <BiotechIcon />
    ) : id === IdType.Observation ? (
      <CoronavirusIcon />
    ) : id === IdType.Microbiologie ? (
      <ScienceIcon />
    ) : id === IdType.Physiologie ? (
      <MonitorHeartIcon />
    ) : (
      <></>
    )

  const cursor = disabled ? 'not-allowed' : components ? 'pointer' : 'default'

  if (!subItems || (subItems && subItems.length === 0)) {
    return (
      <ListItem onClick={disabled ? undefined : () => handleClick(criteriaItem)} className={classes.criteriaItem}>
        <ListItemIcon style={{ minWidth: '2rem', color: 'currentcolor' }}>{svgIcone}</ListItemIcon>
        <ListItemText disableTypography style={{ cursor, color, fontWeight }} primary={title} />
      </ListItem>
    )
  }

  return (
    <>
      <ListItem
        onClick={disabled ? undefined : () => !subItems ?? handleClick(criteriaItem)}
        className={classes.criteriaItem}
      >
        <Grid container flexDirection="column">
          <Grid container flexDirection="row">
            <ListItemIcon style={{ minWidth: '2rem', color: 'currentcolor' }}>{svgIcone}</ListItemIcon>
            <ListItemText
              disableTypography
              style={{ cursor, color, fontWeight }}
              primary={title}
              onClick={() => setOpen(!open)}
            />
            {open ? <ExpandLess onClick={() => setOpen(!open)} /> : <ExpandMore onClick={() => setOpen(!open)} />}
          </Grid>
          <Grid>
            <Collapse in={open} timeout="auto" unmountOnExit>
              <List disablePadding className={classes.subItemsContainer}>
                <div className={classes.subItemsContainerIndicator} />
                {subItems &&
                  subItems.map((criteriaSubItem, index) => (
                    <Fragment key={index}>
                      <div className={classes.subItemsIndicator} />
                      <CriteriaListItem
                        criteriaItem={criteriaSubItem}
                        handleClick={() => handleClick(criteriaSubItem)}
                      />
                    </Fragment>
                  ))}
              </List>
            </Collapse>
          </Grid>
        </Grid>
      </ListItem>
    </>
  )
}

type CriteriaRightPanelProps = {
  parentId: number | null
  criteria: CriteriaItemType[]
  selectedCriteria: SelectedCriteriaType | null
  onChangeSelectedCriteria: (item: SelectedCriteriaType) => void
  open: boolean
  onClose: () => void
}

const CriteriaRightPanel: React.FC<CriteriaRightPanelProps> = (props) => {
  const { open, onClose, parentId, criteria, selectedCriteria, onChangeSelectedCriteria } = props

  const { classes } = useStyles()
  const [action, setAction] = useState<CriteriaItemType | null>(null)

  const DrawerComponent = action ? action.components : null

  const _onChangeSelectedCriteria = (newSelectedCriteria: SelectedCriteriaType) => {
    const _newSelectedCriteria = {
      ...newSelectedCriteria,
      error: undefined
    }
    onChangeSelectedCriteria(_newSelectedCriteria)
    onClose()
  }

  useEffect(() => {
    let _action = null

    if (selectedCriteria) {
      const searchChild: (_criteria: CriteriaItemType[] | null) => void = (_criteria) => {
        if (!_criteria) return

        for (const criteriaItem of _criteria) {
          const { id, subItems } = criteriaItem
          if (subItems) searchChild(subItems)

          if (id === 'Medication') {
            if ('MedicationRequest' === selectedCriteria.type) _action = criteriaItem
            if ('MedicationAdministration' === selectedCriteria.type) _action = criteriaItem
          } else {
            if (id === selectedCriteria.type) _action = criteriaItem
          }
        }
      }
      searchChild(criteria)
    }
    setAction(_action)
  }, [open]) // eslint-disable-line

  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <div className={classes.root}>
        {/* DrawerComponent = action.components */}
        {DrawerComponent ? (
          <DrawerComponent
            parentId={parentId}
            criteria={action}
            selectedCriteria={selectedCriteria}
            onChangeSelectedCriteria={_onChangeSelectedCriteria}
            goBack={() => setAction(null)}
          />
        ) : (
          <>
            <Grid className={classes.drawerTitleContainer}>
              <Typography className={classes.title}>Ajouter un critère</Typography>
            </Grid>

            <List
              aria-labelledby="nested-list-subheader"
              subheader={
                <Typography variant="h5" style={{ margin: '10px 15px' }}>
                  Type de critère
                </Typography>
              }
              className={classes.drawerContentContainer}
            >
              {criteria.map((criteriaItem, index) => (
                <CriteriaListItem key={index} criteriaItem={criteriaItem} handleClick={setAction} />
              ))}
            </List>
          </>
        )}
      </div>
    </Drawer>
  )
}

export default CriteriaRightPanel
