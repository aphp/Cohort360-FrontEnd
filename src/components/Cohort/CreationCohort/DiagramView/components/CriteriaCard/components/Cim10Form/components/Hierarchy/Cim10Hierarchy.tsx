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
  List
} from '@material-ui/core'
import ExpandLess from '@material-ui/icons/ExpandLess'
import ExpandMore from '@material-ui/icons/ExpandMore'
import KeyboardBackspaceIcon from '@material-ui/icons/KeyboardBackspace'

import useStyles from './styles'

type CimListItemProps = {
  cimItem: any
  handleClick: (cimItem: any) => void
  fetchHierarchy: (cimCode: string) => any
}

const CimListItem: React.FC<CimListItemProps> = (props) => {
  const { cimItem, handleClick, fetchHierarchy } = props
  const { id, color, label } = cimItem

  const classes = useStyles()
  const [open, setOpen] = useState(false)
  const [subItems, setSubItems] = useState<any>(['loading'])

  const _onExpand = async (cimCode: string) => {
    setOpen(!open)
    const _subItems = await fetchHierarchy(cimCode)
    setSubItems(_subItems)
  }

  if (!subItems || (subItems && Array.isArray(subItems) && subItems.length === 0)) {
    return (
      <ListItem onClick={() => handleClick(cimItem)} className={classes.cimItem}>
        <ListItemIcon>
          <div className={classes.indicator} style={{ color }} />
        </ListItemIcon>
        <ListItemText style={{ cursor: 'pointer' }} primary={label} />
      </ListItem>
    )
  }

  return (
    <>
      <ListItem onClick={() => handleClick(cimItem)} className={classes.cimItem}>
        <ListItemIcon>
          <div className={classes.indicator} style={{ color }} />
        </ListItemIcon>
        <ListItemText style={{ cursor: 'pointer' }} primary={label} />
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
                    handleClick={() => handleClick(cimHierarchySubItem)}
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
  onChangeSelectedCriteria: (data: any) => void
}

// const defaultCondition = {
//   title: 'Critère de diagnostic',
//   code: [],
//   diagnosticType: '',
//   startOccurrence: '',
//   endOccurrence: ''
// }

const Cim10Hierarchy: React.FC<Cim10HierarchyProps> = (props) => {
  const { criteria, selectedCriteria, goBack } = props
  // const defaultValues = selectedCriteria || defaultCondition

  const [cimHierarchy, onSetCimHieerarchy] = useState([])
  const [selectedHierarchy, onChangeSelectedHierarchy] = useState(null)

  console.log('selectedHierarchy', selectedHierarchy)

  // Init
  useEffect(() => {
    const _init = async () => {
      const newCriteriaTree = await criteria.fetch.fetchCim10Hierarchy()
      onSetCimHieerarchy(newCriteriaTree)
    }

    _init()
  }, []) // eslint-disable-line

  const classes = useStyles()

  const isEdition = selectedCriteria !== null ? true : false
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
            handleClick={onChangeSelectedHierarchy}
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
        <Button type="submit" form="cim10-form" color="primary" variant="contained">
          Confirmer
        </Button>
      </Grid>
    </Grid>
  )
}

export default Cim10Hierarchy
