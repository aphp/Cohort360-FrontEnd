import React, { useState, useEffect, Fragment } from 'react'

import Drawer from '@material-ui/core/Drawer'
import { ListItem, ListItemIcon, ListItemText, Collapse, List, Grid, Typography } from '@material-ui/core'
import ExpandLess from '@material-ui/icons/ExpandLess'
import ExpandMore from '@material-ui/icons/ExpandMore'

import { CriteriaItemType, SelectedCriteriaType } from 'types'
import useStyles from './styles'

type CriteriaListItemProps = {
  criteriaItem: CriteriaItemType
  handleClick: (criteriaItem: CriteriaItemType) => void
}

const CriteriaListItem: React.FC<CriteriaListItemProps> = (props) => {
  const { criteriaItem, handleClick } = props
  const { color, title, components, subItems, disabled } = criteriaItem

  const classes = useStyles()
  const [open, setOpen] = useState(true)

  const cursor = disabled ? 'not-allowed' : components ? 'pointer' : 'default'

  if (!subItems || (subItems && subItems.length === 0)) {
    return (
      <ListItem onClick={disabled ? undefined : () => handleClick(criteriaItem)} className={classes.criteriaItem}>
        <ListItemIcon>
          <div className={classes.indicator} style={{ color }} />
        </ListItemIcon>
        <ListItemText style={{ cursor }} primary={title} />
      </ListItem>
    )
  }

  return (
    <>
      <ListItem onClick={disabled ? undefined : () => handleClick(criteriaItem)} className={classes.criteriaItem}>
        <ListItemIcon>
          <div className={classes.indicator} style={{ color }} />
        </ListItemIcon>
        <ListItemText style={{ cursor }} primary={title} />
        {open ? <ExpandLess onClick={() => setOpen(!open)} /> : <ExpandMore onClick={() => setOpen(!open)} />}
      </ListItem>
      <Collapse in={open} timeout="auto" unmountOnExit>
        <List component="div" disablePadding className={classes.subItemsContainer}>
          <div className={classes.subItemsContainerIndicator} />
          {subItems &&
            subItems.map((criteriaSubItem, index) => (
              <Fragment key={index}>
                <div className={classes.subItemsIndicator} />
                <CriteriaListItem criteriaItem={criteriaSubItem} handleClick={() => handleClick(criteriaSubItem)} />
              </Fragment>
            ))}
        </List>
      </Collapse>
    </>
  )
}

type CriteriaRightPanelProps = {
  criteria: CriteriaItemType[]
  selectedCriteria: SelectedCriteriaType | null
  onChangeSelectedCriteria: (item: SelectedCriteriaType) => void
  open: boolean
  onClose: () => void
}

const CriteriaRightPanel: React.FC<CriteriaRightPanelProps> = (props) => {
  const { open, onClose, criteria, selectedCriteria, onChangeSelectedCriteria } = props

  const classes = useStyles()
  const [action, setAction] = useState<CriteriaItemType | null>(null)

  const DrawerComponent = action ? action.components : null

  const _onChangeSelectedCriteria = (newSelectedCriteria: SelectedCriteriaType) => {
    onChangeSelectedCriteria(newSelectedCriteria)
    onClose()
  }

  useEffect(() => {
    let _action = null

    if (selectedCriteria) {
      const searchChild: (_criteria: CriteriaItemType[] | null) => void = (_criteria) => {
        if (!_criteria) return

        for (const criteriaItem of _criteria) {
          const { id, subItems } = criteriaItem
          if (subItems) searchChild(subItems)

          if (id === selectedCriteria.type) _action = criteriaItem
        }
      }
      searchChild(criteria)
    }
    setAction(_action)
  }, [open]) // eslint-disable-line

  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <div className={classes.root}>
        {/* DrawerComponent = action.components */}
        {DrawerComponent ? (
          <DrawerComponent
            criteria={action}
            selectedCriteria={selectedCriteria}
            onChangeSelectedCriteria={_onChangeSelectedCriteria}
            goBack={() => setAction(null)}
          />
        ) : (
          <>
            <Grid className={classes.drawerTitleContainer}>
              <Typography className={classes.title}>Ajouter un critère</Typography>
            </Grid>
            <List
              component="nav"
              aria-labelledby="nested-list-subheader"
              subheader={
                <Typography variant="h5" style={{ margin: '10px 15px' }}>
                  Type de critère
                </Typography>
              }
              className={classes.drawerContentContainer}
            >
              {criteria.map((criteriaItem, index) => (
                <CriteriaListItem key={index} criteriaItem={criteriaItem} handleClick={setAction} />
              ))}
            </List>
          </>
        )}
      </div>
    </Drawer>
  )
}

export default CriteriaRightPanel
