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
import { PmsiListType } from 'state/pmsi'

import {
  checkIfIndeterminated,
  expandItem,
  findEquivalentRowInItemAndSubItems,
  getHierarchySelection
} from 'utils/pmsi'

import useStyles from './styles'
import { findSelectedInListAndSubItems } from 'utils/cohortCreation'
import { decrementLoadingSyncHierarchyTable, incrementLoadingSyncHierarchyTable } from 'state/syncHierarchyTable'
import { defaultCondition } from '../../index'
import { HierarchyTree } from 'types'
import { Cim10DataType } from 'types/requestCriterias'

type CimListItemProps = {
  cim10Item: PmsiListType
  selectedItems?: PmsiListType[] | null
  handleClick: (cimItem: PmsiListType[] | null | undefined, newHierarchy?: PmsiListType[]) => void
}

const CimListItem: React.FC<CimListItemProps> = (props) => {
  const { cim10Item, selectedItems, handleClick } = props
  const { id, label, subItems } = cim10Item

  const { classes, cx } = useStyles()
  const dispatch = useAppDispatch()

  const cim10Hierarchy = useAppSelector((state) => state.pmsi.condition.list || {})
  const isLoadingsyncHierarchyTable = useAppSelector((state) => state.syncHierarchyTable.loading || 0)
  const isLoadingPmsi = useAppSelector((state) => state.pmsi.syncLoading || 0)

  const [open, setOpen] = useState(false)
  const isSelected = findSelectedInListAndSubItems(selectedItems ? selectedItems : [], cim10Item, cim10Hierarchy)
  const isIndeterminated = checkIfIndeterminated(cim10Item, selectedItems)
  const _onExpand = async (cim10Code: string) => {
    if (isLoadingsyncHierarchyTable > 0 || isLoadingPmsi > 0) return
    dispatch(incrementLoadingSyncHierarchyTable())
    setOpen(!open)
    const newHierarchy = await expandItem(
      cim10Code,
      selectedItems || [],
      cim10Hierarchy,
      defaultCondition.type,
      dispatch
    )
    await handleClick(selectedItems, newHierarchy)
    dispatch(decrementLoadingSyncHierarchyTable())
  }

  const handleClickOnHierarchy = async (cim10Item: PmsiListType) => {
    if (isLoadingsyncHierarchyTable > 0 || isLoadingPmsi > 0) return
    dispatch(incrementLoadingSyncHierarchyTable())
    const newSelectedItems = getHierarchySelection(cim10Item, selectedItems || [], cim10Hierarchy)
    await handleClick(newSelectedItems)
    dispatch(decrementLoadingSyncHierarchyTable())
  }

  if (!subItems || (subItems && Array.isArray(subItems) && subItems.length === 0)) {
    return (
      <ListItem className={classes.cimItem}>
        <ListItemIcon>
          <div
            onClick={() => handleClickOnHierarchy(cim10Item)}
            className={cx(classes.indicator, {
              [classes.selectedIndicator]: isSelected,
              [classes.indeterminateIndicator]: isIndeterminated
            })}
            style={{ color: '#0063af', cursor: 'pointer' }}
          />
        </ListItemIcon>
        <Tooltip title={label} enterDelay={2500}>
          <ListItemText onClick={() => handleClickOnHierarchy(cim10Item)} className={classes.label} primary={label} />
        </Tooltip>
      </ListItem>
    )
  }

  return (
    <>
      <ListItem className={classes.cimItem}>
        <ListItemIcon>
          <div
            onClick={() => handleClickOnHierarchy(cim10Item)}
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
          {subItems &&
            subItems.map((cimHierarchySubItem, index: number) =>
              cimHierarchySubItem.id === 'loading' ? (
                <Fragment key={index}>
                  <div className={classes.subItemsIndicator} />
                  <Skeleton style={{ flex: 1, margin: '2px 32px' }} height={32} />
                </Fragment>
              ) : (
                <Fragment key={index}>
                  <div className={classes.subItemsIndicator} />
                  <CimListItem
                    cim10Item={cimHierarchySubItem}
                    selectedItems={selectedItems}
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

type Cim10HierarchyProps = {
  isOpen: boolean
  selectedCriteria: Cim10DataType
  goBack: () => void
  onChangeSelectedHierarchy: (data: PmsiListType[] | null | undefined, newHierarchy?: PmsiListType[]) => void
  isEdition?: boolean
  onConfirm: () => void
}

const Cim10Hierarchy: React.FC<Cim10HierarchyProps> = (props) => {
  const { isOpen = false, selectedCriteria, onChangeSelectedHierarchy, onConfirm, goBack, isEdition } = props

  const { classes } = useStyles()
  const initialState: HierarchyTree | null = useAppSelector((state) => state.syncHierarchyTable)
  const isLoadingSyncHierarchyTable = initialState?.loading ?? 0
  const isLoadingPmsi = useAppSelector((state) => state.pmsi.syncLoading || 0)
  const [currentState, setCurrentState] = useState({ ...selectedCriteria, ...initialState })
  const [loading, setLoading] = useState(isLoadingSyncHierarchyTable > 0 || isLoadingPmsi > 0)

  const cim10Hierarchy = useAppSelector((state) => state.pmsi.condition.list || {})

  useEffect(() => {
    const newList = { ...selectedCriteria, ...initialState } ?? {}
    if (!newList.code) {
      newList.code = selectedCriteria.code
    }
    newList.code?.map((item: PmsiListType) => findEquivalentRowInItemAndSubItems(item, cim10Hierarchy).equivalentRow)
    setCurrentState(newList)
  }, [initialState, cim10Hierarchy])

  const _handleClick = (newSelectedItems: PmsiListType[] | null | undefined, newHierarchy?: PmsiListType[]) => {
    onChangeSelectedHierarchy(newSelectedItems, newHierarchy)
  }
  useEffect(() => {
    if (isLoadingSyncHierarchyTable > 0 || isLoadingPmsi > 0) {
      setLoading(true)
    } else if (isLoadingSyncHierarchyTable === 0 && isLoadingPmsi === 0) {
      setLoading(false)
    }
  }, [isLoadingSyncHierarchyTable, isLoadingPmsi])

  return isOpen ? (
    <>
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
        <div className={classes.loader}>{loading && <LinearProgress />}</div>
        <List component="nav" aria-labelledby="nested-list-subheader" className={classes.drawerContentContainer}>
          {cim10Hierarchy &&
            cim10Hierarchy.map((cim10Item, index) => (
              <CimListItem
                key={index}
                cim10Item={cim10Item}
                selectedItems={currentState.code}
                handleClick={_handleClick}
              />
            ))}
        </List>

        <Grid className={classes.cimHierarchyActionContainer}>
          {!isEdition && (
            <Button onClick={goBack} color="primary" variant="outlined">
              Annuler
            </Button>
          )}
          <Button onClick={() => onConfirm()} type="submit" form="cim10-form" color="primary" variant="contained">
            Suivant
          </Button>
        </Grid>
      </Grid>
    </>
  ) : (
    <></>
  )
}

export default Cim10Hierarchy
