import React, { useEffect, useState, Fragment } from 'react'
import clsx from 'clsx'

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
} from '@mui/material'
import Skeleton from '@mui/lab/Skeleton'

import ExpandLess from '@mui/icons-material/ExpandLess'
import ExpandMore from '@mui/icons-material/ExpandMore'
import KeyboardBackspaceIcon from '@mui/icons-material/KeyboardBackspace'

import { useAppSelector, useAppDispatch } from 'state'
import { PmsiListType, fetchProcedure, expandPmsiElement } from 'state/pmsi'

import { getSelectedPmsi, filterSelectedPmsi, checkIfIndeterminated } from 'utils/pmsi'

import useStyles from './styles'

type ProcedureListItemProps = {
  procedureItem: PmsiListType
  selectedItem?: PmsiListType[] | null
  handleClick: (procedureItem: { id: string; label: string }[] | null) => void
}

const ProcedureListItem: React.FC<ProcedureListItemProps> = (props) => {
  const { procedureItem, selectedItem, handleClick } = props
  const { id, label, subItems } = procedureItem

  const classes = useStyles()
  const dispatch = useAppDispatch()

  const procedureState = useAppSelector((state) => state.pmsi.procedure || {})
  const procedureHierarchy = procedureState.list

  const [open, setOpen] = useState(false)

  const isSelected = selectedItem ? selectedItem.find(({ id }) => id === procedureItem.id) : false
  const isIndeterminated = checkIfIndeterminated(procedureItem, selectedItem)

  const _onExpand = async (procedureCode: string) => {
    setOpen(!open)
    const expandResult = await dispatch<any>(
      expandPmsiElement({
        keyElement: 'procedure',
        rowId: procedureCode,
        selectedItems: selectedItem || []
      })
    )
    if (expandResult.payload.savedSelectedItems) {
      handleClick(expandResult.payload.savedSelectedItems)
    }
  }

  const handleClickOnHierarchy = (procedureItem: PmsiListType) => {
    const newSelectedItems = getSelectedPmsi(procedureItem, selectedItem || [], procedureHierarchy)
    handleClick(newSelectedItems)
  }

  if (!subItems || (subItems && Array.isArray(subItems) && subItems.length === 0)) {
    return (
      <ListItem className={classes.procedureItem}>
        <ListItemIcon>
          <div
            onClick={() => handleClickOnHierarchy(procedureItem)}
            className={clsx(classes.indicator, {
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
          <div
            onClick={() => handleClickOnHierarchy(procedureItem)}
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
            subItems.map((procedureHierarchySubItem: any, index: number) =>
              procedureHierarchySubItem.id === 'loading' ? (
                <Fragment key={index}>
                  <div className={classes.subItemsIndicator} />
                  <Skeleton style={{ flex: 1, margin: '2px 32px' }} height={32} />
                </Fragment>
              ) : (
                <Fragment key={index}>
                  <div className={classes.subItemsIndicator} />
                  <ProcedureListItem
                    procedureItem={procedureHierarchySubItem}
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

type ProcedureHierarchyProps = {
  selectedCriteria: any
  goBack: (data: any) => void
  onChangeSelectedHierarchy: (data: any) => void
  isEdition?: boolean
}

const ProcedureHierarchy: React.FC<ProcedureHierarchyProps> = (props) => {
  const { selectedCriteria, onChangeSelectedHierarchy, goBack, isEdition } = props

  const classes = useStyles()
  const dispatch = useAppDispatch()

  const procedureState = useAppSelector((state) => state.pmsi.procedure || {})
  const procedureHierarchy = procedureState.list

  const [selectedHierarchy, onSetSelectedHierarchy] = useState<{ id: string; label: string }[] | null>(
    isEdition ? selectedCriteria.code : []
  )

  // Init
  useEffect(() => {
    const _init = async () => {
      if (!procedureHierarchy || (procedureHierarchy && procedureHierarchy.length === 0)) {
        dispatch<any>(fetchProcedure())
      }
    }

    _init()
  }, []) // eslint-disable-line

  return (
    <Grid className={classes.root}>
      <Grid className={classes.actionContainer}>
        {!isEdition ? (
          <>
            <IconButton className={classes.backButton} onClick={goBack} size="large">
              <KeyboardBackspaceIcon />
            </IconButton>
            <Divider className={classes.divider} orientation="vertical" flexItem />
            <Typography className={classes.titleLabel}>Ajouter un critère d'acte CCAM</Typography>
          </>
        ) : (
          <Typography className={classes.titleLabel}>Modifier un critère d'acte CCAM</Typography>
        )}
      </Grid>

      <List component="nav" aria-labelledby="nested-list-subheader" className={classes.drawerContentContainer}>
        {procedureHierarchy &&
          procedureHierarchy.map((procedureItem, index) => (
            <ProcedureListItem
              key={index}
              procedureItem={procedureItem}
              selectedItem={selectedHierarchy}
              handleClick={onSetSelectedHierarchy}
            />
          ))}
      </List>

      <Grid className={classes.procedureHierarchyActionContainer}>
        {!isEdition && (
          <Button onClick={goBack} variant="outlined">
            Annuler
          </Button>
        )}
        <Button
          onClick={() => onChangeSelectedHierarchy(filterSelectedPmsi(selectedHierarchy || [], procedureHierarchy))}
          type="submit"
          form="procedure-form"
          variant="contained"
        >
          Confirmer
        </Button>
      </Grid>
    </Grid>
  )
}

export default ProcedureHierarchy
