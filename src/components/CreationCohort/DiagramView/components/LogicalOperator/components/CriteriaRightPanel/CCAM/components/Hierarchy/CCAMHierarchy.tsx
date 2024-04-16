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
import { defaultProcedure } from '../../index'
import { HierarchyTree } from 'types'
import { CcamDataType } from 'types/requestCriterias'
import { Hierarchy, HierarchyElementWithSystem } from 'types/hierarchy'

type ProcedureListItemProps = {
  procedureItem: HierarchyElementWithSystem
  selectedItems?: HierarchyElementWithSystem[] | null
  handleClick: (
    procedureItem: HierarchyElementWithSystem[] | null | undefined,
    newHierarchy?: HierarchyElementWithSystem[]
  ) => void
}

const ProcedureListItem: React.FC<ProcedureListItemProps> = (props) => {
  const { procedureItem, selectedItems, handleClick } = props
  const { id, label, subItems } = procedureItem

  const { classes, cx } = useStyles()
  const dispatch = useAppDispatch()

  const procedureHierarchy = useAppSelector((state) => state.pmsi.procedure.list)
  const isLoadingsyncHierarchyTable = useAppSelector((state) => state.syncHierarchyTable.loading ?? 0)
  const isLoadingPmsi = useAppSelector((state) => state.pmsi.syncLoading ?? 0)

  const [open, setOpen] = useState(false)
  const isSelected = findSelectedInListAndSubItems(selectedItems ?? [], procedureItem, procedureHierarchy)
  const isIndeterminated = checkIfIndeterminated(procedureItem, selectedItems)
  const _onExpand = async (procedureCode: string) => {
    if (isLoadingsyncHierarchyTable > 0 || isLoadingPmsi > 0) return
    dispatch(incrementLoadingSyncHierarchyTable())
    setOpen(!open)
    const newHierarchy = await expandItem(
      procedureCode,
      selectedItems || [],
      procedureHierarchy,
      defaultProcedure.type,
      dispatch
    )
    handleClick(selectedItems, newHierarchy)
    dispatch(decrementLoadingSyncHierarchyTable())
  }

  const handleClickOnHierarchy = async (procedureItem: HierarchyElementWithSystem) => {
    if (isLoadingsyncHierarchyTable > 0 || isLoadingPmsi > 0) return
    dispatch(incrementLoadingSyncHierarchyTable())
    const newSelectedItems = getHierarchySelection(procedureItem, selectedItems || [], procedureHierarchy)
    handleClick(newSelectedItems)
    dispatch(decrementLoadingSyncHierarchyTable())
  }

  if (!subItems || (subItems && Array.isArray(subItems) && subItems.length === 0)) {
    return (
      <ListItem className={classes.procedureItem}>
        <ListItemIcon>
          <button
            onClick={() => handleClickOnHierarchy(procedureItem)}
            className={cx(classes.indicator, {
              [classes.selectedIndicator]: isSelected,
              [classes.indeterminateIndicator]: isIndeterminated
            })}
            style={{ color: '#0063af', cursor: 'pointer' }}
          />
        </ListItemIcon>
        <Tooltip title={label} enterDelay={2500}>
          <ListItemText
            onClick={() => handleClickOnHierarchy(procedureItem)}
            className={classes.label}
            primary={label}
          />
        </Tooltip>
      </ListItem>
    )
  }

  return (
    <>
      <ListItem className={classes.procedureItem}>
        <ListItemIcon>
          <button
            onClick={() => handleClickOnHierarchy(procedureItem)}
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
          {subItems?.map((subItem: Hierarchy<any, any>, index: number) =>
            subItem.id === 'loading' ? (
              <Fragment key={index + subItem.id}>
                <div className={classes.subItemsIndicator} />
                <Skeleton style={{ flex: 1, margin: '2px 32px' }} height={32} />
              </Fragment>
            ) : (
              <Fragment key={index + subItem.id}>
                <div className={classes.subItemsIndicator} />
                <ProcedureListItem procedureItem={subItem} selectedItems={selectedItems} handleClick={handleClick} />
              </Fragment>
            )
          )}
        </List>
      </Collapse>
    </>
  )
}

type ProcedureHierarchyProps = {
  isOpen: boolean
  selectedCriteria: CcamDataType
  goBack: () => void
  onChangeSelectedHierarchy: (
    data: HierarchyElementWithSystem[] | null | undefined,
    newHierarchy?: HierarchyElementWithSystem[]
  ) => void
  isEdition?: boolean
  onConfirm: () => void
}

const ProcedureHierarchy: React.FC<ProcedureHierarchyProps> = (props) => {
  const { isOpen = false, selectedCriteria, onChangeSelectedHierarchy, onConfirm, goBack, isEdition } = props

  const { classes } = useStyles()
  const initialState: HierarchyTree | null = useAppSelector((state) => state.syncHierarchyTable)
  const isLoadingSyncHierarchyTable = initialState?.loading ?? 0
  const isLoadingPmsi = useAppSelector((state) => state.pmsi.syncLoading ?? 0)
  const [currentState, setCurrentState] = useState({ ...selectedCriteria, ...initialState })
  const [loading, setLoading] = useState(isLoadingSyncHierarchyTable > 0 || isLoadingPmsi > 0)

  const ccamHierarchy = useAppSelector((state) => state.pmsi.procedure.list || {})

  useEffect(() => {
    const newList = { ...selectedCriteria, ...initialState }
    if (!newList.code) {
      newList.code = selectedCriteria.code
    }
    newList.code?.map(
      (item: HierarchyElementWithSystem) => findEquivalentRowInItemAndSubItems(item, ccamHierarchy).equivalentRow
    )
    setCurrentState(newList)
  }, [initialState, ccamHierarchy, selectedCriteria])

  const _handleClick = (
    newSelectedItems: HierarchyElementWithSystem[] | null | undefined,
    newHierarchy?: HierarchyElementWithSystem[]
  ) => {
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
    <Grid className={classes.root}>
      <Grid className={classes.actionContainer}>
        {!isEdition ? (
          <>
            <IconButton className={classes.backButton} onClick={goBack}>
              <KeyboardBackspaceIcon />
            </IconButton>
            <Divider className={classes.divider} orientation="vertical" flexItem />
            <Typography className={classes.titleLabel}>Ajouter un critère d'acte CCAM</Typography>
          </>
        ) : (
          <Typography className={classes.titleLabel}>Modifier un critère d'acte CCAM</Typography>
        )}
      </Grid>
      <div className={classes.loader}>{loading && <LinearProgress />}</div>
      <List component="nav" aria-labelledby="nested-list-subheader" className={classes.drawerContentContainer}>
        {ccamHierarchy?.map((procedureItem, index) => (
          <ProcedureListItem
            key={index + procedureItem.id}
            procedureItem={procedureItem}
            selectedItems={currentState.code}
            handleClick={_handleClick}
          />
        ))}
      </List>

      <Grid className={classes.procedureHierarchyActionContainer}>
        {!isEdition && (
          <Button onClick={goBack} color="primary" variant="outlined">
            Annuler
          </Button>
        )}
        <Button onClick={() => onConfirm()} type="submit" form="procedure-form" color="primary" variant="contained">
          Suivant
        </Button>
      </Grid>
    </Grid>
  ) : (
    <></>
  )
}

export default ProcedureHierarchy
