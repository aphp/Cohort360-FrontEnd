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

type CcamListItemProps = {
  ccamItem: any
  handleClick: (ccamItem: any) => void
  fetchHierarchy: (ccamCode: string) => any
}

const CcamListItem: React.FC<CcamListItemProps> = (props) => {
  const { ccamItem, handleClick, fetchHierarchy } = props
  const { id, color, label } = ccamItem

  const classes = useStyles()
  const [open, setOpen] = useState(false)
  const [subItems, setSubItems] = useState<any>(['loading'])

  const _onExpand = async (ccamCode: string) => {
    setOpen(!open)
    console.log('subItems', subItems)
    if (subItems && subItems[0] === 'loading') {
      const _subItems = await fetchHierarchy(ccamCode)
      setSubItems(_subItems)
    }
  }

  console.log('subItems', subItems)

  if (!subItems || (subItems && Array.isArray(subItems) && subItems.length === 0)) {
    return (
      <ListItem onClick={() => handleClick(ccamItem)} className={classes.ccamItem}>
        <ListItemIcon>
          <div className={classes.indicator} style={{ color }} />
        </ListItemIcon>
        <ListItemText style={{ cursor: 'pointer' }} primary={label} />
      </ListItem>
    )
  }

  return (
    <>
      <ListItem onClick={() => handleClick(ccamItem)} className={classes.ccamItem}>
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
            subItems.map((ccamHierarchySubItem: any, index: number) =>
              ccamHierarchySubItem === 'loading' ? (
                <></>
              ) : (
                <Fragment key={index}>
                  <div className={classes.subItemsIndicator} />
                  <CcamListItem
                    ccamItem={ccamHierarchySubItem}
                    handleClick={() => handleClick(ccamHierarchySubItem)}
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
  onChangeSelectedCriteria: (data: any) => void
}

// const defaultProcedure = {
//     title: "Critères d'actes CCAM",
//     code: [],
//     encounter: 0,
//     startOccurrence: '',
//     endOccurrence: ''
//   }

const CcamHierarchy: React.FC<CcamHierarchyProps> = (props) => {
  const { criteria, selectedCriteria, goBack } = props
  // const defaultValues = selectedCriteria || defaultCondition

  const [ccamHierarchy, onSetCcamHierarchy] = useState([])
  const [selectedHierarchy, onChangeSelectedHierarchy] = useState(null)

  console.log('selectedHierarchy', selectedHierarchy)

  // Init
  useEffect(() => {
    const _init = async () => {
      const newCriteriaTree = await criteria.fetch.fetchCcamHierarchy()
      onSetCcamHierarchy(newCriteriaTree)
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
        {ccamHierarchy.map((ccamItem, index) => (
          <CcamListItem
            key={index}
            ccamItem={ccamItem}
            handleClick={onChangeSelectedHierarchy}
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
        <Button type="submit" form="ccam-form" color="primary" variant="contained">
          Confirmer
        </Button>
      </Grid>
    </Grid>
  )
}

export default CcamHierarchy
