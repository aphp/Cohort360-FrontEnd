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

type GhmListItemProps = {
  ghmItem: any
  selectedItem?: { id: string; label: string }[] | null
  handleClick: (ghmItem: any) => void
  fetchHierarchy: (ghmCode: string) => any
}

const GhmListItem: React.FC<GhmListItemProps> = (props) => {
  const { ghmItem, selectedItem, handleClick, fetchHierarchy } = props
  const { id, color, label } = ghmItem

  const classes = useStyles()
  const [open, setOpen] = useState(false)
  const [subItems, setSubItems] = useState<any>(['loading'])

  const isSelected = selectedItem ? selectedItem.find(({ id }) => id === ghmItem.id) : false

  const _onExpand = async (ghmCode: string) => {
    setOpen(!open)
    if (subItems && subItems[0] === 'loading') {
      const _subItems = await fetchHierarchy(ghmCode)
      setSubItems(_subItems)
    }
  }

  useEffect(() => {
    const _init = async () => {
      const _subItems = await fetchHierarchy(id)
      setSubItems(_subItems)
    }

    _init()
  }, []) // eslint-disable-line

  const handleClickOnHierarchy = (ghmItem: { id: string; label: string }) => {
    let _selectedItem = selectedItem ? [...selectedItem] : []
    const foundItem = _selectedItem ? _selectedItem.find(({ id }) => id === ghmItem.id) : undefined
    const index = foundItem !== undefined ? _selectedItem.indexOf(foundItem) : -1

    if (index !== -1) {
      _selectedItem?.splice(index, 1)
    } else {
      _selectedItem = [..._selectedItem, ghmItem]
    }
    handleClick(_selectedItem)
  }

  if (!subItems || (subItems && Array.isArray(subItems) && subItems.length === 0)) {
    return (
      <ListItem className={classes.ghmItem}>
        <ListItemIcon>
          <div
            className={`${classes.indicator} ${isSelected ? classes.selectedIndicator : ''}`}
            style={{ color: '#0063af' }}
          />
        </ListItemIcon>
        <Tooltip title={label} enterDelay={2500}>
          <ListItemText className={classes.label} primary={label} onClick={() => handleClickOnHierarchy(ghmItem)} />
        </Tooltip>
      </ListItem>
    )
  }

  return (
    <>
      <ListItem className={classes.ghmItem}>
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
            subItems.map((ghmHierarchySubItem: any, index: number) =>
              ghmHierarchySubItem === 'loading' ? (
                <Fragment key={index} />
              ) : (
                <Fragment key={index}>
                  <div className={classes.subItemsIndicator} />
                  <GhmListItem
                    selectedItem={selectedItem}
                    ghmItem={ghmHierarchySubItem}
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

type GhmHierarchyProps = {
  isEdition: boolean
  criteria: any
  selectedCriteria: any
  goBack: (data: any) => void
  onChangeSelectedHierarchy: (data: any) => void
}

const GhmHierarchy: React.FC<GhmHierarchyProps> = (props) => {
  const { isEdition, criteria, selectedCriteria, goBack, onChangeSelectedHierarchy } = props

  const classes = useStyles()
  const [ghmHierarchy, onSetGhmHierarchy] = useState([])
  const [selectedHierarchy, onSetSelectedHierarchy] = useState<{ id: string; label: string }[] | null>(
    isEdition ? selectedCriteria.code : []
  )

  // Init
  useEffect(() => {
    const _init = async () => {
      const newCriteriaTree = await criteria.fetch.fetchGhmHierarchy()
      onSetGhmHierarchy(newCriteriaTree)
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
              selectedItem={selectedHierarchy}
              key={index}
              ghmItem={ghmItem}
              handleClick={onSetSelectedHierarchy}
              fetchHierarchy={criteria?.fetch?.fetchGhmHierarchy}
            />
          ))}
      </List>

      <Grid className={classes.ghmHierarchyActionContainer}>
        {!isEdition && (
          <Button onClick={goBack} color="primary" variant="outlined">
            Annuler
          </Button>
        )}
        <Button
          onClick={() => onChangeSelectedHierarchy(selectedHierarchy)}
          type="submit"
          form="ghm-form"
          color="primary"
          variant="contained"
        >
          Confirmer
        </Button>
      </Grid>
    </Grid>
  )
}

export default GhmHierarchy
