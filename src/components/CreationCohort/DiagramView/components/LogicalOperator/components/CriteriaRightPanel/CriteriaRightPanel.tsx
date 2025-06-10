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

import { CriteriaItemType } from 'types'
import useStyles from './styles'
import { CriteriaType, SelectedCriteriaType } from 'types/requestCriterias'
import { PhotoCameraFront } from '@mui/icons-material'
import { CriteriaState } from 'state/criteria'
import criteriaList from 'components/CreationCohort/DataList_Criteria'
import CriteriaForm from './CriteriaForm'

type CriteriaTypesWithIcons = Exclude<
  CriteriaType,
  CriteriaType.MEDICATION_REQUEST | CriteriaType.MEDICATION_ADMINISTRATION | CriteriaType.QUESTIONNAIRE_RESPONSE
>

type CriteriaListItemProps = {
  criteriaItem: CriteriaItemType
  handleClick: (criteriaItem: CriteriaItemType) => void
}

const CriteriaListItem: React.FC<CriteriaListItemProps> = (props) => {
  const { criteriaItem, handleClick } = props
  const { color, title, formDefinition, subItems, disabled, id, fontWeight, component } = criteriaItem

  const { classes } = useStyles()
  const [open, setOpen] = useState(true)

  const getCriteriaIcon = (id: CriteriaTypesWithIcons) => {
    const mapper = {
      [CriteriaType.REQUEST]: <SavedSearchIcon />,
      [CriteriaType.IPP_LIST]: <PersonSearchIcon />,
      [CriteriaType.PATIENT]: <BarChartIcon />,
      [CriteriaType.ENCOUNTER]: <EventIcon />,
      [CriteriaType.DOCUMENTS]: <DescriptionIcon />,
      [CriteriaType.PMSI]: <MedicalInformationIcon />,
      [CriteriaType.CONDITION]: <ArticleIcon />,
      [CriteriaType.PROCEDURE]: <LocalHospitalIcon />,
      [CriteriaType.CLAIM]: <ContactPageIcon />,
      [CriteriaType.MEDICATION]: <VaccinesIcon />,
      [CriteriaType.BIO_MICRO]: <BiotechIcon />,
      [CriteriaType.OBSERVATION]: <ScienceIcon />,
      [CriteriaType.MICROBIOLOGIE]: <CoronavirusIcon />,
      [CriteriaType.PHYSIOLOGIE]: <MonitorHeartIcon />,
      [CriteriaType.IMAGING]: <PhotoCameraFront />,
      [CriteriaType.SPECIALITY]: <FolderIcon />,
      [CriteriaType.MATERNITY]: <CribIcon />,
      [CriteriaType.PREGNANCY]: <PregnantWomanIcon />,
      [CriteriaType.HOSPIT]: <DomainAddIcon />
    }

    return mapper[id]
  }

  const svgIcon = getCriteriaIcon(id as CriteriaTypesWithIcons)

  const pointer = formDefinition || component ? 'pointer' : 'default'

  const cursor = disabled ? 'not-allowed' : pointer

  if (!subItems || (subItems && subItems.length === 0)) {
    return (
      <ListItem onClick={disabled ? undefined : () => handleClick(criteriaItem)} className={classes.criteriaItem}>
        <ListItemIcon style={{ minWidth: '2rem', color: 'currentcolor' }}>{svgIcon}</ListItemIcon>
        <ListItemText disableTypography style={{ cursor, color, fontWeight }} primary={title} />
      </ListItem>
    )
  }

  return (
    <ListItem
      onClick={disabled ? undefined : () => subItems || handleClick(criteriaItem)}
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
              {subItems?.map((criteriaSubItem, index) => (
                <Fragment key={index + criteriaSubItem.id}>
                  <div className={classes.subItemsIndicator} />
                  <CriteriaListItem criteriaItem={criteriaSubItem} handleClick={handleClick} />
                </Fragment>
              ))}
            </List>
          </Collapse>
        </Grid>
      </Grid>
    </ListItem>
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

  const applyConfigToCriteriaItem = (
    criteriaItem: CriteriaItemType,
    config: {
      [criteriaKey: string]: Partial<CriteriaItemType>
    }
  ) => {
    let updatedCriteriaItem = criteriaItem
    if (config[criteriaItem.id]) {
      updatedCriteriaItem = {
        ...criteriaItem,
        ...config[criteriaItem.id]
      }
    }

    if (criteriaItem.subItems && criteriaItem.subItems.length > 0) {
      updatedCriteriaItem = {
        ...updatedCriteriaItem,
        subItems: criteriaItem.subItems.map((subItem) => applyConfigToCriteriaItem(subItem, config))
      }
    }

    return updatedCriteriaItem
  }

  const criteriaListWithConfig = criteriaList().map((criteriaItem) =>
    applyConfigToCriteriaItem(criteriaItem, criteria.config)
  )
  const { classes } = useStyles()
  const [action, setAction] = useState<CriteriaItemType | null>(null)

  const _onChangeSelectedCriteria = (newSelectedCriteria: SelectedCriteriaType) => {
    const _newSelectedCriteria = {
      ...newSelectedCriteria,
      error: undefined
    }
    onChangeSelectedCriteria(_newSelectedCriteria)
    onClose()
  }

  useEffect(() => {
    if (selectedCriteria && open) {
      const searchChild = (_criteria: CriteriaItemType[] | null): CriteriaItemType | null => {
        if (!_criteria) return null

        for (const criteriaItem of _criteria) {
          const { id, types, subItems } = criteriaItem
          if (id === selectedCriteria.type || types?.includes(selectedCriteria.type)) return criteriaItem

          // Search subcriterias
          if (subItems) {
            const found = searchChild(subItems)
            if (found) {
              return found
            }
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

  const renderCriteriaForm = (criteriaItem: CriteriaItemType) => {
    if (criteriaItem.component) {
      return React.createElement(criteriaItem.component, {
        parentId,
        selectedCriteria,
        onChangeSelectedCriteria: _onChangeSelectedCriteria,
        goBack: () => setAction(null)
      })
    } else if (criteriaItem.formDefinition) {
      return (
        <CriteriaForm
          {...criteriaItem.formDefinition}
          updateData={_onChangeSelectedCriteria}
          goBack={() => setAction(null)}
          data={selectedCriteria ?? undefined}
        />
      )
    }
    return null
  }

  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <div className={classes.root}>
        {action ? (
          renderCriteriaForm(action)
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
                <CriteriaListItem key={index + criteriaItem.id} criteriaItem={criteriaItem} handleClick={setAction} />
              ))}
            </List>
          </>
        )}
      </div>
    </Drawer>
  )
}

export default CriteriaRightPanel
