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

type CimListItemProps = {
  cimItem: any
  selectedItem?: any
  handleClick: (cimItem: any) => void
  fetchHierarchy: (cimCode: string) => any
}

const CimListItem: React.FC<CimListItemProps> = (props) => {
  const { cimItem, selectedItem, handleClick, fetchHierarchy } = props
  const { id, color, label } = cimItem

  const classes = useStyles()
  const [open, setOpen] = useState(false)
  const [subItems, setSubItems] = useState<any>(['loading'])

  const isSelected = selectedItem ? cimItem.id === selectedItem.id : false

  const _onExpand = async (cimCode: string) => {
    setOpen(!open)
    if (subItems && subItems[0] === 'loading') {
      const _subItems = await fetchHierarchy(cimCode)
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

  if (!subItems || (subItems && Array.isArray(subItems) && subItems.length === 0)) {
    return (
      <ListItem className={classes.cimItem}>
        <ListItemIcon>
          <div
            className={`${classes.indicator} ${isSelected ? classes.selectedIndicator : ''}`}
            style={{ color: '#0063af' }}
          />
        </ListItemIcon>
        <Tooltip title={label} enterDelay={2500}>
          <ListItemText
            className={classes.label}
            primary={label}
            onClick={() => handleClick(isSelected ? null : cimItem)}
          />
        </Tooltip>
      </ListItem>
    )
  }

  return (
    <>
      <ListItem className={classes.cimItem}>
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
            subItems.map((cimHierarchySubItem: any, index: number) =>
              cimHierarchySubItem === 'loading' ? (
                <></>
              ) : (
                <Fragment key={index}>
                  <div className={classes.subItemsIndicator} />
                  <CimListItem
                    cimItem={cimHierarchySubItem}
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

type Cim10HierarchyProps = {
  criteria: any
  selectedCriteria: any
  goBack: (data: any) => void
  onChangeSelectedHierarchy: (data: any) => void
  isEdition?: boolean
}

const Cim10Hierarchy: React.FC<Cim10HierarchyProps> = (props) => {
  const { criteria, selectedCriteria, onChangeSelectedHierarchy, goBack, isEdition } = props

  const classes = useStyles()
  const [cimHierarchy, onSetCimHieerarchy] = useState([])
  const [selectedHierarchy, onSetSelectedHierarchy] = useState(isEdition ? selectedCriteria.code : null)

  // Init
  useEffect(() => {
    const _init = async () => {
      const newCriteriaTree = await criteria.fetch.fetchCim10Hierarchy()
      onSetCimHieerarchy(newCriteriaTree)
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
            <Typography className={classes.titleLabel}>Ajouter un critère de diagnostic</Typography>
          </>
        ) : (
          <Typography className={classes.titleLabel}>Modifier un critère de diagnostic</Typography>
        )}
      </Grid>

      <List component="nav" aria-labelledby="nested-list-subheader" className={classes.drawerContentContainer}>
        {cimHierarchy.map((cimItem, index) => (
          <CimListItem
            key={index}
            cimItem={cimItem}
            selectedItem={selectedHierarchy}
            handleClick={onSetSelectedHierarchy}
            fetchHierarchy={criteria?.fetch?.fetchCim10Hierarchy}
          />
        ))}
      </List>

      <Grid className={classes.cimHierarchyActionContainer}>
        {!isEdition && (
          <Button onClick={goBack} color="primary" variant="outlined">
            Annuler
          </Button>
        )}
        <Button
          onClick={() => onChangeSelectedHierarchy(selectedHierarchy)}
          type="submit"
          form="cim10-form"
          color="primary"
          variant="contained"
        >
          Confirmer
        </Button>
      </Grid>
    </Grid>
  )
}

export default Cim10Hierarchy
