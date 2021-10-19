import React, { useEffect, useState, Fragment } from 'react'
import clsx from 'clsx'
import { useDispatch } from 'react-redux'

import {
  Button,
  Divider,
  Grid,
  IconButton,
  Typography,
  ListItem,
  ListItemIcon,
  ListItemText,
  Collapse,
  List,
  Tooltip
} from '@material-ui/core'
import Skeleton from '@material-ui/lab/Skeleton'

import ExpandLess from '@material-ui/icons/ExpandLess'
import ExpandMore from '@material-ui/icons/ExpandMore'
import KeyboardBackspaceIcon from '@material-ui/icons/KeyboardBackspace'

import { useAppSelector } from 'state'
import { MedicationListType, fetchMedication, expandMedicationElement } from 'state/medication'

import { getSelectedPmsi, filterSelectedPmsi, checkIfIndeterminated } from 'utils/pmsi'

import useStyles from './styles'

type MedicationListItemProps = {
  medicationItem: MedicationListType
  selectedItem?: MedicationListType[] | null
  handleClick: (medicationItem: { id: string; label: string }[] | null) => void
  fetchHierarchy: (medicationCode: string) => any
}

const MedicationListItem: React.FC<MedicationListItemProps> = (props) => {
  const { medicationItem, selectedItem, handleClick, fetchHierarchy } = props
  const { id, label, subItems } = medicationItem

  const classes = useStyles()
  const dispatch = useDispatch()

  const medicationState = useAppSelector((state) => state.medication || {})
  const medicationHierarchy = medicationState.list

  const [open, setOpen] = useState(false)

  const isSelected = selectedItem ? selectedItem.find(({ id }) => id === medicationItem.id) : false
  const isIndeterminated = checkIfIndeterminated(medicationItem, selectedItem)

  const _onExpand = async (medicationCode: string) => {
    setOpen(!open)
    const expandResult = await dispatch<any>(
      expandMedicationElement({
        rowId: medicationCode,
        selectedItems: selectedItem || []
      })
    )
    if (expandResult.payload.savedSelectedItems) {
      handleClick(expandResult.payload.savedSelectedItems)
    }
  }

  const handleClickOnHierarchy = (medicationItem: MedicationListType) => {
    const newSelectedItems = getSelectedPmsi(medicationItem, selectedItem || [], medicationHierarchy)
    handleClick(newSelectedItems)
  }

  if (!subItems || (subItems && Array.isArray(subItems) && subItems.length === 0)) {
    return (
      <ListItem className={classes.medicationItem}>
        <ListItemIcon>
          <div
            onClick={() => handleClickOnHierarchy(medicationItem)}
            className={clsx(classes.indicator, {
              [classes.selectedIndicator]: isSelected,
              [classes.indeterminateIndicator]: isIndeterminated
            })}
            style={{ color: '#0063af', cursor: 'pointer' }}
          />
        </ListItemIcon>
        <Tooltip title={label} enterDelay={2500}>
          <ListItemText
            onClick={() => handleClickOnHierarchy(medicationItem)}
            className={classes.label}
            primary={label}
          />
        </Tooltip>
      </ListItem>
    )
  }

  return (
    <>
      <ListItem className={classes.medicationItem}>
        <ListItemIcon>
          <div
            onClick={() => handleClickOnHierarchy(medicationItem)}
            className={clsx(classes.indicator, {
              [classes.selectedIndicator]: isSelected,
              [classes.indeterminateIndicator]: isIndeterminated
            })}
            style={{ color: '#0063af', cursor: 'pointer' }}
          />
        </ListItemIcon>
        <Tooltip title={label} enterDelay={2500}>
          <ListItemText onClick={() => _onExpand(id)} className={classes.label} primary={label} />
        </Tooltip>
        {open ? <ExpandLess onClick={() => setOpen(!open)} /> : <ExpandMore onClick={() => _onExpand(id)} />}
      </ListItem>
      <Collapse in={open} timeout="auto" unmountOnExit>
        <List component="div" disablePadding className={classes.subItemsContainer}>
          <div className={classes.subItemsContainerIndicator} />
          {subItems &&
            subItems.map((medicationHierarchySubItem: any, index: number) =>
              medicationHierarchySubItem.id === 'loading' ? (
                <Fragment key={index}>
                  <div className={classes.subItemsIndicator} />
                  <Skeleton style={{ flex: 1, margin: '2px 32px' }} height={32} />
                </Fragment>
              ) : (
                <Fragment key={index}>
                  <div className={classes.subItemsIndicator} />
                  <MedicationListItem
                    medicationItem={medicationHierarchySubItem}
                    selectedItem={selectedItem}
                    handleClick={handleClick}
                    fetchHierarchy={fetchHierarchy}
                  />
                </Fragment>
              )
            )}
        </List>
      </Collapse>
    </>
  )
}

type MedicationHierarchyProps = {
  criteria: any
  selectedCriteria: any
  goBack: (data: any) => void
  onChangeSelectedHierarchy: (data: any) => void
  isEdition?: boolean
}

const MedicationHierarchy: React.FC<MedicationHierarchyProps> = (props) => {
  const { criteria, selectedCriteria, onChangeSelectedHierarchy, goBack, isEdition } = props

  const classes = useStyles()
  const dispatch = useDispatch()

  const medicationState = useAppSelector((state) => state.medication || {})
  const medicationHierarchy = medicationState.list

  const [selectedHierarchy, onSetSelectedHierarchy] = useState<{ id: string; label: string }[] | null>(
    isEdition ? selectedCriteria.code : []
  )

  // Init
  useEffect(() => {
    const _init = async () => {
      if (!medicationHierarchy || (medicationHierarchy && medicationHierarchy.length === 0)) {
        dispatch<any>(fetchMedication())
      }
    }

    _init()
  }, []) // eslint-disable-line

  return (
    <Grid className={classes.root}>
      <Grid className={classes.actionContainer}>
        {!isEdition ? (
          <>
            <IconButton className={classes.backButton} onClick={goBack}>
              <KeyboardBackspaceIcon />
            </IconButton>
            <Divider className={classes.divider} orientation="vertical" flexItem />
            <Typography className={classes.titleLabel}>Ajouter un critère de médicament</Typography>
          </>
        ) : (
          <Typography className={classes.titleLabel}>Modifier un critère de médicament</Typography>
        )}
      </Grid>

      <List component="nav" aria-labelledby="nested-list-subheader" className={classes.drawerContentContainer}>
        {medicationHierarchy &&
          medicationHierarchy.map((medicationItem, index) => (
            <MedicationListItem
              key={index}
              medicationItem={medicationItem}
              selectedItem={selectedHierarchy}
              handleClick={onSetSelectedHierarchy}
              fetchHierarchy={criteria?.fetch?.fetchMedicationHierarchy}
            />
          ))}
      </List>

      <Grid className={classes.medicationHierarchyActionContainer}>
        {!isEdition && (
          <Button onClick={goBack} color="primary" variant="outlined">
            Annuler
          </Button>
        )}
        <Button
          onClick={() => onChangeSelectedHierarchy(filterSelectedPmsi(selectedHierarchy || [], medicationHierarchy))}
          type="submit"
          form="medication10-form"
          color="primary"
          variant="contained"
        >
          Confirmer
        </Button>
      </Grid>
    </Grid>
  )
}

export default MedicationHierarchy
