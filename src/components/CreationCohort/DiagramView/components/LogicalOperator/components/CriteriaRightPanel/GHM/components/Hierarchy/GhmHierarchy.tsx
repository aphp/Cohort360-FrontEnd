import React, { useEffect, useState, Fragment } from 'react'
import clsx from 'clsx'

import {
  Button,
  Collapse,
  Divider,
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Skeleton,
  Tooltip,
  Typography
} from '@mui/material'

import ExpandLess from '@mui/icons-material/ExpandLess'
import ExpandMore from '@mui/icons-material/ExpandMore'
import KeyboardBackspaceIcon from '@mui/icons-material/KeyboardBackspace'

import { useAppSelector, useAppDispatch } from 'state'
import { PmsiListType, fetchClaim, expandPmsiElement } from 'state/pmsi'

import { getSelectedPmsi, filterSelectedPmsi, checkIfIndeterminated } from 'utils/pmsi'

import useStyles from './styles'

type GhmListItemProps = {
  ghmItem: PmsiListType
  selectedItem?: PmsiListType[] | null
  handleClick: (ghmItem: { id: string; label: string }[] | null) => void
}

const GhmListItem: React.FC<GhmListItemProps> = (props) => {
  const { ghmItem, selectedItem, handleClick } = props
  const { id, label, subItems } = ghmItem

  const classes = useStyles()
  const dispatch = useAppDispatch()

  const claimState = useAppSelector((state) => state.pmsi.claim || {})
  const ghmHierarchy = claimState.list

  const [open, setOpen] = useState(false)

  const isSelected = selectedItem ? selectedItem.find(({ id }) => id === ghmItem.id) : false
  const isIndeterminated = checkIfIndeterminated(ghmItem, selectedItem)

  const _onExpand = async (ghmCode: string) => {
    setOpen(!open)
    const expandResult = await dispatch<any>(
      expandPmsiElement({
        keyElement: 'claim',
        rowId: ghmCode,
        selectedItems: selectedItem || []
      })
    )
    if (expandResult.payload.savedSelectedItems) {
      handleClick(expandResult.payload.savedSelectedItems)
    }
  }

  const handleClickOnHierarchy = (ghmItem: PmsiListType) => {
    const newSelectedItems = getSelectedPmsi(ghmItem, selectedItem || [], ghmHierarchy)
    handleClick(newSelectedItems)
  }

  if (!subItems || (subItems && Array.isArray(subItems) && subItems.length === 0)) {
    return (
      <ListItem className={classes.ghmItem}>
        <ListItemIcon>
          <div
            onClick={() => handleClickOnHierarchy(ghmItem)}
            className={clsx(classes.indicator, {
              [classes.selectedIndicator]: isSelected,
              [classes.indeterminateIndicator]: isIndeterminated
            })}
            style={{ color: '#0063af', cursor: 'pointer' }}
          />
        </ListItemIcon>
        <Tooltip title={label} enterDelay={2500}>
          <ListItemText onClick={() => handleClickOnHierarchy(ghmItem)} className={classes.label} primary={label} />
        </Tooltip>
      </ListItem>
    )
  }

  return (
    <>
      <ListItem className={classes.ghmItem}>
        <ListItemIcon>
          <div
            onClick={() => handleClickOnHierarchy(ghmItem)}
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
        {id !== '*' &&
          (open ? <ExpandLess onClick={() => setOpen(!open)} /> : <ExpandMore onClick={() => _onExpand(id)} />)}
      </ListItem>
      <Collapse in={id === '*' ? true : open} timeout="auto" unmountOnExit>
        <List component="div" disablePadding className={classes.subItemsContainer}>
          <div className={classes.subItemsContainerIndicator} />
          {subItems &&
            subItems.map((ghmHierarchySubItem: any, index: number) =>
              ghmHierarchySubItem.id === 'loading' ? (
                <Fragment key={index}>
                  <div className={classes.subItemsIndicator} />
                  <Skeleton style={{ flex: 1, margin: '2px 32px' }} height={32} />
                </Fragment>
              ) : (
                <Fragment key={index}>
                  <div className={classes.subItemsIndicator} />
                  <GhmListItem ghmItem={ghmHierarchySubItem} selectedItem={selectedItem} handleClick={handleClick} />
                </Fragment>
              )
            )}
        </List>
      </Collapse>
    </>
  )
}

type GhmHierarchyProps = {
  selectedCriteria: any
  goBack: (data: any) => void
  onChangeSelectedHierarchy: (data: any) => void
  isEdition?: boolean
}

const GhmHierarchy: React.FC<GhmHierarchyProps> = (props) => {
  const { selectedCriteria, onChangeSelectedHierarchy, goBack, isEdition } = props

  const classes = useStyles()
  const dispatch = useAppDispatch()

  const claimState = useAppSelector((state) => state.pmsi.claim || {})
  const ghmHierarchy = claimState.list

  const [selectedHierarchy, onSetSelectedHierarchy] = useState<{ id: string; label: string }[] | null>(
    isEdition ? selectedCriteria.code : []
  )

  // Init
  useEffect(() => {
    const _init = async () => {
      if (!ghmHierarchy || (ghmHierarchy && ghmHierarchy.length === 0)) {
        dispatch<any>(fetchClaim())
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
            <Typography className={classes.titleLabel}>Ajouter un critère de GHM</Typography>
          </>
        ) : (
          <Typography className={classes.titleLabel}>Modifier un critère de GHM</Typography>
        )}
      </Grid>

      <List component="nav" aria-labelledby="nested-list-subheader" className={classes.drawerContentContainer}>
        {ghmHierarchy &&
          ghmHierarchy.map((ghmItem, index) => (
            <GhmListItem
              key={index}
              ghmItem={ghmItem}
              selectedItem={selectedHierarchy}
              handleClick={onSetSelectedHierarchy}
            />
          ))}
      </List>

      <Grid className={classes.ghmHierarchyActionContainer}>
        {!isEdition && (
          <Button onClick={goBack} variant="outlined">
            Annuler
          </Button>
        )}
        <Button
          onClick={() => onChangeSelectedHierarchy(filterSelectedPmsi(selectedHierarchy || [], ghmHierarchy))}
          type="submit"
          form="ghm10-form"
          variant="contained"
        >
          Confirmer
        </Button>
      </Grid>
    </Grid>
  )
}

export default GhmHierarchy
