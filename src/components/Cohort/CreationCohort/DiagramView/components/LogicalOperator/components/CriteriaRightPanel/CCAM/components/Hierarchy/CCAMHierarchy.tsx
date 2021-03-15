import React, { useEffect, useState, Fragment } from 'react'

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
import ExpandLess from '@material-ui/icons/ExpandLess'
import ExpandMore from '@material-ui/icons/ExpandMore'
import KeyboardBackspaceIcon from '@material-ui/icons/KeyboardBackspace'

import useStyles from './styles'

type CcamListItemProps = {
  ccamItem: any
  selectedItem?: { id: string; label: string }[] | null
  handleClick: (ccamItem: { id: string; label: string }[] | null) => void
  fetchHierarchy: (ccamCode: string) => any
}

const CcamListItem: React.FC<CcamListItemProps> = (props) => {
  const { ccamItem, selectedItem, handleClick, fetchHierarchy } = props
  const { id, color, label } = ccamItem

  const classes = useStyles()
  const [open, setOpen] = useState(false)
  const [subItems, setSubItems] = useState<any>(['loading'])

  const isSelected = selectedItem ? selectedItem.find(({ id }) => id === ccamItem.id) : false

  const _onExpand = async (ccamCode: string) => {
    setOpen(!open)
    if (subItems && subItems[0] === 'loading') {
      const _subItems = await fetchHierarchy(ccamCode)
      setSubItems(_subItems)
    }
  }

  useEffect(() => {
    const _init = async () => {
      const _subItems = await fetchHierarchy(id)
      setSubItems(_subItems)
    }

    _init()
  }, []) //eslint-disable-line

  const handleClickOnHierarchy = (ccamItem: { id: string; label: string }) => {
    let _selectedItem = selectedItem ? [...selectedItem] : []
    const foundItem = _selectedItem ? _selectedItem.find(({ id }) => id === ccamItem.id) : undefined
    const index = foundItem !== undefined ? _selectedItem.indexOf(foundItem) : -1

    if (index !== -1) {
      _selectedItem?.splice(index, 1)
    } else {
      _selectedItem = [..._selectedItem, ccamItem]
    }
    handleClick(_selectedItem)
  }

  if (!subItems || (subItems && Array.isArray(subItems) && subItems.length === 0)) {
    return (
      <ListItem className={classes.ccamItem}>
        <ListItemIcon>
          <div
            className={`${classes.indicator} ${isSelected ? classes.selectedIndicator : ''}`}
            style={{ color: '#0063af' }}
          />
        </ListItemIcon>
        <Tooltip title={label} enterDelay={2500}>
          <ListItemText className={classes.label} primary={label} onClick={() => handleClickOnHierarchy(ccamItem)} />
        </Tooltip>
      </ListItem>
    )
  }

  return (
    <>
      <ListItem className={classes.ccamItem}>
        <ListItemIcon>
          <div className={`${classes.indicator} ${isSelected ? classes.selectedIndicator : ''}`} style={{ color }} />
        </ListItemIcon>
        <Tooltip title={label} enterDelay={2500}>
          <ListItemText onClick={() => setOpen(!open)} className={classes.label} primary={label} />
        </Tooltip>
        {open ? <ExpandLess onClick={() => setOpen(!open)} /> : <ExpandMore onClick={() => _onExpand(id)} />}
      </ListItem>
      <Collapse in={open} timeout="auto" unmountOnExit>
        <List component="div" disablePadding className={classes.subItemsContainer}>
          <div className={classes.subItemsContainerIndicator} />
          {subItems &&
            subItems.map((ccamHierarchySubItem: any, index: number) =>
              ccamHierarchySubItem === 'loading' ? (
                <></>
              ) : (
                <Fragment key={index}>
                  <div className={classes.subItemsIndicator} />
                  <CcamListItem
                    ccamItem={ccamHierarchySubItem}
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

type CcamHierarchyProps = {
  criteria: any
  selectedCriteria: any
  goBack: (data: any) => void
  onChangeSelectedHierarchy: (data: any) => void
  isEdition?: boolean
}

const CcamHierarchy: React.FC<CcamHierarchyProps> = (props) => {
  const { criteria, selectedCriteria, goBack, onChangeSelectedHierarchy, isEdition } = props

  const classes = useStyles()
  const [ccamHierarchy, onSetCcamHierarchy] = useState([])
  const [selectedHierarchy, onSetSelectedHierarchy] = useState<{ id: string; label: string }[] | null>(
    isEdition ? selectedCriteria.code : []
  )

  // Init
  useEffect(() => {
    const _init = async () => {
      const newCriteriaTree = await criteria.fetch.fetchCcamHierarchy()
      onSetCcamHierarchy(newCriteriaTree)
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
            <Typography className={classes.titleLabel}>Ajouter un critère d'acte CCAM</Typography>
          </>
        ) : (
          <Typography className={classes.titleLabel}>Modifier un critère d'acte CCAM</Typography>
        )}
      </Grid>

      <List component="nav" aria-labelledby="nested-list-subheader" className={classes.drawerContentContainer}>
        {ccamHierarchy &&
          ccamHierarchy.map((ccamItem, index) => (
            <CcamListItem
              key={index}
              ccamItem={ccamItem}
              handleClick={onSetSelectedHierarchy}
              selectedItem={selectedHierarchy}
              fetchHierarchy={criteria?.fetch?.fetchCcamHierarchy}
            />
          ))}
      </List>

      <Grid className={classes.ccamHierarchyActionContainer}>
        {!isEdition && (
          <Button onClick={goBack} color="primary" variant="outlined">
            Annuler
          </Button>
        )}
        <Button
          onClick={() => onChangeSelectedHierarchy(selectedHierarchy)}
          type="submit"
          form="ccam-form"
          color="primary"
          variant="contained"
        >
          Confirmer
        </Button>
      </Grid>
    </Grid>
  )
}

export default CcamHierarchy
