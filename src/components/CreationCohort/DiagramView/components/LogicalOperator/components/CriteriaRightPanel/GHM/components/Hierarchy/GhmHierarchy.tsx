import React, { Fragment, useEffect, useState } from 'react'

import {
  Button,
  Collapse,
  Divider,
  Grid,
  IconButton,
  LinearProgress,
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

import { useAppDispatch, useAppSelector } from 'state'

import {
  checkIfIndeterminated,
  expandItem,
  findEquivalentRowInItemAndSubItems,
  getHierarchySelection
} from 'utils/pmsi'

import useStyles from './styles'
import { decrementLoadingSyncHierarchyTable, incrementLoadingSyncHierarchyTable } from 'state/syncHierarchyTable'
import { findSelectedInListAndSubItems } from 'utils/cohortCreation'
import { defaultClaim } from '../../index'
import { HierarchyTree } from 'types'
import { GhmDataType } from 'types/requestCriterias'
import { Hierarchy } from 'types/hierarchy'

type GhmListItemProps = {
  ghmItem: Hierarchy<any, any>
  selectedItems?: Hierarchy<any, any>[] | null
  handleClick: (ghmItem: Hierarchy<any, any>[] | null | undefined, newHierarchy?: Hierarchy<any, any>[]) => void
}

const GhmListItem: React.FC<GhmListItemProps> = (props) => {
  const { ghmItem, selectedItems, handleClick } = props
  const { id, label, subItems } = ghmItem

  const { classes, cx } = useStyles()
  const dispatch = useAppDispatch()

  const ghmHierarchy = useAppSelector((state) => state.pmsi.claim.list || {})
  const isLoadingsyncHierarchyTable = useAppSelector((state) => state.syncHierarchyTable.loading ?? 0)
  const isLoadingPmsi = useAppSelector((state) => state.pmsi.syncLoading ?? 0)

  const [open, setOpen] = useState(false)
  const isSelected = findSelectedInListAndSubItems(selectedItems ?? [], ghmItem, ghmHierarchy)
  const isIndeterminated = checkIfIndeterminated(ghmItem, selectedItems)
  const _onExpand = async (ghmCode: string) => {
    if (isLoadingsyncHierarchyTable > 0 || isLoadingPmsi > 0) return
    dispatch(incrementLoadingSyncHierarchyTable())
    setOpen(!open)
    const newHierarchy = await expandItem(ghmCode, selectedItems || [], ghmHierarchy, defaultClaim.type, dispatch)
    handleClick(selectedItems, newHierarchy)
    dispatch(decrementLoadingSyncHierarchyTable())
  }

  const handleClickOnHierarchy = async (ghmItem: Hierarchy<any, any>) => {
    if (isLoadingsyncHierarchyTable > 0 || isLoadingPmsi > 0) return
    dispatch(incrementLoadingSyncHierarchyTable())
    const newSelectedItems = getHierarchySelection(ghmItem, selectedItems || [], ghmHierarchy)
    handleClick(newSelectedItems)
    dispatch(decrementLoadingSyncHierarchyTable())
  }

  if (!subItems || (subItems && Array.isArray(subItems) && subItems.length === 0)) {
    return (
      <ListItem className={classes.ghmItem}>
        <ListItemIcon>
          <button
            onClick={() => handleClickOnHierarchy(ghmItem)}
            className={cx(classes.indicator, {
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
          <button
            onClick={() => handleClickOnHierarchy(ghmItem)}
            className={cx(classes.indicator, {
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
          {subItems?.map((ghmHierarchySubItem: Hierarchy<any, any>, index: number) =>
            ghmHierarchySubItem.id === 'loading' ? (
              <Fragment key={index + ghmHierarchySubItem.id}>
                <div className={classes.subItemsIndicator} />
                <Skeleton style={{ flex: 1, margin: '2px 32px' }} height={32} />
              </Fragment>
            ) : (
              <Fragment key={index + ghmHierarchySubItem.id}>
                <div className={classes.subItemsIndicator} />
                <GhmListItem ghmItem={ghmHierarchySubItem} selectedItems={selectedItems} handleClick={handleClick} />
              </Fragment>
            )
          )}
        </List>
      </Collapse>
    </>
  )
}

type GhmHierarchyProps = {
  isOpen: boolean
  selectedCriteria: GhmDataType
  goBack: () => void
  onChangeSelectedHierarchy: (
    data: Hierarchy<any, any>[] | null | undefined,
    newHierarchy?: Hierarchy<any, any>[]
  ) => void
  onConfirm: () => void
  isEdition?: boolean
}

const GhmHierarchy: React.FC<GhmHierarchyProps> = (props) => {
  const { isOpen = false, selectedCriteria, onChangeSelectedHierarchy, onConfirm, goBack, isEdition } = props

  const { classes } = useStyles()
  const initialState: HierarchyTree | null = useAppSelector((state) => state.syncHierarchyTable)
  const isLoadingSyncHierarchyTable = initialState?.loading ?? 0
  const isLoadingPmsi = useAppSelector((state) => state.pmsi.syncLoading ?? 0)
  const [currentState, setCurrentState] = useState({ ...selectedCriteria, ...initialState })
  const [loading, setLoading] = useState(isLoadingSyncHierarchyTable > 0 || isLoadingPmsi > 0)

  const ghmHierarchy = useAppSelector((state) => state.pmsi.claim.list || {})

  const _handleClick = (
    newSelectedItems: Hierarchy<any, any>[] | null | undefined,
    newHierarchy?: Hierarchy<any, any>[]
  ) => {
    onChangeSelectedHierarchy(newSelectedItems, newHierarchy)
  }

  useEffect(() => {
    const newList = { ...selectedCriteria, ...initialState }
    if (!newList.code) {
      newList.code = selectedCriteria.code
    }
    newList.code?.map(
      (item: Hierarchy<any, any>) => findEquivalentRowInItemAndSubItems(item, ghmHierarchy).equivalentRow
    )
    setCurrentState(newList)
  }, [initialState, ghmHierarchy, selectedCriteria])

  useEffect(() => {
    if (isLoadingSyncHierarchyTable > 0 || isLoadingPmsi > 0) {
      setLoading(true)
    } else if (isLoadingSyncHierarchyTable === 0 && isLoadingPmsi === 0) {
      setLoading(false)
    }
  }, [isLoadingSyncHierarchyTable, isLoadingPmsi])

  return isOpen ? (
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
      <div className={classes.loader}>{loading && <LinearProgress />}</div>
      <List component="nav" aria-labelledby="nested-list-subheader" className={classes.drawerContentContainer}>
        {ghmHierarchy?.map((ghmItem, index) => (
          <GhmListItem
            key={index + ghmItem.id}
            ghmItem={ghmItem}
            selectedItems={currentState.code}
            handleClick={_handleClick}
          />
        ))}
      </List>

      <Grid className={classes.ghmHierarchyActionContainer}>
        {!isEdition && (
          <Button onClick={goBack} color="primary" variant="outlined">
            Annuler
          </Button>
        )}
        <Button onClick={() => onConfirm()} type="submit" form="ghm10-form" color="primary" variant="contained">
          Suivant
        </Button>
      </Grid>
    </Grid>
  ) : (
    <></>
  )
}

export default GhmHierarchy
