import React, { Fragment, useEffect, useState } from 'react'

import {
  Button,
  Collapse,
  Divider,
  Grid,
  IconButton,
  LinearProgress,
  ListItem,
  ListItemIcon,
  ListItemText,
  List,
  Skeleton,
  Tooltip,
  Typography
} from '@mui/material'

import ExpandLess from '@mui/icons-material/ExpandLess'
import ExpandMore from '@mui/icons-material/ExpandMore'
import KeyboardBackspaceIcon from '@mui/icons-material/KeyboardBackspace'

import { useAppDispatch, useAppSelector } from 'state'
import { BiologyListType } from 'state/biology'

import {
  checkIfIndeterminated,
  expandItem,
  findEquivalentRowInItemAndSubItems,
  getHierarchySelection
} from 'utils/pmsi'

import useStyles from './styles'
import { PmsiListType } from 'state/pmsi'
import { decrementLoadingSyncHierarchyTable, incrementLoadingSyncHierarchyTable } from 'state/syncHierarchyTable'
import { findSelectedInListAndSubItems } from 'utils/cohortCreation'
import { defaultBiology } from '../../index'
import { HierarchyTree } from 'types'

type BiologyListItemProps = {
  biologyItem: BiologyListType
  selectedItems?: PmsiListType[] | null
  handleClick: (biologyItem: PmsiListType[] | null | undefined, newHierarchy?: PmsiListType[]) => void
}

const BiologyListItem: React.FC<BiologyListItemProps> = (props) => {
  const { biologyItem, selectedItems, handleClick } = props
  const { id, label, subItems } = biologyItem

  const { classes, cx } = useStyles()
  const dispatch = useAppDispatch()

  const biologyHierarchy = useAppSelector((state) => state.biology.list || {})
  const isLoadingsyncHierarchyTable = useAppSelector((state) => state.syncHierarchyTable.loading || 0)
  const isLoadingPmsi = useAppSelector((state) => state.pmsi.syncLoading || 0)

  const [open, setOpen] = useState(false)
  const isSelected = findSelectedInListAndSubItems(selectedItems ? selectedItems : [], biologyItem, biologyHierarchy)
  const isIndeterminated = checkIfIndeterminated(biologyItem, selectedItems)
  const _onExpand = async (biologyCode: string) => {
    if (isLoadingsyncHierarchyTable > 0 || isLoadingPmsi > 0) return
    dispatch(incrementLoadingSyncHierarchyTable())
    setOpen(!open)
    const newHierarchy = await expandItem(
      biologyCode,
      selectedItems || [],
      biologyHierarchy,
      defaultBiology.type,
      dispatch
    )
    await handleClick(selectedItems, newHierarchy)
    dispatch(decrementLoadingSyncHierarchyTable())
  }

  const handleClickOnHierarchy = async (biologyItem: PmsiListType) => {
    if (isLoadingsyncHierarchyTable > 0 || isLoadingPmsi > 0) return
    dispatch(incrementLoadingSyncHierarchyTable())
    const newSelectedItems = getHierarchySelection(biologyItem, selectedItems || [], biologyHierarchy)
    await handleClick(newSelectedItems)
    dispatch(decrementLoadingSyncHierarchyTable())
  }

  if (!subItems || (subItems && Array.isArray(subItems) && subItems.length === 0)) {
    return (
      <ListItem className={classes.biologyItem}>
        <ListItemIcon>
          <div
            onClick={() => handleClickOnHierarchy(biologyItem)}
            className={cx(classes.indicator, {
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

type BiologyHierarchyProps = {
  isOpen: boolean
  selectedCriteria: any
  goBack: (data: any) => void
  onChangeSelectedHierarchy: (data: PmsiListType[] | null | undefined, newHierarchy?: PmsiListType[]) => void
  isEdition?: boolean
  onConfirm: () => void
}

const BiologyHierarchy: React.FC<BiologyHierarchyProps> = (props) => {
  const { isOpen = false, selectedCriteria, onChangeSelectedHierarchy, onConfirm, goBack, isEdition } = props
  const { classes } = useStyles()

  const initialState: HierarchyTree | null = useAppSelector((state) => state.syncHierarchyTable)
  const isLoadingSyncHierarchyTable = initialState?.loading ?? 0
  const isLoadingPmsi = useAppSelector((state) => state.pmsi.syncLoading || 0)
  const [currentState, setCurrentState] = useState({ ...selectedCriteria, ...initialState })
  const [loading, setLoading] = useState(isLoadingSyncHierarchyTable > 0 || isLoadingPmsi > 0)

  const biologyHierarchy = useAppSelector((state) => state.biology.list || {})

  useEffect(() => {
    const newList = { ...selectedCriteria, ...initialState } ?? {}
    if (!newList.code) {
      newList.code = selectedCriteria.code
    }
    newList.code.map((item: PmsiListType) => findEquivalentRowInItemAndSubItems(item, biologyHierarchy).equivalentRow)
    setCurrentState(newList)
  }, [initialState, biologyHierarchy, selectedCriteria])

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
              <Typography className={classes.titleLabel}>Ajouter un critère de biologie</Typography>
            </>
          ) : (
            <Typography className={classes.titleLabel}>Modifier un critère de biologie</Typography>
          )}
        </Grid>

        <div className={classes.loader}>{loading && <LinearProgress />}</div>
        <List component="nav" aria-labelledby="nested-list-subheader" className={classes.drawerContentContainer}>
          {biologyHierarchy &&
            biologyHierarchy.map((biologyItem, index) => (
              <BiologyListItem
                key={index}
                biologyItem={biologyItem}
                selectedItems={currentState.code}
                handleClick={_handleClick}
              />
            ))}
        </List>

        <Grid className={classes.biologyHierarchyActionContainer}>
          {!isEdition && (
            <Button onClick={goBack} color="primary" variant="outlined">
              Annuler
            </Button>
          )}
          <Button onClick={() => onConfirm()} type="submit" form="biology-form" color="primary" variant="contained">
            Suivant
          </Button>
        </Grid>
      </Grid>
    </>
  ) : (
    <></>
  )
}

export default BiologyHierarchy
