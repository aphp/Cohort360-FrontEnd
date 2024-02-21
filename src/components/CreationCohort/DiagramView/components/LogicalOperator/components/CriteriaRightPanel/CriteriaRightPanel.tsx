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
import FolderIcon from '@mui/icons-material/Folder'
import CribIcon from '@mui/icons-material/Crib'
import PregnantWomanIcon from '@mui/icons-material/PregnantWoman'
import DomainAddIcon from '@mui/icons-material/DomainAdd'

import { CriteriaItemDataCache, CriteriaItemType } from 'types'
import useStyles from './styles'
import { RessourceType, SelectedCriteriaType } from 'types/requestCriterias'
import { PhotoCameraFront } from '@mui/icons-material'
import { CriteriaState } from 'state/criteria'
import criteriaList from 'components/CreationCohort/DataList_Criteria'

type CriteriaListItemProps = {
  criteriaItem: CriteriaItemType
  handleClick: (criteriaItem: CriteriaItemType) => void
}

const CriteriaListItem: React.FC<CriteriaListItemProps> = (props) => {
  const { criteriaItem, handleClick } = props
  const { color, title, components, subItems, disabled, id, fontWeight } = criteriaItem

  const { classes } = useStyles()
  const [open, setOpen] = useState(true)

  const getCriteriaIcon = (id: string) => {
    switch (id) {
      case RessourceType.REQUEST:
        return <SavedSearchIcon />
      case RessourceType.IPP_LIST:
        return <PersonSearchIcon />
      case RessourceType.PATIENT:
        return <BarChartIcon />
      case RessourceType.ENCOUNTER:
        return <EventIcon />
      case RessourceType.DOCUMENTS:
        return <DescriptionIcon />
      case RessourceType.PMSI:
        return <MedicalInformationIcon />
      case RessourceType.CONDITION:
        return <ArticleIcon />
      case RessourceType.PROCEDURE:
        return <LocalHospitalIcon />
      case RessourceType.CLAIM:
        return <ContactPageIcon />
      case RessourceType.MEDICATION:
        return <VaccinesIcon />
      case RessourceType.BIO_MICRO:
        return <BiotechIcon />
      case RessourceType.OBSERVATION:
        return <ScienceIcon />
      case RessourceType.MICROBIOLOGIE:
        return <CoronavirusIcon />
      case RessourceType.PHYSIOLOGIE:
        return <MonitorHeartIcon />
      case RessourceType.IMAGING:
        return <PhotoCameraFront />
      case RessourceType.SPECIALITY:
        return <FolderIcon />
      case RessourceType.MATERNITY:
        return <CribIcon />
      case RessourceType.PREGNANCY:
        return <PregnantWomanIcon />
      case RessourceType.HOSPIT:
        return <DomainAddIcon />
      default:
        return <></>
    }
  }

  const svgIcon = getCriteriaIcon(id)

  const cursor = disabled ? 'not-allowed' : components ? 'pointer' : 'default'

  if (!subItems || (subItems && subItems.length === 0)) {
    return (
      <ListItem onClick={disabled ? undefined : () => handleClick(criteriaItem)} className={classes.criteriaItem}>
        <ListItemIcon style={{ minWidth: '2rem', color: 'currentcolor' }}>{svgIcon}</ListItemIcon>
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
            <ListItemIcon style={{ minWidth: '2rem', color: 'currentcolor' }}>{svgIcon}</ListItemIcon>
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
                      <CriteriaListItem criteriaItem={criteriaSubItem} handleClick={handleClick} />
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
  criteria: CriteriaState
  selectedCriteria: SelectedCriteriaType | null
  onChangeSelectedCriteria: (item: SelectedCriteriaType) => void
  open: boolean
  onClose: () => void
}

const CriteriaRightPanel: React.FC<CriteriaRightPanelProps> = (props) => {
  const { open, onClose, parentId, criteria, selectedCriteria, onChangeSelectedCriteria } = props
  const criteriaListWithConfig = criteriaList.map((criteriaItem) => {
    if (criteria.config[criteriaItem.id]) {
      return {
        ...criteriaItem,
        ...criteria.config[criteriaItem.id]
      }
    }
    return criteriaItem
  })

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
    if (selectedCriteria) {
      const searchChild = (_criteria: CriteriaItemType[] | null): CriteriaItemType | null => {
        if (!_criteria) return null

        for (const criteriaItem of _criteria) {
          const { id, subItems } = criteriaItem
          if (subItems) {
            const found = searchChild(subItems)
            if (found) {
              return found
            }
          }

          if (id === 'Medication') {
            if (RessourceType.MEDICATION_REQUEST === selectedCriteria.type) return criteriaItem
            if (RessourceType.MEDICATION_ADMINISTRATION === selectedCriteria.type) return criteriaItem
          } else {
            if (id === selectedCriteria.type) return criteriaItem
          }
        }
        return null
      }
      const criteriaItem = searchChild(criteriaListWithConfig)
      setAction(criteriaItem)
    } else {
      setAction(null)
    }
  }, [open]) // eslint-disable-line

  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <div className={classes.root}>
        {/* DrawerComponent = action.components */}
        {DrawerComponent && action ? (
          <DrawerComponent
            parentId={parentId}
            criteriaData={
              criteria.cache.find((c) => c.criteriaType === action.id) ||
              ({ criteriaType: action.id, data: {} } as CriteriaItemDataCache)
            }
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
              {criteriaListWithConfig.map((criteriaItem, index) => (
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
