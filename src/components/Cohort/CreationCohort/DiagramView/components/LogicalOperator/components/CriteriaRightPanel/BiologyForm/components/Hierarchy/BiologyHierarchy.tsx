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
import { BiologyListType, fetchBiology, expandBiologyElement } from 'state/biology'

import { getSelectedPmsi, filterSelectedPmsi, checkIfIndeterminated } from 'utils/pmsi'

import useStyles from './styles'

type BiologyListItemProps = {
  biologyItem: BiologyListType
  selectedItem?: BiologyListType[] | null
  handleClick: (biologyItem: { id: string; label: string }[] | null) => void
}

const BiologyListItem: React.FC<BiologyListItemProps> = (props) => {
  const { biologyItem, selectedItem, handleClick } = props
  const { id, label, subItems } = biologyItem

  const classes = useStyles()
  const dispatch = useDispatch()

  const biologyState = useAppSelector((state) => state.biology || {})
  const biologyHierarchy = biologyState.list

  const [open, setOpen] = useState(false)

  const isSelected = selectedItem ? selectedItem.find(({ id }) => id === biologyItem.id) : false
  const isIndeterminated = checkIfIndeterminated(biologyItem, selectedItem)

  const _onExpand = async (biologyCode: string) => {
    setOpen(!open)
    const expandResult = await dispatch<any>(
      expandBiologyElement({
        rowId: biologyCode,
        selectedItems: selectedItem || []
      })
    )
    if (expandResult.payload.savedSelectedItems) {
      handleClick(expandResult.payload.savedSelectedItems)
    }
  }

  const handleClickOnHierarchy = (biologyItem: BiologyListType) => {
    const newSelectedItems = getSelectedPmsi(biologyItem, selectedItem || [], biologyHierarchy)
    handleClick(newSelectedItems)
  }

  if (!subItems || (subItems && Array.isArray(subItems) && subItems.length === 0)) {
    return (
      <ListItem className={classes.biologyItem}>
        <ListItemIcon>
          <div
            onClick={() => handleClickOnHierarchy(biologyItem)}
            className={clsx(classes.indicator, {
              [classes.selectedIndicator]: isSelected,
              [classes.indeterminateIndicator]: isIndeterminated
            })}
            style={{ color: '#0063af', cursor: 'pointer' }}
          />
        </ListItemIcon>
        <Tooltip title={label} enterDelay={2500}>
          <ListItemText onClick={() => handleClickOnHierarchy(biologyItem)} className={classes.label} primary={label} />
        </Tooltip>
      </ListItem>
    )
  }

  return (
    <>
      <ListItem className={classes.biologyItem}>
        <ListItemIcon>
          <div
            onClick={() => handleClickOnHierarchy(biologyItem)}
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
            subItems.map((biologyHierarchySubItem: any, index: number) =>
              biologyHierarchySubItem.id === 'loading' ? (
                <Fragment key={index}>
                  <div className={classes.subItemsIndicator} />
                  <Skeleton style={{ flex: 1, margin: '2px 32px' }} height={32} />
                </Fragment>
              ) : (
                <Fragment key={index}>
                  <div className={classes.subItemsIndicator} />
                  <BiologyListItem
                    biologyItem={biologyHierarchySubItem}
                    selectedItem={selectedItem}
                    handleClick={handleClick}
                  />
                </Fragment>
              )
            )}
        </List>
      </Collapse>
    </>
  )
}

type BiologyHierarchyProps = {
  selectedCriteria: any
  goBack: (data: any) => void
  onChangeSelectedHierarchy: (data: any) => void
  isEdition?: boolean
}

const BiologyHierarchy: React.FC<BiologyHierarchyProps> = (props) => {
  const { selectedCriteria, onChangeSelectedHierarchy, goBack, isEdition } = props

  const classes = useStyles()
  const dispatch = useDispatch()

  const biologyState = useAppSelector((state) => state.biology || {})
  const biologyHierarchy = biologyState.list

  const [selectedHierarchy, onSetSelectedHierarchy] = useState<{ id: string; label: string }[] | null>(
    isEdition ? selectedCriteria.code : []
  )

  // Init
  useEffect(() => {
    const _init = async () => {
      if (!biologyHierarchy || (biologyHierarchy && biologyHierarchy.length === 0)) {
        dispatch<any>(fetchBiology())
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
            <Typography className={classes.titleLabel}>Ajouter un critère de biologie</Typography>
          </>
        ) : (
          <Typography className={classes.titleLabel}>Modifier un critère de biologie</Typography>
        )}
      </Grid>

      <List component="nav" aria-labelledby="nested-list-subheader" className={classes.drawerContentContainer}>
        {biologyHierarchy &&
          biologyHierarchy.map((biologyItem, index) => (
            <BiologyListItem
              key={index}
              biologyItem={biologyItem}
              selectedItem={selectedHierarchy}
              handleClick={onSetSelectedHierarchy}
            />
          ))}
      </List>

      <Grid className={classes.biologyHierarchyActionContainer}>
        {!isEdition && (
          <Button onClick={goBack} color="primary" variant="outlined">
            Annuler
          </Button>
        )}
        <Button
          onClick={() => onChangeSelectedHierarchy(filterSelectedPmsi(selectedHierarchy || [], biologyHierarchy))}
          type="submit"
          form="biology-form"
          color="primary"
          variant="contained"
        >
          Confirmer
        </Button>
      </Grid>
    </Grid>
  )
}

export default BiologyHierarchy
