import React, { Fragment, useEffect, useState } from 'react'
import InfiniteScroll from 'react-infinite-scroll-component'

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
  Typography,
  Select,
  MenuItem
} from '@mui/material'

import ExpandLess from '@mui/icons-material/ExpandLess'
import ExpandMore from '@mui/icons-material/ExpandMore'
import KeyboardBackspaceIcon from '@mui/icons-material/KeyboardBackspace'

import { useAppDispatch, useAppSelector } from 'state'
import { MedicationListType } from 'state/medication'

import {
  checkIfIndeterminated,
  expandItem,
  findEquivalentRowInItemAndSubItems,
  getHierarchySelection
} from 'utils/pmsi'

import useStyles from './styles'
import { findSelectedInListAndSubItems } from 'utils/cohortCreation'
import { decrementLoadingSyncHierarchyTable, incrementLoadingSyncHierarchyTable } from 'state/syncHierarchyTable'
import { defaultMedication } from '../../index'
import { PmsiListType } from 'state/pmsi'
import { HierarchyTree } from 'types'

type MedicationListItemProps = {
  medicationItem: MedicationListType
  selectedItems?: MedicationListType[] | null
  handleClick: (medicationItem: PmsiListType[] | null | undefined, newHierarchy?: PmsiListType[]) => void
  setLoading: (isLoading: boolean) => void
  valueSetSystem?: 'ATC' | 'UCD'
}

const MedicationListItem: React.FC<MedicationListItemProps> = (props) => {
  const { medicationItem, selectedItems, handleClick, setLoading, valueSetSystem } = props
  const { id, label, subItems } = medicationItem

  const { classes, cx } = useStyles()
  const dispatch = useAppDispatch()

  const medicationHierarchy = useAppSelector((state) => state.medication.list || {})
  const isLoadingsyncHierarchyTable = useAppSelector((state) => state.syncHierarchyTable.loading || 0)
  const isLoadingMedication = useAppSelector((state) => state.medication.syncLoading || 0)

  const [open, setOpen] = useState(false)
  const isSelected = findSelectedInListAndSubItems(
    selectedItems ? selectedItems : [],
    medicationItem,
    medicationHierarchy,
    valueSetSystem
  )
  const isIndeterminated = checkIfIndeterminated(medicationItem, selectedItems)

  const _onExpand = async (medicationCode: string) => {
    if (isLoadingsyncHierarchyTable > 0 || isLoadingMedication > 0) return
    dispatch(incrementLoadingSyncHierarchyTable())
    setOpen(!open)
    const newHierarchy = await expandItem(
      medicationCode,
      selectedItems || [],
      medicationHierarchy,
      defaultMedication.type,
      dispatch
    )
    await handleClick(selectedItems, newHierarchy)
    dispatch(decrementLoadingSyncHierarchyTable())
  }

  const handleClickOnHierarchy = (medicationItem: MedicationListType) => {
    if (isLoadingsyncHierarchyTable > 0 || isLoadingMedication > 0) return
    dispatch(incrementLoadingSyncHierarchyTable())
    const newSelectedItems = getHierarchySelection(medicationItem, selectedItems || [], medicationHierarchy)
    handleClick(newSelectedItems)
    dispatch(decrementLoadingSyncHierarchyTable())
  }

  if (!subItems || (subItems && Array.isArray(subItems) && subItems.length === 0)) {
    return (
      <ListItem className={classes.medicationItem}>
        <ListItemIcon>
          <div
            onClick={() => handleClickOnHierarchy(medicationItem)}
            className={cx(classes.indicator, {
              [classes.selectedIndicator]: isSelected,
              [classes.indeterminateIndicator]: isSelected ? false : isIndeterminated
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
            className={cx(classes.indicator, {
              [classes.selectedIndicator]: isSelected,
              [classes.indeterminateIndicator]: isSelected ? false : isIndeterminated
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
                    selectedItems={selectedItems}
                    handleClick={handleClick}
                    setLoading={setLoading}
                  />
                </Fragment>
              )
            )}
        </List>
      </Collapse>
    </>
  )
}

type MedicationExplorationProps = {
  isOpen: boolean
  selectedCriteria: any
  goBack: (data: any) => void
  onChangeSelectedHierarchy: (data: PmsiListType[] | null | undefined, newHierarchy?: PmsiListType[]) => void
  onConfirm: () => void
  isEdition?: boolean
}

const MedicationExploration: React.FC<MedicationExplorationProps> = (props) => {
  const { isOpen = false, selectedCriteria, onChangeSelectedHierarchy, onConfirm, goBack, isEdition } = props

  const { classes } = useStyles()
  const initialState: HierarchyTree | null = useAppSelector((state) => state.syncHierarchyTable)
  const isLoadingSyncHierarchyTable: number = initialState?.loading ?? 0
  const isLoadingMedication: number = useAppSelector((state) => state.medication.syncLoading || 0)
  const [currentState, setCurrentState] = useState({ ...selectedCriteria, ...initialState })
  const [loading, setLoading] = useState(isLoadingSyncHierarchyTable > 0 || isLoadingMedication > 0)
  const [selectState, setSelectState] = useState<'ATC' | 'UCD'>('ATC')
  const medicationHierarchy = useAppSelector((state) => state.medication.list || {})
  const medicationListUCD = useAppSelector((state) => state.medication.ucdList || {})
  const [paginateData, setPaginateData] = useState<MedicationListType[]>([])
  const [page, setPage] = useState<number>(1)
  const page_size = 100

  const _handleClick = async (newSelectedItems: PmsiListType[] | null | undefined, hierarchy?: PmsiListType[]) => {
    onChangeSelectedHierarchy(newSelectedItems, hierarchy)
  }

  const fetchPaginateData = () => {
    const nextPaginateData = medicationListUCD.slice((page - 1) * page_size, page * page_size)
    setPaginateData([...paginateData, ...nextPaginateData])
    setPage(page + 1)
  }

  useEffect(() => {
    fetchPaginateData()
  }, [])

  useEffect(() => {
    const newList = { ...selectedCriteria, ...initialState } ?? {}
    if (!newList.code) {
      newList.code = selectedCriteria.code
    }
    newList.code.map(
      (item: PmsiListType) => findEquivalentRowInItemAndSubItems(item, medicationHierarchy).equivalentRow
    )
    setCurrentState(newList)
  }, [initialState, medicationHierarchy])

  useEffect(() => {
    if (isLoadingSyncHierarchyTable > 0 || isLoadingMedication > 0) {
      setLoading(true)
    } else if (isLoadingSyncHierarchyTable === 0 && isLoadingMedication === 0) {
      setLoading(false)
    }
  }, [isLoadingSyncHierarchyTable, isLoadingMedication])

  return isOpen ? (
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

      <div className={classes.loader}>{loading && <LinearProgress />}</div>
      <Grid container>
        <Typography>Référentiel : </Typography>
        <Select
          style={{ marginRight: '1em' }}
          id="criteria-occurrenceComparator-select"
          value={selectState}
          onChange={(event) => setSelectState(event.target.value as 'ATC' | 'UCD')}
        >
          <MenuItem value={'ATC'}>{'Médicament ATC'}</MenuItem>
          <MenuItem value={'UCD'}>{'SMT - Médicament - UCD'}</MenuItem>
        </Select>
      </Grid>
      {selectState === 'ATC' && medicationHierarchy && (
        <List component="nav" aria-labelledby="nested-list-subheader" className={classes.drawerContentContainer}>
          {medicationHierarchy.map((medicationItem, index) => (
            <MedicationListItem
              key={index}
              medicationItem={medicationItem}
              selectedItems={currentState.code}
              handleClick={_handleClick}
              setLoading={setLoading}
              valueSetSystem={selectState}
            />
          ))}
        </List>
      )}

      {selectState === 'UCD' && paginateData && (
        <List
          id="scrollableDiv"
          component="nav"
          aria-labelledby="nested-list-subheader"
          className={classes.drawerContentContainer}
        >
          <InfiniteScroll
            scrollableTarget="scrollableDiv"
            dataLength={paginateData.length}
            next={fetchPaginateData}
            hasMore={paginateData.length < medicationListUCD.length}
            loader={<div>Loading...</div>}
          >
            {paginateData.map((medicationItem, index) => (
              <MedicationListItem
                key={index}
                medicationItem={medicationItem}
                selectedItems={currentState.code}
                handleClick={_handleClick}
                setLoading={setLoading}
                valueSetSystem={selectState}
              />
            ))}
          </InfiniteScroll>
        </List>
      )}

      <Grid className={classes.medicationHierarchyActionContainer}>
        {!isEdition && (
          <Button onClick={goBack} variant="outlined">
            Annuler
          </Button>
        )}
        <Button onClick={() => onConfirm()} type="submit" form="medication10-form" color="primary" variant="contained">
          Suivant
        </Button>
      </Grid>
    </Grid>
  ) : (
    <></>
  )
}

export default MedicationExploration
