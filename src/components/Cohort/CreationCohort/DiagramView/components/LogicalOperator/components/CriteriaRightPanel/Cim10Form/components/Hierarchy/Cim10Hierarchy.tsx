import React, { useEffect, useState, Fragment } from 'react'
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
import { PmsiListType, fetchCondition, expandPmsiElement } from 'state/pmsi'

import { getSelectedPmsi, filterSelectedPmsi } from 'utils/pmsi'

import useStyles from './styles'

type CimListItemProps = {
  cimItem: PmsiListType
  selectedItem?: PmsiListType[] | null
  handleClick: (cimItem: { id: string; label: string }[] | null) => void
  fetchHierarchy: (cimCode: string) => any
}

const CimListItem: React.FC<CimListItemProps> = (props) => {
  const { cimItem, selectedItem, handleClick, fetchHierarchy } = props
  const { id, label, subItems } = cimItem

  const classes = useStyles()
  const dispatch = useDispatch()

  const conditionState = useAppSelector((state) => state.pmsi.condition || {})
  const cimHierarchy = conditionState.list

  const [open, setOpen] = useState(false)

  const isSelected = selectedItem ? selectedItem.find(({ id }) => id === cimItem.id) : false

  const _onExpand = async (cimCode: string) => {
    setOpen(!open)
    const expandResult = await dispatch<any>(
      expandPmsiElement({
        keyElement: 'condition',
        rowId: cimCode,
        selectedItems: selectedItem || []
      })
    )
    if (expandResult.payload.savedSelectedItems) {
      handleClick(expandResult.payload.savedSelectedItems)
    }
  }

  const handleClickOnHierarchy = (cimItem: PmsiListType) => {
    const newSelectedItems = getSelectedPmsi(cimItem, selectedItem || [], cimHierarchy)
    handleClick(newSelectedItems)
  }

  if (!subItems || (subItems && Array.isArray(subItems) && subItems.length === 0)) {
    return (
      <ListItem className={classes.cimItem}>
        <ListItemIcon>
          <div
            onClick={() => handleClickOnHierarchy(cimItem)}
            className={`${classes.indicator} ${isSelected ? classes.selectedIndicator : ''}`}
            style={{ color: '#0063af', cursor: 'pointer' }}
          />
        </ListItemIcon>
        <Tooltip title={label} enterDelay={2500}>
          <ListItemText onClick={() => handleClickOnHierarchy(cimItem)} className={classes.label} primary={label} />
        </Tooltip>
      </ListItem>
    )
  }

  return (
    <>
      <ListItem className={classes.cimItem}>
        <ListItemIcon>
          <div
            onClick={() => handleClickOnHierarchy(cimItem)}
            className={`${classes.indicator} ${isSelected ? classes.selectedIndicator : ''}`}
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
            subItems.map((cimHierarchySubItem: any, index: number) =>
              cimHierarchySubItem.id === 'loading' ? (
                <Fragment key={index}>
                  <div className={classes.subItemsIndicator} />
                  <Skeleton style={{ flex: 1, margin: '2px 32px' }} height={32} />
                </Fragment>
              ) : (
                <Fragment key={index}>
                  <div className={classes.subItemsIndicator} />
                  <CimListItem
                    cimItem={cimHierarchySubItem}
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

type Cim10HierarchyProps = {
  criteria: any
  selectedCriteria: any
  goBack: (data: any) => void
  onChangeSelectedHierarchy: (data: any) => void
  isEdition?: boolean
}

const Cim10Hierarchy: React.FC<Cim10HierarchyProps> = (props) => {
  const { criteria, selectedCriteria, onChangeSelectedHierarchy, goBack, isEdition } = props

  const classes = useStyles()
  const dispatch = useDispatch()

  const conditionState = useAppSelector((state) => state.pmsi.condition || {})
  const cimHierarchy = conditionState.list

  const [selectedHierarchy, onSetSelectedHierarchy] = useState<{ id: string; label: string }[] | null>(
    isEdition ? selectedCriteria.code : []
  )

  // Init
  useEffect(() => {
    const _init = async () => {
      dispatch<any>(fetchCondition())
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
            <Typography className={classes.titleLabel}>Ajouter un critère de diagnostic</Typography>
          </>
        ) : (
          <Typography className={classes.titleLabel}>Modifier un critère de diagnostic</Typography>
        )}
      </Grid>

      <List component="nav" aria-labelledby="nested-list-subheader" className={classes.drawerContentContainer}>
        {cimHierarchy &&
          cimHierarchy.map((cimItem, index) => (
            <CimListItem
              key={index}
              cimItem={cimItem}
              selectedItem={selectedHierarchy}
              handleClick={onSetSelectedHierarchy}
              fetchHierarchy={criteria?.fetch?.fetchCim10Hierarchy}
            />
          ))}
      </List>

      <Grid className={classes.cimHierarchyActionContainer}>
        {!isEdition && (
          <Button onClick={goBack} color="primary" variant="outlined">
            Annuler
          </Button>
        )}
        <Button
          onClick={() => onChangeSelectedHierarchy(filterSelectedPmsi(selectedHierarchy || []))}
          type="submit"
          form="cim10-form"
          color="primary"
          variant="contained"
        >
          Confirmer
        </Button>
      </Grid>
    </Grid>
  )
}

export default Cim10Hierarchy
